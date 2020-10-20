/* global AFRAME */

const setSceneAttributes = (el) => {
  setTimeout(() => {
    el.sceneEl.setAttribute('touch-to-click-converter');

    const vrDisplayConnected = AFRAME.utils.device.checkHeadsetConnected();

    if (!vrDisplayConnected) {
      el.sceneEl.setAttribute('rayOrigin', 'mouse');
    }
  }, 0);
};

export default setSceneAttributes;
