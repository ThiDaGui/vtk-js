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

    return model.dataAccessHelper.fetchText(publicAPI, url, {
      compression,
      progressCallback,
    });
  }

  publicAPI.setUrl = (url) => {
    model.url = url;

    // Remove the file in the URL
    const path = url.split('/');
    path.pop();
    model.baseURL = path.join('/');

    return publicAPI.loadData();
  };

  publicAPI.loadData = (option = {}) => {
    const promise = fetchData(model.url, option);
    promise.then(publicAPI.parse);
    return promise;
  };

  publicAPI.parse = (content) => {
    const GLTFdata = JSON.parse(content);

    if (!model.GLTFdata || model.GLTFdata !== GLTFdata) {
      model.GLTFdata = GLTFdata;
    }
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
