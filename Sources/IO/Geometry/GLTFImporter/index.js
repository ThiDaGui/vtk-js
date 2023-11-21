import macro, { vtkWarningMacro } from '@kitware/vtk.js/macros';
import DataAccessHelper from 'vtk.js/Sources/IO/Core/DataAccessHelper';
import vtkCellArray from 'vtk.js/Sources/Common/Core/CellArray';
import vtkPolyData from '../../../Common/DataModel/PolyData';
import vtkPoints from '../../../Common/Core/Points';
import vtkDataArray from '../../../Common/Core/DataArray';
import vtkActor from '../../../Rendering/Core/Actor';
import vtkMapper from '../../../Rendering/Core/Mapper';

// Enable data soure for DataAccessHelper
import 'vtk.js/Sources/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper'; // Just need HTTP

import Constants from './Constants';
import vtkDataSetAttributes from '../../../Common/DataModel/DataSetAttributes';

const { AccessorComponentTypes, AccessorTypes, MeshPrimitiveModes } = Constants;

/*
function GetNumberOfCellsForPrimitive(mode, cellSize, numberOfIndices) {
  if (cellSize <= 0) {
    // warning
    return 0;
  }
  switch (mode) {
    case MeshPrimitiveMode.TRIANGLES:
    case MeshPrimitiveMode.LINES:
    case MeshPrimitiveMode.POINTS:
      return numberOfIndices / cellSize;
    case MeshPrimitiveMode.TRIANGLE_FAN:
      return numberOfIndices - 2;
    case MeshPrimitiveMode.LINE_LOOP:
      return numberOfIndices;
    case MeshPrimitiveMode.LINE_STRIP:
    case MeshPrimitiveMode.TRIANGLE_STRIP:
      return 1;
    default:
      // warning
      return 0;
  }
} */

function buildActorFromPrimitive(primitive) {
  // TODO: generate tangent if needed and data from primitive to the mapper
  // const pointData = primitive.getGeometry().getPointData();

  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();
  mapper.setColorModeToDirectScalars();
  mapper.setInterpolateScalarsBeforeMapping(true);

  mapper.setInputData(primitive.geometry);

  actor.setMapper(mapper);

  // TODO: ApplyGLTFMaterialToVTKActor

  return actor;
}

function getNumberOfComponentsForType(accessorType) {
  switch (accessorType) {
    case AccessorTypes.SCALAR:
      return 1;
    case AccessorTypes.VEC2:
      return 2;
    case AccessorTypes.VEC3:
      return 3;
    case AccessorTypes.VEC4:
      return 4;
    case AccessorTypes.MAT2:
      return 4;
    case AccessorTypes.MAT3:
      return 9;
    case AccessorTypes.MAT4:
      return 16;
    default:
      throw new Error('Invalid primitive.accessorType value');
  }
}

function calculatePrimitiveCellSize(meshPrimitiveMode) {
  switch (meshPrimitiveMode) {
    case MeshPrimitiveModes.POINTS:
      return 1;
    case MeshPrimitiveModes.LINES:
    case MeshPrimitiveModes.LINE_LOOP:
    case MeshPrimitiveModes.LINE_STRIP:
      return 2;
    case MeshPrimitiveModes.TRIANGLES:
    case MeshPrimitiveModes.TRIANGLE_STRIP:
    case MeshPrimitiveModes.TRIANGLE_FAN:
      return 3;
    default:
      throw new Error('Invalid primitive.mode value, must be between 0 and 6');
  }
}

