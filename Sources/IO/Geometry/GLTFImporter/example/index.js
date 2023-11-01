// import '@kitware/vtk.js/favicon';
//
// // Load the rendering pieces we want to use (for both WebGL and WebGPU)
// import '@kitware/vtk.js/Rendering/Profiles/Geometry';
// import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
// import vtkGLTFImporter from '@kitware/vtk.js/IO/Geometry/GLTFImporter';
// import vtkLight from '@kitware/vtk.js/Rendering/Core/Light';
// import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
// import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
//
// // ----------------------------------------------------------------------------
// // Standard rendering code setup
// const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
//   background: [0.5, 0.5, 0.5],
// });
// const renderer = fullScreenRenderer.getRenderer();
// const renderWindow = fullScreenRenderer.getRenderWindow();
// const interactor = vtkRenderWindowInteractor.newInstance();
// const style = vtkInteractorStyleTrackballCamera.newInstance();
//
// // ----------------------------------------------------------------------------
// const importer = vtkGLTFImporter.newInstance();
// importer.setUrl(`${__BASE_PATH__}/Data/FlightHelmet/glTF/FlightHelmet.gltf`);
// importer.setRenderer(renderer);
// importer.setRenderWindow(renderWindow);
// importer.setInteractor(interactor);
// importer.setInteractorStyle(style);
// const headLight = vtkLight.newInstance({ lightType: 0 });
// renderer.addLight(headLight);
// renderer.resetCamera();
// renderer.getActiveCamera().azimuth(20);
// renderer.getActiveCamera().elevation(30);
// renderer.resetCameraClippingRange();
// renderWindow.render();

import '@kitware/vtk.js/favicon';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkGLTFImporter from 'vtk.js/Sources/IO/Geometry/GLTFImporter';

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

const resetCamera = renderer.resetCamera;
const render = renderWindow.render;

const gltf = vtkGLTFImporter.newInstance();
gltf.setRenderer(renderer);
renderer.setRenderWindow(renderWindow);

gltf.setUrl(`${__BASE_PATH__}/data/gltf/Box/Box.gltf`).then(() => {
  resetCamera();
  render();
});
