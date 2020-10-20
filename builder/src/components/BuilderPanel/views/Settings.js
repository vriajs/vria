import React, { useContext } from 'react';
import styled, { css } from 'styled-components';
import View from './View';

import { useDebouncedCallback } from 'use-debounce';

import { DispatchContext } from '../../../reducer';
import { actionTypes } from '../../../actions';

const StyledSettings = styled(View)(
  ({ theme }) => css`
    color: white;
    padding: 0px 15px;

    select {
      min-width: 125px;
      padding: 5px;
      border: none;
      background: #303030;
      color: white;
      font-size: 1em;
    }
    input[type='color'] {
      background: #303030;
      border: 0;
    }
  `
);

const availableEnvironments = [
  'none',
  'default',
  'contact',
  'egypt',
  'checkerboard',
  'forest',
  'goaland',
  'yavapai',
  'goldmine',
  'threetowers',
  'poison',
  'arches',
  'tron',
  'japan',
  'dream',
  'volcano',
  'starry',
  'osiris'
];

const Settings = ({ settings }) => {
  const dispatch = useContext(DispatchContext);

  const updateSettings = useDebouncedCallback((newSetting) => {
    dispatch({
      type: actionTypes.UPDATE_SETTINGS,
      payload: newSetting
    });
  }, 250);

  return (
    <StyledSettings>
      <h1>Settings</h1>
      <p>Change some basic preferences</p>
      <table>
        <tbody>
          <tr>
            <td>Environment</td>
            <td>
              <select
                name={`env`}
                defaultValue={settings.environment}
                onChange={(e) =>
                  updateSettings.callback({
                    environment: e.target.value
                  })
                }>
                {availableEnvironments.map((env, i) => (
                  <option value={env} key={`env${i}${env}`}>
                    {env}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td>Background Color</td>
            <td>
              <input
                type='color'
                defaultValue={settings.backgroundColor}
                onChange={(e) =>
                  updateSettings.callback({
                    backgroundColor: e.target.value
                  })
                }></input>
            </td>
          </tr>
          <tr>
            <td>Chart Color</td>
            <td>
              <input
                type='color'
                defaultValue={settings.options.chartColor}
                onChange={(e) =>
                  updateSettings.callback({
                    options: { chartColor: e.target.value }
                  })
                }></input>
            </td>
          </tr>
          <tr>
            <td>Mark Selection Color</td>
            <td>
              <input
                type='color'
                defaultValue={settings.options.selectColor}
                onChange={(e) =>
                  updateSettings.callback({
                    options: { selectColor: e.target.value }
                  })
                }></input>
            </td>
          </tr>
        </tbody>
      </table>
    </StyledSettings>
  );
};

export default Settings;