function extractCellBufferDataUint8(
  inputBuffer,
  byteOffset,
  byteStride,
  count,
  numberOfComponents,
  mode
) {
  let cellSize = numberOfComponents;

  if (
    mode === MeshPrimitiveModes.LINE_STRIP ||
    mode === MeshPrimitiveModes.TRIANGLE_STRIP
  ) {
    cellSize = count;
  } else if (mode === MeshPrimitiveModes.LINE_LOOP) {
    cellSize = count + 1;
  }

  // let nCells = GetNumberOfCellsForPrimitive(mode, numberOfCoponents, count)

  const indicesCellArray = vtkCellArray.newInstance();

  const currentCell = Array(cellSize);
  const accessorBegin = byteOffset;
  const accessorEnd = accessorBegin + count * byteStride;

  let val;

  if (mode === MeshPrimitiveModes.TRIANGLE_FAN) {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint8(it, true);
      currentCell[i] = val;

      if (it <= accessorBegin + byteStride) {
        i++;
      } else {
        indicesCellArray.insertNextCell(currentCell);
        currentCell[1] = currentCell[2];
      }
    }
  } else {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint8(it, true);
      currentCell[i] = val;
      i++;

      if (i === currentCell.length) {
        indicesCellArray.insertNextCell(currentCell);
        i = 0;
      }
    }

    if (mode === MeshPrimitiveModes.LINE_LOOP) {
      currentCell[currentCell.length - 1] = currentCell[0];
      indicesCellArray.insertNextCell(currentCell);
    }
  }
  return indicesCellArray;
}

function extractCellBufferDataUint16(
  inputBuffer,
  byteOffset,
  byteStride,
  count,
  numberOfComponents,
  mode
) {
  let cellSize = numberOfComponents;

  if (
    mode === MeshPrimitiveModes.LINE_STRIP ||
    mode === MeshPrimitiveModes.TRIANGLE_STRIP
  ) {
    cellSize = count;
  } else if (mode === MeshPrimitiveModes.LINE_LOOP) {
    cellSize = count + 1;
  }

  // let nCells = GetNumberOfCellsForPrimitive(mode, numberOfCoponents, count)

  const indicesCellArray = vtkCellArray.newInstance();

  const currentCell = Array(cellSize);
  const accessorBegin = byteOffset;
  const accessorEnd = accessorBegin + count * byteStride;

  let val;

  if (mode === MeshPrimitiveModes.TRIANGLE_FAN) {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint16(it, true);
      currentCell[i] = val;

      if (it <= accessorBegin + byteStride) {
        i++;
      } else {
        indicesCellArray.insertNextCell(currentCell);
        currentCell[1] = currentCell[2];
      }
    }
  } else {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint16(it, true);
      currentCell[i] = val;
      i++;

      if (i === currentCell.length) {
        indicesCellArray.insertNextCell(currentCell);
        i = 0;
      }
    }

    if (mode === MeshPrimitiveModes.LINE_LOOP) {
      currentCell[currentCell.length - 1] = currentCell[0];
      indicesCellArray.insertNextCell(currentCell);
    }
  }
  return indicesCellArray;
}

function extractCellBufferDataUint32(
  inputBuffer,
  byteOffset,
  byteStride,
  count,
  numberOfComponents,
  mode
) {
  let cellSize = numberOfComponents;

  if (
    mode === MeshPrimitiveModes.LINE_STRIP ||
    mode === MeshPrimitiveModes.TRIANGLE_STRIP
  ) {
    cellSize = count;
  } else if (mode === MeshPrimitiveModes.LINE_LOOP) {
    cellSize = count + 1;
  }

  // let nCells = GetNumberOfCellsForPrimitive(mode, numberOfCoponents, count)

  const indicesCellArray = vtkCellArray.newInstance();

  const currentCell = Array(cellSize);
  const accessorBegin = byteOffset;
  const accessorEnd = accessorBegin + count * byteStride;

  let val;

  if (mode === MeshPrimitiveModes.TRIANGLE_FAN) {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint32(it, true);
      currentCell[i] = val;

      if (it <= accessorBegin + byteStride) {
        i++;
      } else {
        indicesCellArray.insertNextCell(currentCell);
        currentCell[1] = currentCell[2];
      }
    }
  } else {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint32(it, true);
      currentCell[i] = val;
      i++;

      if (i === currentCell.length) {
        indicesCellArray.insertNextCell(currentCell);
        i = 0;
      }
    }

    if (mode === MeshPrimitiveModes.LINE_LOOP) {
      currentCell[currentCell.length - 1] = currentCell[0];
      indicesCellArray.insertNextCell(currentCell);
    }
  }
  return indicesCellArray;
}

