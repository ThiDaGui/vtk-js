import * as macro from 'vtk.js/Sources/macro';
import { vec3, mat4 } from 'gl-matrix';
import vtkWebGPUUniformBuffer from 'vtk.js/Sources/Rendering/WebGPU/UniformBuffer';
import vtkViewNode from 'vtk.js/Sources/Rendering/SceneGraph/ViewNode';
import * as vtkMath from 'vtk.js/Sources/Common/Core/Math';
import vtkWebGPUFullScreenQuad from 'vtk.js/Sources/Rendering/WebGPU/FullScreenQuad';

const { vtkDebugMacro } = macro;

const clearFragTemplate = `
//VTK::Renderer::Dec

//VTK::Mapper::Dec

//VTK::TCoord::Dec

//VTK::RenderEncoder::Dec

//VTK::IOStructs::Dec

[[stage(fragment)]]
fn main(
//VTK::IOStructs::Input
)
//VTK::IOStructs::Output
{
  var output: fragmentOutput;

  var computedColor: vec4<f32> = mapperUBO.BackgroundColor;

  //VTK::RenderEncoder::Impl
  return output;
}
`;

// ----------------------------------------------------------------------------
// vtkWebGPURenderer methods
// ----------------------------------------------------------------------------
/* eslint-disable no-bitwise */

