import macro from 'vtk.js/Sources/macros';

function gltfPrimitive(publicAPI, model) {
  //
  model.classHierarchy.push('gltfPrimitive');
}

const DEFAULT_VALUES = {};

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  macro.setGet(publicAPI, model, [
    'attributeIndices',
    'indicesId',
    'attributeValues',
    'geometry',
    'target',
    'indices',
    'material',
    'mode',
    'cellSize',
  ]);

  gltfPrimitive(publicAPI, model);
}

export const newInstance = macro.newInstance(extend, 'gltfPrimitive');

export default { extend, newInstance };
