import macro from '@kitware/vtk.js/macros';
import Constants from 'vtk.js/Sources/IO/Geometry/GLTFImporter/Constants';

function vtkGLTFImporter(publicAPI, model) {
  //
  model.classHierarchy.push('vtkGLTFImporter');
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

export default {
  extend,
  newInstance,
  Constants,
};