function extractDataArrayFloat(
  inputBuffer,
  byteOffset,
  byteStride,
  count,
  numberOfComponents
) {
  const accessorBegin = byteOffset;
  const accessorEnd = byteOffset + count * byteStride;
  const size = 4;

  const values = new Float32Array(count * numberOfComponents);
  let i = 0;
  for (let iter = accessorBegin; iter < accessorEnd; iter += byteStride) {
    let val;

    for (
      let elemIter = iter;
      elemIter < iter + numberOfComponents * size;
      elemIter += 4
    ) {
      val = inputBuffer.getFloat32(elemIter, true);
      values[i] = val;
      i++;
    }
  }
  const array = vtkDataArray.newInstance({
    numberOfComponents: 3,
    values,
  });
  return array;
}

function extractDataArray(
  buffer,
  byteOffset,
  bufferView,
  accessor,
  numberOfComponents
) {
  switch (accessor.componentType) {
    case AccessorComponentTypes.FLOAT:
      return extractDataArrayFloat(
        buffer,
        byteOffset,
        bufferView.byteStride ?? 4 * numberOfComponents,
        accessor.count,
        numberOfComponents
      );
    default:
      throw new Error('unsupported accessor type for primitive attribute');
  }
}

function buildPolyDataFromPrimitive(primitive) {
  // Positions
  const geometry = vtkPolyData.newInstance();
  primitive.geometry = geometry;
  if (primitive.attributeValues.position !== undefined) {
    geometry.setPoints(vtkPoints.newInstance());
    geometry.getPoints().setData(primitive.attributeValues.position.getData());
  }

  // Connectivity
  // if (primitive.indices !== undefined) {}
  // does not affect geometry
  switch (primitive.mode) {
    case MeshPrimitiveModes.TRIANGLES:
    case MeshPrimitiveModes.TRIANGLE_FAN:
      geometry.setPolys(primitive.indicesArray);
      break;
    case MeshPrimitiveModes.LINES:
    case MeshPrimitiveModes.LINE_STRIP:
    case MeshPrimitiveModes.LINE_LOOP:
      geometry.setLines(primitive.indicesArray);
      break;
    case MeshPrimitiveModes.POINTS:
      geometry.setVerts(primitive.indicesArray);
      break;
    case MeshPrimitiveModes.TRIANGLE_STRIP:
      geometry.setStrips(primitive.indicesArray);
      break;
    default:
      vtkWarningMacro('Invalid primitive draw mode. Ignoring connectivity.');
  }
  // Other attributes

  // Set vtkDataArray names
  Object.keys(primitive.attributeValues).forEach(([key, value]) => {
    value.setName(key);
  });

  const pointData = vtkDataSetAttributes.newInstance();
  geometry.setPointData(pointData);

  if (primitive.attributeValues.normal !== undefined) {
    pointData.setNormals(primitive.attributeValues.normal);
  }
  if (primitive.attributeValues.tangent !== undefined) {
    // No tangent in pointData
  }
  if (primitive.attributeValues.color_0 !== undefined) {
    pointData.setScalars(primitive.attributeValues.color_0);
  }
  if (primitive.attributeValues.texcoord_0 !== undefined) {
    pointData.setScalars(primitive.attributeValues.texcoord_0);
  }
  if (primitive.attributeValues.texcoord_1 !== undefined) {
    pointData.addArray(primitive.attributeValues.texcoord_1);
  }
  if (primitive.attributeValues.joints_0 !== undefined) {
    pointData.addArray(primitive.attributeValues.joints_0);
  }
  if (primitive.attributeValues.weights_0 !== undefined) {
    pointData.addArray(primitive.attributeValues.weights_0);
  }

  let targetId = 0;
  primitive.targets.forEach((target) => {
    if (target.attributeValues.position !== undefined) {
      const name = `"target"${targetId}_position`;
      target.attributeValues.position.setName(name);
      pointData.addArray(target.attributeValues.position);
    }
    if (target.attributeValues.normal !== undefined) {
      const name = `"target"${targetId}_normal`;
      target.attributeValues.normal.setName(name);
      pointData.addArray(target.attributeValues.normal);
    }
    if (target.attributeValues.tangent !== undefined) {
      const name = `"target"${targetId}_tangent`;
      target.attributeValues.tangent.setName(name);
      pointData.addArray(target.attributeValues.tangent);
    }
    targetId++;
  });
  return true;
}

