import React from 'react';
import { Entity } from 'aframe-react';

/* global AFRAME */

const Camera = (props) => {
  // Desktop
  const standardCamera = (
    <Entity
      primitive='a-camera'
      wasd-controls-enabled
      position='0 1.6 0'
      capture-mouse
      raycaster='objects: .interactive; far: 5'
      cursor='rayOrigin: mouse'
      super-hands={{
        colliderEvent: 'raycaster-intersection',
        colliderEventProperty: 'els',
        colliderEndEvent: 'raycaster-intersection-cleared',
        colliderEndEventProperty: 'clearedEls'
      }}>
      <Entity
        primitive='a-plane'
        id='tooltip'
        className='tooltip'
        visible='false'
        position='0 -0.15 -0.4'
        color='#333'
        opacity='0.8'
        width='auto'
        height='auto'
        text={{
          value: 'Tooltip',
          color: '#FFF',
          xOffset: -0.18,
          anchor: 'left',
          align: 'left',
          lineHeight: 50,
          width: 0.4
        }}
      />
    </Entity>
  );

  // VR
  const vrCamera = (
    <Entity
      primitive='a-camera'
      wasd-controls-enabled
      position='0 1.6 0'
      capture-mouse
      raycaster='objects: .interactive; far: 5'
      cursor='rayOrigin: mouse'
      super-hands={{
        colliderEvent: 'raycaster-intersection',
        colliderEventProperty: 'els',
        colliderEndEvent: 'raycaster-intersection-cleared',
        colliderEndEventProperty: 'clearedEls'
      }}
    />
  );

  // Mobile camera
  const mobileCamera = (
    <Entity
      primitive='a-camera'
      wasd-controls-enabled
      position='0 1.6 0'
      capture-mouse>
      <Entity
        cursor={{
          fuse: true,
          fuseTimeout: 1250
        }}
        geometry={{
          primitive: 'ring',
          radiusInner: 0.01,
          radiusOuter: 0.015
        }}
        material={{
          color: props.options.baseColor,
          shader: 'flat'
        }}
        fuse='true'
        fuseTimeout='1250'
        position='0 0 -0.6'
        raycaster='objects: .interactive; far: 5;'
        super-hands={{
          colliderEvent: 'raycaster-intersection',
          colliderEventProperty: 'els',
          colliderEndEvent: 'raycaster-intersection-cleared',
          colliderEndEventProperty: 'clearedEls'
        }}
        animation__fusing='property: scale; startEvents: fusing; easing: easeInCubic; dur: 1250; from: 1 1 1; to: 0.2 0.2 0.2'
        animation__click='property: scale; startEvents: click; easing: easeInCubic; dur: 100; from: 0.2 0.2 0.2; to: 1 1 1'
        animation__mouseleave='property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 400; to: 1 1 1'
      />
      <Entity
        primitive='a-plane'
        id='tooltip'
        className='tooltip tooltip-mobile'
        visible='false'
        position='0 -0.15 -0.4'
        color='#333'
        opacity='0.8'
        width='auto'
        height='auto'
        scale='0.5 0.5 0.5'
        text={{
          value: 'Tooltip',
          color: '#FFF',
          xOffset: -0.18,
          anchor: 'left',
          align: 'left',
          lineHeight: 50,
          width: 0.4
        }}
      />
    </Entity>
  );

  // Camera to use
  let camera;

  if (AFRAME.utils.device.isMobile()) {
    camera = mobileCamera;
  } else if (AFRAME.utils.device.checkHeadsetConnected()) {
    camera = vrCamera;
  } else {
    camera = standardCamera;
  }

  return camera;
};

export default React.memo(
  Camera,
  (prev, next) => prev.options.baseColor === next.options.baseColor
);
