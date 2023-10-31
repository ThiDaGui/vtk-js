import { vtkAlgorithm, vtkObject } from '../../../interfaces';
import vtkRenderer from '../../../Rendering/Core/Renderer';`

interface IGLTFImporterOptions {
	binary?: boolean;
	compression?: boolean;
	progressCallback?: boolean;
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
}

export function extend(publicAPI: object, model: object, initialValues?: IGLTFImporterInitialValues): void;

export function newInstance(initialValues?: IGLTFImporterInitialValues): vtkGLTFImporter;

export declare const vtkGLTFImporter: {
  newInstance: typeof newInstance;
  extend: typeof extend;
}
export default vtkGLTFImporter;
