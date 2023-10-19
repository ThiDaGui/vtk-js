import macro from 'vtk.js/Sources/macros';

function gltfMesh(publicAPI, model) {
  //
  model.classHierarchy.push('gltfMesh');
}

const DEFAULT_VALUES = {};

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  macro.setGet(publicAPI, model, ['primitives', 'weights', 'name']);

  gltfMesh(publicAPI, model);
}

export const newInstance = macro.newInstance(extend, 'gltfMesh');

export default { extend, newInstance };
