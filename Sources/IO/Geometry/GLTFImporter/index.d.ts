import { vtkAlgorithm, vtkObject } from '../../../interfaces';
import vtkRenderer from '../../../Rendering/Core/Renderer';
import gltfPrimitive from './GLTFPrimitive';
import vtkActor from "../../../Rendering/Core/Actor";

interface IGLTFImporterOptions {
	binary?: boolean;
}

export interface IGLTFImporterInitialValues {}

type vtkGLTFImporterBase = vtkObject & Omit<vtkAlgorithm,
	| 'getInputData'
	| 'setInputData'
	| 'setInputConnection'
	| 'getInputConnection'
	| 'addInputConnection'
	| 'addInputData'
  | 'getOuputData'
  | 'setOutputData'
  | 'setOuputConnection'
  | 'getOutputConnection'>;

export interface vtkGLTFImporter extends vtkGLTFImporterBase {
  	/**
	 * Get the url of the object to load.
	 */
	getUrl(): string;

  getRenderer(): vtkRenderer;

  setRenderer(renderer: vtkRenderer): Promise<string | any>;

  loadData(options?: IGLTFImporterOptions): Promise<any>;

  parse(content: string): void;

	buildActorFromPrimitive(primitive: gltfPrimitive): vtkActor;

  buildPolyDataFromPrimitive(primitive: gltfPrimitive): boolean;
}

export function extend(publicAPI: object, model: object, initialValues?: IGLTFImporterInitialValues): void;

export function newInstance(initialValues?: IGLTFImporterInitialValues): vtkGLTFImporter;

export declare const vtkGLTFImporter: {
  newInstance: typeof newInstance;
  extend: typeof extend;
}
export default vtkGLTFImporter;
