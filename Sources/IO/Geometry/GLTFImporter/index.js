
import macro from '@kitware/vtk.js/macros';
import DataAccessHelper from 'vtk.js/Sources/IO/Core/DataAccessHelper';
import vtkCellArray from 'vtk.js/Sources/Common/Core/CellArray';
// Enable data soure for DataAccessHelper
import 'vtk.js/Sources/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper'; // Just need HTTP
import vtkActor from '../../../Rendering/Core/Actor';
import vtkMapper from '../../../Rendering/Core/Mapper';
import * as macro from '../../../macros';
import vtkPolyData from '../../../Common/DataModel/PolyData';
import vtkPoints from '../../../Common/Core/Points';
import { PrimitiveModes } from './Constants';
import { vtkWarningMacro } from '../../../macros';

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
}*/

const { AccessorComponentTypes, AccessorTypes, MeshPrimitiveMode } = Constants;

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
    mode === MeshPrimitiveMode.LINE_STRIP ||
    mode === MeshPrimitiveMode.TRIANGLE_STRIP
  ) {
    cellSize = count;
  } else if (mode === MeshPrimitiveMode.LINE_LOOP) {
    cellSize = count + 1;
  }

  // let nCells = GetNumberOfCellsForPrimitive(mode, numberOfCoponents, count)

  const indicesCellArray = vtkCellArray.newInstance();

  const currentCell = Array(cellSize);
  const accessorBegin = byteOffset;
  const accessorEnd = accessorBegin + count * byteStride;

  let val;

  if (mode === MeshPrimitiveMode.TRIANGLE_FAN) {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint8(it);
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
    for (let it = accessorBegin; it !== accessorEnd; it += byteStride) {
      val = inputBuffer.getUint8(it);
      currentCell[i] = val;
      i++;

      if (i === currentCell.length) {
        indicesCellArray.insertNextCell(currentCell);
        i = 0;
      }
    }

    if (mode === MeshPrimitiveMode.LINE_LOOP) {
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
    mode === MeshPrimitiveMode.LINE_STRIP ||
    mode === MeshPrimitiveMode.TRIANGLE_STRIP
  ) {
    cellSize = count;
  } else if (mode === MeshPrimitiveMode.LINE_LOOP) {
    cellSize = count + 1;
  }

  // let nCells = GetNumberOfCellsForPrimitive(mode, numberOfCoponents, count)

  const indicesCellArray = vtkCellArray.newInstance();

  const currentCell = Array(cellSize);
  const accessorBegin = byteOffset;
  const accessorEnd = accessorBegin + count * byteStride;

  let val;

  if (mode === MeshPrimitiveMode.TRIANGLE_FAN) {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint16(it);
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
    for (let it = accessorBegin; it !== accessorEnd; it += byteStride) {
      val = inputBuffer.getUint16(it);
      currentCell[i] = val;
      i++;

      if (i === currentCell.length) {
        indicesCellArray.insertNextCell(currentCell);
        i = 0;
      }
    }

    if (mode === MeshPrimitiveMode.LINE_LOOP) {
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
    mode === MeshPrimitiveMode.LINE_STRIP ||
    mode === MeshPrimitiveMode.TRIANGLE_STRIP
  ) {
    cellSize = count;
  } else if (mode === MeshPrimitiveMode.LINE_LOOP) {
    cellSize = count + 1;
  }

  // let nCells = GetNumberOfCellsForPrimitive(mode, numberOfCoponents, count)

  const indicesCellArray = vtkCellArray.newInstance();

  const currentCell = Array(cellSize);
  const accessorBegin = byteOffset;
  const accessorEnd = accessorBegin + count * byteStride;

  let val;

  if (mode === MeshPrimitiveMode.TRIANGLE_FAN) {
    let i = 0;
    for (let it = accessorBegin; it < accessorEnd; it += byteStride) {
      val = inputBuffer.getUint32(it);
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
    for (let it = accessorBegin; it !== accessorEnd; it += byteStride) {
      val = inputBuffer.getUint32(it);
      currentCell[i] = val;
      i++;

      if (i === currentCell.length) {
        indicesCellArray.insertNextCell(currentCell);
        i = 0;
      }
    }

    if (mode === MeshPrimitiveMode.LINE_LOOP) {
      currentCell[currentCell.length - 1] = currentCell[0];
      indicesCellArray.insertNextCell(currentCell);
    }
  }
  return indicesCellArray;
}

function calculatePrimitiveCellSize(mode) {
  switch (mode) {
    case MeshPrimitiveMode.POINTS:
      return 1;
    case MeshPrimitiveMode.LINES:
    case MeshPrimitiveMode.LINE_LOOP:
    case MeshPrimitiveMode.LINE_STRIP:
      return 2;
    case MeshPrimitiveMode.TRIANGLES:
    case MeshPrimitiveMode.TRIANGLE_STRIP:
    case MeshPrimitiveMode.TRIANGLE_FAN:
      return 3;
    default:
      throw new Error('Invalid primitive.mode value, must be between 0 and 6');
  }
}


// ----------------------------------------------------------------------------
// vtkGLTFImporter methods
// ----------------------------------------------------------------------------
  
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

    // extractPrimitiveAttributes(primitive);
  }

  async function loadData() {
    const promises = model.GLTFData.buffers.map((buffer, index) => {
      let uri = buffer.uri;
      // const length = buffer.byteLength;

      // TODO: case when the uri is not a path (ie a base64 or other)
      if (uri[0] !== '/') {
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
          primitive.mode ?? MeshPrimitiveMode.TRIANGLES
        );
        extractPrimitiveAccessorData(primitive);
      });
    });
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