function vtkWebGPURenderer(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkWebGPURenderer');

  // Builds myself.
  publicAPI.buildPass = (prepass) => {
    if (prepass) {
      if (!model.renderable) {
        return;
      }

      // make sure we have a camera
      if (!model.renderable.isActiveCameraCreated()) {
        model.renderable.resetCamera();
      }
      publicAPI.updateLights();
      publicAPI.prepareNodes();
      publicAPI.addMissingNode(model.renderable.getActiveCamera());
      publicAPI.addMissingNodes(model.renderable.getViewPropsWithNestedProps());
      publicAPI.removeUnusedNodes();
      publicAPI.updateStabilizedMatrix();
    }
  };

  publicAPI.updateStabilizedMatrix = () => {
    // This method is designed to help with floating point
    // issues when rendering datasets that push the limits of
    // resolutions on float.
    //
    // One of the most common cases is when the dataset is located far
    // away from the origin relative to the clipping range we are looking
    // at. For that case we want to perform the floating point sensitive
    // multiplications on the CPU in double. To this end we want the
    // vertex rendering ops to look something like
    //
    // Compute shifted points and load those into the VBO
    // pointCoordsSC = WorldToStabilizedMatrix * pointCoords;
    //
    // In the vertex shader do the following
    // positionVC = StabilizedToDeviceMatrix * ModelToStabilizedMatrix*vertexIn;
    //
    // We use two matrices because it is expensive to change the
    // WorldToStabilized matrix as we have to reupload all pointCoords
    // So that matrix (MCSCMatrix) is fairly static, the Stabilized to
    // Device matrix is the one that gets updated every time the camera
    // changes.
    //
    // The basic idea is that we should translate the data so that
    // when the center of the view frustum moves a lot
    // we recenter it. The center of the view frustum is roughly
    // camPos + dirOfProj*(far + near)*0.5
    const cam = model.renderable.getActiveCamera();
    const clipRange = cam.getClippingRange();
    const pos = cam.getPositionByReference();
    const dop = cam.getDirectionOfProjectionByReference();
    const center = [];
    const offset = [];
    vec3.scale(offset, dop, 0.5 * (clipRange[0] + clipRange[1]));
    vec3.add(center, pos, offset);
    vec3.sub(offset, center, model.stabilizedCenter);
    const length = vec3.len(offset);
    if (length / (clipRange[1] - clipRange[0]) > model.recenterThreshold) {
      model.stabilizedCenter = center;
      model.stabilizedTime.modified();
    }
  };

  publicAPI.updateLights = () => {
    let count = 0;

    const lights = model.renderable.getLightsByReference();
    for (let index = 0; index < lights.length; ++index) {
      if (lights[index].getSwitch() > 0.0) {
        count++;
      }
    }

    if (!count) {
      vtkDebugMacro('No lights are on, creating one.');
      model.renderable.createLight();
    }

    return count;
  };

  // register pipeline callbacks from a mapper
  publicAPI.registerPipelineCallback = (pipeline, cb) => {
    // if there is a matching pipeline just add the cb
    for (let i = 0; i < model.pipelineCallbacks.length; i++) {
      if (model.pipelineCallbacks[i].pipeline === pipeline) {
        model.pipelineCallbacks[i].callbacks.push(cb);
        return;
      }
    }

    model.pipelineCallbacks.push({ pipeline, callbacks: [cb] });
  };

  publicAPI.updateUBO = () => {
    // make sure the data is up to date
    // has the camera changed?
    const cam = model.renderable.getActiveCamera();
    const webgpuCamera = publicAPI.getViewNodeFor(cam);
    const utime = model.UBO.getSendTime();
    if (
      model.parent.getMTime() > utime ||
      publicAPI.getMTime() > utime ||
      cam.getMTime() > utime ||
      model.renderable.getMTime() > utime
    ) {
      const keyMats = webgpuCamera.getKeyMatrices(publicAPI);
      model.UBO.setArray('WCVCMatrix', keyMats.wcvc);
      model.UBO.setArray('SCPCMatrix', keyMats.scpc);
      model.UBO.setArray('SCVCMatrix', keyMats.scvc);
      model.UBO.setArray('VCPCMatrix', keyMats.vcpc);
      model.UBO.setArray('WCVCNormals', keyMats.normalMatrix);
      model.UBO.setValue('cameraParallel', cam.getParallelProjection());

      const device = model.parent.getDevice();
      model.UBO.sendIfNeeded(device, device.getRendererBindGroupLayout());
    }
  };

  // Renders myself
  publicAPI.opaquePass = (prepass) => {
    if (prepass) {
      // clear last pipelines
      model.pipelineCallbacks = [];

      model.renderEncoder.begin(model.parent.getCommandEncoder());

      publicAPI.updateUBO();
    } else {
      // bind our BindGroup
      // set viewport
      const tsize = publicAPI.getYInvertedTiledSizeAndOrigin();
      model.renderEncoder
        .getHandle()
        .setViewport(
          tsize.lowerLeftU,
          tsize.lowerLeftV,
          tsize.usize,
          tsize.vsize,
          0.0,
          1.0
        );
      // set scissor
      model.renderEncoder
        .getHandle()
        .setScissorRect(
          tsize.lowerLeftU,
          tsize.lowerLeftV,
          tsize.usize,
          tsize.vsize
        );

      publicAPI.clear();

      // loop over registered pipelines
      for (let i = 0; i < model.pipelineCallbacks.length; i++) {
        const pStruct = model.pipelineCallbacks[i];
        const pl = pStruct.pipeline;

        pl.bind(model.renderEncoder);
        const uboidx = pl.getBindGroupLayoutCount(model.UBO.getName());
        model.renderEncoder.setBindGroup(uboidx, model.UBO.getBindGroup());

        for (let cb = 0; cb < pStruct.callbacks.length; cb++) {
          pStruct.callbacks[cb](pl);
        }
      }

      model.renderEncoder.end();
    }
  };

  publicAPI.clear = () => {
    if (model.renderable.getTransparent()) {
      return;
    }

    const device = model.parent.getDevice();
    if (!model.clearFSQ) {
      model.clearFSQ = vtkWebGPUFullScreenQuad.newInstance();
      model.clearFSQ.setDevice(device);
      model.clearFSQ.setPipelineHash('clearfsq');
      model.clearFSQ.setFragmentShaderTemplate(clearFragTemplate);
      const ubo = vtkWebGPUUniformBuffer.newInstance();
      ubo.setName('mapperUBO');
      ubo.addEntry('BackgroundColor', 'vec4<f32>');
      model.clearFSQ.setUBO(ubo);
    }

    const background = model.renderable.getBackgroundByReference();
    model.clearFSQ.getUBO().setArray('BackgroundColor', background);
    model.clearFSQ
      .getUBO()
      .sendIfNeeded(device, device.getMapperBindGroupLayout());
    model.clearFSQ.render(model.renderEncoder, device);
  };

  publicAPI.translucentPass = (prepass) => {
    if (prepass) {
      // clear last pipelines
      model.pipelineCallbacks = [];

      model.renderEncoder.begin(model.parent.getCommandEncoder());

      publicAPI.updateUBO();
    } else {
      // set viewport
      const tsize = publicAPI.getYInvertedTiledSizeAndOrigin();
      model.renderEncoder
        .getHandle()
        .setViewport(
          tsize.lowerLeftU,
          tsize.lowerLeftV,
          tsize.usize,
          tsize.vsize,
          0.0,
          1.0
        );
      // set scissor
      model.renderEncoder
        .getHandle()
        .setScissorRect(
          tsize.lowerLeftU,
          tsize.lowerLeftV,
          tsize.usize,
          tsize.vsize
        );

      // loop over registered pipelines
      for (let i = 0; i < model.pipelineCallbacks.length; i++) {
        const pStruct = model.pipelineCallbacks[i];
        const pl = pStruct.pipeline;

        pl.bind(model.renderEncoder);
        const uboidx = pl.getBindGroupLayoutCount(model.UBO.getName());
        model.renderEncoder.setBindGroup(uboidx, model.UBO.getBindGroup());
        // bind our BindGroup

        for (let cb = 0; cb < pStruct.callbacks.length; cb++) {
          pStruct.callbacks[cb](pl);
        }
      }

      model.renderEncoder.end();
    }
  };

  publicAPI.volumePass = (prepass) => {
    if (prepass) {
      // clear last pipelines
      model.pipelineCallbacks = [];

      model.renderEncoder.begin(model.parent.getCommandEncoder());

      publicAPI.updateUBO();
    } else {
      // set viewport
      const tsize = publicAPI.getYInvertedTiledSizeAndOrigin();
      model.renderEncoder
        .getHandle()
        .setViewport(
          tsize.lowerLeftU,
          tsize.lowerLeftV,
          tsize.usize,
          tsize.vsize,
          0.0,
          1.0
        );
      // set scissor
      model.renderEncoder
        .getHandle()
        .setScissorRect(
          tsize.lowerLeftU,
          tsize.lowerLeftV,
          tsize.usize,
          tsize.vsize
        );

      // loop over registered pipelines
      for (let i = 0; i < model.pipelineCallbacks.length; i++) {
        const pStruct = model.pipelineCallbacks[i];
        const pl = pStruct.pipeline;

        pl.bind(model.renderEncoder);
        const uboidx = pl.getBindGroupLayoutCount(model.UBO.getName());
        model.renderEncoder.setBindGroup(uboidx, model.UBO.getBindGroup());
        // bind our BindGroup

        for (let cb = 0; cb < pStruct.callbacks.length; cb++) {
          pStruct.callbacks[cb](pl);
        }
      }

      model.renderEncoder.end();
    }
  };

  publicAPI.getAspectRatio = () => {
    const size = model.parent.getSizeByReference();
    const viewport = model.renderable.getViewportByReference();
    return (
      (size[0] * (viewport[2] - viewport[0])) /
      ((viewport[3] - viewport[1]) * size[1])
    );
  };

  publicAPI.getYInvertedTiledSizeAndOrigin = () => {
    const res = publicAPI.getTiledSizeAndOrigin();
    const size = model.parent.getSizeByReference();
    res.lowerLeftV = size[1] - res.vsize - res.lowerLeftV;
    return res;
  };

  publicAPI.getTiledSizeAndOrigin = () => {
    const vport = model.renderable.getViewportByReference();

    // if there is no window assume 0 1
    const tileViewPort = [0.0, 0.0, 1.0, 1.0];

    // find the lower left corner of the viewport, taking into account the
    // lower left boundary of this tile
    const vpu = vtkMath.clampValue(vport[0] - tileViewPort[0], 0.0, 1.0);
    const vpv = vtkMath.clampValue(vport[1] - tileViewPort[1], 0.0, 1.0);

    // store the result as a pixel value
    const ndvp = model.parent.normalizedDisplayToDisplay(vpu, vpv);
    const lowerLeftU = Math.round(ndvp[0]);
    const lowerLeftV = Math.round(ndvp[1]);

    // find the upper right corner of the viewport, taking into account the
    // lower left boundary of this tile
    let vpu2 = vtkMath.clampValue(vport[2] - tileViewPort[0], 0.0, 1.0);
    let vpv2 = vtkMath.clampValue(vport[3] - tileViewPort[1], 0.0, 1.0);
    // also watch for the upper right boundary of the tile
    if (vpu2 > tileViewPort[2] - tileViewPort[0]) {
      vpu2 = tileViewPort[2] - tileViewPort[0];
    }
    if (vpv2 > tileViewPort[3] - tileViewPort[1]) {
      vpv2 = tileViewPort[3] - tileViewPort[1];
    }
    const ndvp2 = model.parent.normalizedDisplayToDisplay(vpu2, vpv2);

    // now compute the size of the intersection of the viewport with the
    // current tile
    let usize = Math.round(ndvp2[0]) - lowerLeftU;
    let vsize = Math.round(ndvp2[1]) - lowerLeftV;

    if (usize < 0) {
      usize = 0;
    }
    if (vsize < 0) {
      vsize = 0;
    }

    return { usize, vsize, lowerLeftU, lowerLeftV };
  };

  publicAPI.getPropFromID = (id) => {
    for (let i = 0; i < model.children.length; i++) {
      const res = model.children[i].getPropID
        ? model.children[i].getPropID()
        : -1;
      if (res === id) {
        return model.children[i];
      }
    }
    return null;
  };

  publicAPI.releaseGraphicsResources = () => {
    if (model.selector !== null) {
      model.selector.releaseGraphicsResources();
    }
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  context: null,
  selector: null,
  renderEncoder: null,
  recenterThreshold: 20.0,
  stabilizedCenter: [0.0, 0.0, 0.0],
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkViewNode.extend(publicAPI, model, initialValues);

  model.UBO = vtkWebGPUUniformBuffer.newInstance();
  model.UBO.setName('rendererUBO');
  model.UBO.addEntry('WCVCMatrix', 'mat4x4<f32>');
  model.UBO.addEntry('SCPCMatrix', 'mat4x4<f32>');
  model.UBO.addEntry('SCVCMatrix', 'mat4x4<f32>');
  model.UBO.addEntry('VCPCMatrix', 'mat4x4<f32>');
  model.UBO.addEntry('WCVCNormals', 'mat4x4<f32>');
  model.UBO.addEntry('cameraParallel', 'u32');

  model.tmpMat4 = mat4.identity(new Float64Array(16));

  model.stabilizedTime = {};
  macro.obj(model.stabilizedTime, { mtime: 0 });

  // Build VTK API
  macro.get(publicAPI, model, ['stabilizedTime']);
  macro.getArray(publicAPI, model, ['stabilizedCenter']);
  macro.setGet(publicAPI, model, ['renderEncoder', 'selector', 'UBO']);

  // Object methods
  vtkWebGPURenderer(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'vtkWebGPURenderer');

// ----------------------------------------------------------------------------

export default { newInstance, extend };
