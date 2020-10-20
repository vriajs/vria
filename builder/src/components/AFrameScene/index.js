import React, { useContext } from 'react';
import styled from 'styled-components';
import { Scene, Entity } from 'aframe-react';
import 'aframe-environment-component';

import { DispatchContext } from '../../reducer';
import { actionTypes } from '../../actions';

import VRIA from 'vria';

/* global AFRAME */
/* global THREE */

AFRAME.registerComponent('deallocate', {
  remove: function () {
    THREE.Cache.clear();
    this.el.renderer.forceContextLoss();
  }
});

const StyledScene = styled(Scene)`
  height: 100%;
  width: 100%;
`;

const SceneInactive = styled.div`
  height: 100%;
  width: 100%;
  background-color: #202020;
  color: #707070;
  display: grid;
  user-select: none;

  span {
    display: block;
    padding-top: 35px;
    margin: auto;
  }

  &::before {
    position: absolute;
    top: calc(50% - 5px);
    left: 50%;
    transform: translate(-50%, -50%);
    color: #707070;
    font-family: 'Font Awesome 5 Pro';
    font-weight: 400;
    content: '\f04d';
  }
`;

const AFrameScene = ({
  config,
  options,
  environment,
  sceneActive,
  backgroundColor
}) => {
  const dispatch = useContext(DispatchContext);

  const onConfigParsed = (e) => {
    dispatch({
      type: actionTypes.SET_COMPILED_CONFIG,
      payload: e.compiledConfig
    });
  };

  return (
    <>
      {sceneActive ? (
        <StyledScene
          id='scene'
          embedded
          deallocate
          background={{ color: backgroundColor }}>
          <VRIA
            config={JSON.parse(config)}
            position='-0.5 -0.5 -1'
            options={options}
            onConfigParsed={onConfigParsed}
          />
          {environment !== null && environment !== 'none' ? (
            <Entity
              environment={{
                preset: environment,
                lightPosition: { x: 0, y: 1, z: 0.6 }
              }}
            />
          ) : (
            <>
              <Entity light='type: ambient; color: #BBB' />
              <Entity
                light='type: directional; color: #FFF; intensity: 0.6'
                position='-0.5 1 1'
              />
            </>
          )}
        </StyledScene>
      ) : (
        <SceneInactive>
          <span>Rendering Stopped</span>
        </SceneInactive>
      )}
    </>
  );
};

export default React.memo(AFrameScene);
