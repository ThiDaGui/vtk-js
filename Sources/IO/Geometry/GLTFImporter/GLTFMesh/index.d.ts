import gltfPrimitive from '../GLTFPrimitive';

export interface IGLTFMeshInitialValues {}

export interface gltfMesh {
  getName(): string;
  setName(name: string): void;

  getWeights(): number[];
  setWeights(weights: number[]): void;

  getPrimitives(): gltfPrimitive[];
  setPrimitives(primitives: gltfPrimitive[]): void;
}

export function extend(publicAPI: object, model: object, initialValues?: IGLTFMeshInitialValues): void;

export function newInstance(initialValues?: IGLTFMeshInitialValues): gltfMesh;

export declare const gltfMesh: {
  newInstance: typeof newInstance;
  extend: typeof extend;
}
export default gltfMesh;
