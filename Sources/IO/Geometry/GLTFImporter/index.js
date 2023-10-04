import macro from '@kitware/vtk.js/macros';
import DataAccessHelper from 'vtk.js/Sources/IO/Core/DataAccessHelper';
import Constants from 'vtk.js/Sources/IO/Geometry/GLTFImporter/Constants';

// Enable data soure for DataAccessHelper
import 'vtk.js/Sources/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper'; // Just need HTTP

// ----------------------------------------------------------------------------
// vtkGLTFImporter methods
// ----------------------------------------------------------------------------

function vtkGLTFImporter(publicAPI, model) {
  //
  model.classHierarchy.push('vtkGLTFImporter');

  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  }

  // To support destructuring
  if (!model.compression) {
    model.compression = null;
  }

  if (!model.progressCallback) {
    model.progressCallback = null;
  }

  function fetchData(url, option = {}) {
    const compression =
      option.compression !== undefined ? option.compression : model.compression;
    const progressCallback =
      option.progressCallback !== undefined
        ? option.progressCallback
        : model.progressCallback;

    if (option.binary) {
      return model.dataAccessHelper.fetchBinary(publicAPI, url, {
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
    const GLTFMetaData = JSON.parse(content);

    if (!model.GLTFMetaData || model.GLTFMetaData !== GLTFMetaData) {
      model.GLTFMetaData = GLTFMetaData;
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

  async function loadData() {
    model.GLTFData = [];
    const dataViewBuffers = [];

    model.GLTFMetaData.buffers.forEach(async (buffer) => {
      let uri = buffer.uri;
      const length = buffer.byteLength;

      // TODO: case when the uri is not a path (ie a base64 or other)
      if (uri[0] !== '/') {
        // relative path
        uri = String.concat(model.baseURL, buffer);
      }

      const bufferContent = await fetchData(uri, { binary: true });
      dataViewBuffers.push(new DataView(bufferContent, length));
    });

    // Primitives
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

const DEFAULT_VALUES = {};

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
