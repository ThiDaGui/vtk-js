import vtkPolyData from '../../../../Common/DataModel/PolyData';
import vtkDataArray from '../../../../Common/Core/DataArray';
import vtkCellArray from '../../../../Common/Core/CellArray';

export interface IGLTFPrimitiveInitialValues {}

export interface gltfPrimitive {
  getGeometry(): vtkPolyData;
  setGeometry(geometry: vtkPolyData): void;
  getAttributeValues(): {[key: string]: vtkDataArray};
  setAttributeValues(attributeValues: {[key: string]: vtkDataArray}): void;
  getIndices():vtkCellArray;
}

export function extend(publicAPI: object, model: object, initialValues?: IGLTFPrimitiveInitialValues): void;

export function newInstance(initialValues?: IGLTFPrimitiveInitialValues): gltfPrimitive;

export declare const gltfPrimitive: {
  newInstance: typeof newInstance;
  extend: typeof extend;
}
export default gltfPrimitive;
