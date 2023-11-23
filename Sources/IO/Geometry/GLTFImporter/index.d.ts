import { vtkAlgorithm, vtkObject } from '../../../interfaces';
import vtkRenderer from '../../../Rendering/Core/Renderer';

interface IGLTFImporterOptions {
	binary?: boolean;
	compression?: boolean;
	progressCallback?: boolean;
}

/**
 *
 */
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

  /**
   * Set the url of the object to load and import it in the renderer.
   * @param {String} url the url of the object to load.
   */
  setUrl(url: string): Promise<void>;

  /**
   *
   */
  getRenderer(): vtkRenderer;

  /**
   * Set a renderer for the importer to use, the renderer must be set by the user before the url.
   */
  setRenderer(renderer: vtkRenderer): boolean;

  /**
   * Load the object data.
   */
  loadData(options?: IGLTFImporterOptions): Promise<any>;
}

/**
 * Method used to decorate a given object (publicAPI+model) with vtkGLTFImporter characteristics.
 *
 * @param publicAPI object on which methods will be bounds (public)
 * @param model object on which data structure will be bounds (protected)
 * @param {IGLTFImporterInitialValues} [initialValues] (default: {})
 */
export function extend(publicAPI: object, model: object, initialValues?: IGLTFImporterInitialValues): void;


/**
 * Method used to create a new instance of vtkGLTFImporter
 * @param {IGLTFImporterInitialValues} [initialValues] for pre-setting some of its content
 */
export function newInstance(initialValues?: IGLTFImporterInitialValues): vtkGLTFImporter;

/**
 * vtkGLTFImporter is a source object that
 * reads polygonal data in glTF 2.0 file format and imports it in a vtkRenderer.
 *
 * The GL Transmission Format (glTF) is an API-neutral runtime asset delivery format.
 * A glTF asset is represented by:
 * - A JSON-formatted file (.gltf) containing a full scene description: node hierarchy, materials,
 *    cameras, as well as descriptor information for meshes, animations, and other constructs
 * - Binary files (.bin) containing geometry and animation data, and other buffer-based data
 * - Image files (.jpg, .png) for textures
 *
 * This importer supports meshes.
 *
 * For the full glTF specification, see:
 * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0
 */
export declare const vtkGLTFImporter: {
  newInstance: typeof newInstance;
  extend: typeof extend;
}
export default vtkGLTFImporter;
