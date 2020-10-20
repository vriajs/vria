import React from 'react';
import { Entity } from 'aframe-react';

/* global AFRAME */

const Controllers = ({ handedness }) => {
  if (
    AFRAME.utils.device.checkHeadsetConnected() &&
    !AFRAME.utils.device.isMobile() &&
    handedness !== 'none'
  ) {
    return (
      <>
        {handedness === 'both' || handedness === 'left' ? (
          <Entity>
            <Entity
              laser-controls='hand: left;model: false'
              className='controller controller-left'
              raycaster='showLine: true; far: 2; objects: .interactive'
              super-hands={{
                colliderEvent: 'raycaster-intersection',
                colliderEventProperty: 'els',
                colliderEndEvent: 'raycaster-intersection-cleared',
                colliderEndEventProperty: 'clearedEls'
              }}>
              <Entity
                scale='0.5 0.5 0.5'
                primitive='a-plane'
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
                className='tooltip tooltip-left'
                id='tooltip'
                visible='false'
                position='0 0.05 -0.2'
                rotation='-20 0 0'
              />
              <Entity
                primitive='a-box'
                width='0.01'
                height='0.01'
                depth='0.1'
                color='#EF2D2D'
              />
            </Entity>
          </Entity>
        ) : null}
        {handedness === 'both' || handedness === 'right' ? (
          <Entity>
            <Entity
              laser-controls='hand: right; model: false'
              className='controller controller-right'
              raycaster='showLine: true; far: 2; objects: .interactive'
              super-hands={{
                colliderEvent: 'raycaster-intersection',
                colliderEventProperty: 'els',
                colliderEndEvent: 'raycaster-intersection-cleared',
                colliderEndEventProperty: 'clearedEls'
              }}>
              <Entity
                scale='0.5 0.5 0.5'
                primitive='a-plane'
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
                className='tooltip tooltip-right'
                id='tooltip'
                visible='false'
                position='0 0.05 -0.2'
                rotation='-20 0 0'
              />
              <Entity
                primitive='a-box'
                width='0.01'
                height='0.01'
                depth='0.1'
                color='#EF2D2D'
              />
            </Entity>
          </Entity>
        ) : null}
      </>
    );
  } else {
    return null;
  }
};

export default Controllers;