// ----------------------------------------------------------------------------
// vtkGLTFImporter methods
// ----------------------------------------------------------------------------

function vtkGLTFImporter(publicAPI, model) {
  //
  model.classHierarchy.push('vtkGLTFImporter');

  function fetchData(url, option = {}) {
    const compression = option.compression ?? model.compression;
    const progressCallback = option.progressCallback && model.progressCallback;

    if (option.binary) {
      return model.dataAccessHelper.fetchBinary(url, {
        compression,
        progressCallback,
      });
    }
    return model.dataAccessHelper.fetchText(publicAPI, url, {
      compression,
      progressCallback,
    });
  }

  function parseGLTF(content) {
    const GLTFData = JSON.parse(content);

    if (!model.GLTFData || model.GLTFData !== GLTFData) {
      model.GLTFData = GLTFData;
    }
  }

  function loadMetaData() {
    // To be moved to another function for initialisation
    const promise = fetchData(model.url);
    switch (model.extension) {
      case 'gltf':
        return promise.then((content) => parseGLTF(content));
      default:
        return Promise.reject(new Error('Unsuported file type.'));
    }
  }

  function extractPrimitiveAttributes(primitive) {
    primitive.attributeValues = {};
    const attributeKeys = Object.keys(primitive.attributes);
    attributeKeys.forEach((attributeKey) => {
      if (attributeKey === 'POSITION') {
        const attribute = primitive.attributes[attributeKey];
        const accessor = model.GLTFData.accessors[attribute];
        const bufferView = model.GLTFData.bufferViews[accessor.bufferView];
        const buffer = model.GLTFData.buffers[bufferView.buffer].dataView;
        const byteOffset = accessor.byteOffset + bufferView.byteOffset;
        const numberOfComponents = getNumberOfComponentsForType(accessor.type);

        primitive.attributeValues.position = extractDataArray(
          buffer,
          byteOffset,
          bufferView,
          accessor,
          numberOfComponents
        );
      }
    });
  }

  function extractPrimitiveAccessorData(primitive) {
    if (primitive.indices >= 0) {
      const accessor = model.GLTFData.accessors[primitive.indices];
      const bufferView = model.GLTFData.bufferViews[accessor.bufferView];
      if (accessor.type !== AccessorTypes.SCALAR) {
        throw new Error(
          "Invalid accessor.type value for primitive connectivity loading. Expected 'SCALAR'"
        );
      }
      const buffer = model.GLTFData.buffers[bufferView.buffer].dataView;
      const byteOffset = accessor.byteOffset + bufferView.byteOffset;

      let byteStride = 0;
      switch (accessor.componentType) {
        case AccessorComponentTypes.UNSIGNED_BYTE:
          byteStride = 1;
          primitive.indicesArray = extractCellBufferDataUint8(
            buffer,
            byteOffset,
            bufferView.byteStride ?? byteStride,
            accessor.count,
            primitive.cellSize,
            primitive.mode
          );
          break;
        case AccessorComponentTypes.UNSIGNED_SHORT:
          byteStride = 2;
          primitive.indicesArray = extractCellBufferDataUint16(
            buffer,
            byteOffset,
            bufferView.byteStride ?? byteStride,
            accessor.count,
            primitive.cellSize,
            primitive.mode
          );
          break;
        case AccessorComponentTypes.UNSIGNED_INT:
          byteStride = 4;
          primitive.indicesArray = extractCellBufferDataUint32(
            buffer,
            byteOffset,
            bufferView.byteStride ?? byteStride,
            accessor.count,
            primitive.cellSize,
            primitive.mode
          );
          break;
        default:
          throw new Error(
            'Invalid accessor.componentType for primitive connectivity. Expected either GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT or GL_UNSIGNED_INT.'
          );
      }
    }

    extractPrimitiveAttributes(primitive);
  }

  async function loadData() {
    const promises = model.GLTFData.buffers.map((buffer, index) => {
      let uri = buffer.uri;
      // const length = buffer.byteLength;

      if (!/^data:/.test(uri) && uri[0] !== '/') {
        // relative path
        uri = model.baseURL.concat('/', uri);
      }

      return fetchData(uri, { binary: true }).then((bufferContent) => {
        const dataView = new DataView(bufferContent);
        model.GLTFData.buffers[index].dataView = dataView;
        return dataView;
      });
    });
    await Promise.all(promises);

    // Primitives
    model.GLTFData.meshes.forEach((mesh, meshIndex, meshes) => {
      mesh.primitives.forEach((primitive, primitiveIndex, primitives) => {
        primitive.cellSize = calculatePrimitiveCellSize(
          primitive.mode ?? MeshPrimitiveModes.TRIANGLES
        );
        extractPrimitiveAccessorData(primitive);
      });
    });
  }

  function buildVTKGeometry() {
    // build poly data
    model.GLTFData.meshes.forEach((mesh) => {
      mesh.primitives.forEach((primitive) =>
        buildPolyDataFromPrimitive(primitive)
      );
    });
  }

  function importActors() {
    model.GLTFData.scenes[0].nodes.forEach((nodeId) => {
      const node = model.GLTFData.nodes[nodeId];
      const mesh = model.GLTFData.meshes[node.mesh];
      mesh.primitives.forEach((primitive) => {
        const actor = buildActorFromPrimitive(primitive);

        model.renderer.addActor(actor);

        actor.getMapper().setScalarVisibility(true);
        const clr = { r: 200 / 255.0, g: 200 / 255.0, b: 200 / 255.0 };
        actor.getProperty().setColor(clr.r, clr.g, clr.b);
      });

      if (node.children != null) {
        node.children.forEach((childNodeId) => {
          const childrenMesh =
            model.GLTFData.meshes[model.GLTFData.node[childNodeId]];
          childrenMesh.primitives.forEach((primitive) => {
            const actor = buildActorFromPrimitive(primitive);

            model.renderer.addActor(actor);
          });
        });
      }
    });

    // TODO: ApplySkinningMorphing
  }

  publicAPI.setUrl = async (url) => {
    model.url = url;

    // Remove the file in the URL
    const path = url.split('/');
    const fileName = path.pop().split('.');

    model.baseURL = path.join('/');
    model.extension = fileName.pop();
    model.baseName = fileName.join('.');

    await loadMetaData();

    await loadData();

    buildVTKGeometry();

    importActors();
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  dataAccessHelper: DataAccessHelper.get('http'),
  compression: null,
  progressCallback: null,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  macro.obj(publicAPI, model);
  macro.algo(publicAPI, model, 0, 0);
  macro.get(publicAPI, model, ['url']);
  macro.setGet(publicAPI, model, ['renderer']);

  vtkGLTFImporter(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'vtkGLTFImporter');

// ----------------------------------------------------------------------------

export default {
  extend,
  newInstance,
  Constants,
};
