import { vtkAlgorithm, vtkObject } from '../../../interfaces';
import vtkRenderer from '../../../Rendering/Core/Renderer';
import {int} from "../../../types";

type GLTFMetaData = {
	textures?: Texture[],
	skins?: Skin[],
	scenes?: Scene[],
	scene?: number,
	samplers?: Sampler[],
	nodes?: Node[],
	meshes?: Mesh[],
	materials?: Material[],
	images?: Image[],
	cameras?: Camera[],
	bufferViews?: BufferView[],
	buffers?: Buffer[],
	asset: Asset,
	animations? : Animation[],
	accessors?: Accessor[],
	extensionsRequired?: string[],
	extensionsUsed?: string[],
	extension?: Extensions,
	extras?: Extras,
}

type Accessor = {
	bufferView? : number,
	byteOffset?: number,
	componentType: number,
	normalized?: boolean,
	count: number,
	type: string,
	max?: number [],
	min?: number [],
	sparse?: Sparse,
	name?: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Animation = {
	channels: Channel[],
	samplers: AnimationSampler[],
	name?: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Asset = {
	copyright?: string,
	generator?: string,
	version: string,
	minVersion?: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Buffer = {
	uri?: string,
	byteLength: number,
	name?: string,
	extensions?: Extensions,
	extras?: Extras,
}

type BufferView = {
	buffer: number,
	byteOffset?: number,
	byteLength: number,
	target?: number,
	name?: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Camera = {
	orthographic?: Orthographic,
	perspective?: Perspective,
	type: string,
	name?: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Image = {
	uri?: string,
	mimeType?: number,
	bufferView?: number,
	name?: string,
	extensions?: Extensions,
	extras?: Extras,
}


type Material = {
	name: string,
	pbrMetallicRoughness: PbrMetallicRoughness,
	normalTexture: NormalTexture,
	occlusionTexture: OcclusionTexture,
	emissiveTexture: TextureInfo,
	emissiveFactor: number[],
	alphaMode: string,
	alphaCutoff: number,
	doubleSided: boolean,
	extensions?: Extensions,
	extras?: Extras,
}

type Mesh = {
	primitives: Primitives[],
	weights: number[],
	name: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Node = {
	camera:	number,
	children: number[],
	skin: number,
	matrix: number[],
	mesh: number,
	rotation: number[],
	scale: number[],
	translation: number[],
	weights: number[],
	name:	string,
	extensions?: Extensions,
	extras?: Extras,
}

type Sampler = {
	magFilter: number,
	minFilter: number,
	wrapS: number,
	wrapT: number,
	name: string,
	extensions?: Extensions,
	extras?: Extras,
}

type AnimationSampler = {
	input: number,
	interpolation?: string,
	output: number,
	extensions?: Extensions,
	extras?: Extras,
}

type Scene = {
	nodes: number[],
	name: string,
	extensions?: Extensions,
	extras?: Extras,
}


type Skin = {
	inverseBindMatrices: number,
	skeleton: number,
	joints: number[],
	name: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Texture = {
	sampler: number,
	source: number,
	name: string,
	extensions?: Extensions,
	extras?: Extras,
}

type Primitives = {
	attributes: object,
	indices: number,
	material: number,
	mode: number,
	targets: object[],
	extensions?: Extensions,
	extras?: Extras,
}

type TextureInfo = {
	index: number,
	texCoord : number,
	extensions?: Extensions,
	extras?: Extras,
}

type OcclusionTexture = {
	index : number,
	texCoord: number,
	strength: number,
	extensions?: Extensions,
	extras?: Extras,
}

type NormalTexture = {
	index: number,
	texCoord: number,
	scale: number,
	extensions?: Extensions,
	extras?: Extras,
}

type PbrMetallicRoughness = {
	baseColorFactor : number[],
	baseColorTexture: TextureInfo,
	metallicFactor: number,
	roughnessFactor: number,
	metallicRoughnessTexture: TextureInfo,
	extensions?: Extensions,
	extras?: Extras,
}

type Perspective = {
	aspectRatio?: number,
	yfov: number,
	zfar?: number,
	znear: number,
	extensions?: Extensions,
	extras?: Extras,
}

type Orthographic = {
	xmag: number,
	ymag: number,
	zfar: number,
	znear: number,
	extensions?: Extensions,
	extras?: Extras,
}

type Channel = {
	sampler: number,
	target: Target,
	extensions?: Extensions,
	extras?: Extras,
}

type Target = {
	node?: number,
	path: string,
	extensions?: Extensions,
	extras?: Extras,
}



type Extras = any

type Extensions = {

}

type Sparse = {
	count: number,
	indices: Indices,
	values: Values,
	extensions?: Extensions ,
	extras?: Extras,
}

type Values = {
	bufferView: number,
	byteOffset?: number,
	extensions?: Extensions,
	extras?: Extras,
}


type Indices = {
	bufferView: number,
	byteOffset?: number,
	componentType: number,
	extensions?: Extensions,
	extras?: Extras,
}

interface IGLTFImporterOptions {
	binary?: boolean;
}

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

  setRenderer(renderer: vtkRenderer);
}
