import vtkActor from '../../../Rendering/Core/Actor';
import vtkMapper from '../../../Rendering/Core/Mapper';
import * as macro from '../../../macros';
import gltfMesh from './GLTFMesh';
import vtkPolyData from '../../../Common/DataModel/PolyData';
import vtkPoints from '../../../Common/Core/Points';
import { PrimitiveModes } from './Constants';
import { vtkWarningMacro } from '../../../macros';

function importActors(renderer) {
  const mesh = gltfMesh.newInstance();
  mesh.getPrimitives().forEach((primitive) => {
    // const pointData = primitive.getGeometry().getPointData();

    const actor = vtkActor.newInstance();
    const mapper = vtkMapper.newInstance();
    mapper.setColorModeToDirectScalars();
    mapper.setInterpolateScalarsBeforeMapping(true);

    mapper.setInputData(primitive.getGeometry());

    actor.setMapper(mapper);

    renderer.addActor(actor);
  });
}

function buildPolyDataFromPrimitive(primitive) {
  // Positions
  const geometry = vtkPolyData.newInstance();
  primitive.geometry = geometry;
  if (primitive.attributeValues.position !== undefined) {
    geometry.setPoints(vtkPoints.newInstance());
    geometry.getPoints().setData(primitive.position.getData());
  }

  // Connectivity
  // if (primitive.indices !== undefined) {}
  // does not affect geometry
  switch (primitive.mode) {
    case PrimitiveModes.TRIANGLES:
    case PrimitiveModes.TRIANGLE_FAN:
      geometry.setPolys(primitive.indices);
      break;
    case PrimitiveModes.LINES:
    case PrimitiveModes.lINE_STRIP:
    case PrimitiveModes.LINE_LOOP:
      geometry.setLines(primitive.indices);
      break;
    case PrimitiveModes.POINTS:
      geometry.setVerts(primitive.indices);
      break;
    case PrimitiveModes.TRIANGLE_STRIP:
      geometry.setStrips(primitive.indices);
      break;
    default:
      vtkWarningMacro('Invalid primitive draw mode. Ignoring connectivity.');
  }

  // Other attributes
  // TODO

  return true;
}

function buildVTKGeometry(model) {
  // build poly data
  model.meshes.forEach((mesh) => {
    mesh.primitives.forEach((primitive) =>
      buildPolyDataFromPrimitive(primitive)
    );
  });

  return model;
}

function vtkGLTFImporter(publicAPI, model) {
  //
  model.classHierarchy.push('vtkGLTFImporter');

  publicAPI.loadData = () => publicAPI.parse();

  publicAPI.parse = (content) => {};
}

const DEFAULT_VALUES = {};

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  macro.obj(publicAPI, model);
  macro.algo(publicAPI, model, 0, 0);
  macro.setGet(publicAPI, model, ['url', 'renderer']);

  vtkGLTFImporter(publicAPI, model);
}

export const newInstance = macro.newInstance(extend, 'vtkGLTFImporter');

export default { extend, newInstance };
