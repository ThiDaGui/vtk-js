import macro from 'vtk.js/Sources/macros';

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
