import macro from '@kitware/vtk.js/macros'

function vtkGLTFreader(publicAPI, model){
    //
    model.classHierarchy.push('vtkGLTFReader');

}

const DEFAULT_VALUES = {

}

export function extend(publicAPI, model, initialValues = {}) {
    Object.assign(model, DEFAULT_VALUES, initialValues);
    
}

export const newInstance = macros.newInstance(extend, 'vtkGLTFReader');

export default Object.assign({newInstance, extend}, STATIC, Constants);

