import vtkPolyData from '../../../../Common/DataModel/PolyData';

export interface IGLTFPrimitiveInitialValues {}

export interface gltfPrimitive {
  getGeometry(): vtkPolyData;
  setGeometry(name: vtkPolyData): void;
}

export function extend(publicAPI: object, model: object, initialValues?: IGLTFPrimitiveInitialValues): void;

export function newInstance(initialValues?: IGLTFPrimitiveInitialValues): gltfPrimitive;

export declare const gltfPrimitive: {
  newInstance: typeof newInstance;
  extend: typeof extend;
}
export default gltfPrimitive;
