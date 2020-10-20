import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';

import './lib/super-hands/super-hands';

import { actionTypes } from './actions';
import { reducer, initialState, DispatchContext } from './reducer';
import { compileVisConfig } from './grammar';
import { log } from './utils';

import { View } from './components/core';
import { Camera, Controllers, setSceneAttributes } from './components/scene';

import { defaults } from './grammar/defaults';

// Named exports
export { default as schema } from './grammar/schema';
export { default as validateVisConfig } from './grammar/validateVisConfig';

/**
 * @name VRIA
 * @description A Web-Based Framework for Creating Immersive Analytics Experiences
 */
const VRIA = ({
  config,
  options,
  setSelection,
  onSelection,
  onConfigParsed,
  setFilters,
  onFilter,
  additionalFilters,
  customMarks,
  ...rest
}) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    onConfigParsed,
    onSelection,
    onFilter,
    additionalFilters,
    options: {
      ...defaults.options,
      ...options
    }
  });

  // Set options prop
  useEffect(() => {
    dispatch({ type: actionTypes.SET_OPTIONS, payload: options });
  }, [options]);

  // Set additional filters prop
  useEffect(() => {
    dispatch({
      type: actionTypes.SET_ADDITIONAL_FILTERS,
      payload: additionalFilters
    });
  }, [additionalFilters]);

  // User defined selection prop (used for synchronising selections between clients)
  useEffect(() => {
    if (
      setSelection !== undefined &&
      setSelection !== null &&
      typeof setSelection === 'object'
    ) {
      dispatch({ type: actionTypes.SET_SELECTION, payload: setSelection });
    }
  }, [setSelection]);

  // User defined filter prop (used for synchronising filters between clients)
  // Can also be used to set filters from custom interaction components
  useEffect(() => {
    if (
      setFilters !== undefined &&
      setFilters !== null &&
      typeof setFilters === 'object'
    ) {
      dispatch({ type: actionTypes.SET_FILTERS, payload: setFilters });
    }
  }, [setFilters]);

  // Selection of marks
  useEffect(() => {
    // Trigger selections callback
    if (typeof state.onSelection === 'function') {
      state.onSelection(state.selection);
    }
  }, [state.selection]);

  // Filtering of marks
  useEffect(() => {
    // Trigger filters callback
    if (typeof state.onFilter === 'function') {
      state.onFilter(state.domainMap);
    }
  }, [state.domainMap]);

  // CDM
  useEffect(() => {
    log.mode();
  }, []);

  // Compile vis-config
  useEffect(() => {
    try {
      compileVisConfig(config, additionalFilters).then((res) => {
        // Send compiled config back before transforming
        if (typeof state.onConfigParsed === 'function') {
          state.onConfigParsed(res);
        }

        // Add unique ID to processed dataset for VRIA to reference later
        res.dataset = res.dataset.map((row, i) => {
          row.vriaid = i;
          return row;
        });
        // Store
        dispatch({ type: actionTypes.VIS_CONFIG_COMPILED, payload: res });
        log.debug('compiledConfig', res);
      });
    } catch (err) {
      log.error(err);
    }
  }, [config]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <Entity {...rest}>
        <Entity _ref={setSceneAttributes} />
        <Camera options={state.options} />
        <Controllers handedness={state.options.handedness} />
        {state.filteredDataset
          ? state.compiledConfig.views.map((view, i) => (
              <Entity
                key={`v${i}`}
                position={rest.position}
                rotation={rest.rotation}>
                <View
                  index={i}
                  view={view}
                  options={state.options}
                  dataset={state.filteredDataset}
                  parsedDataset={state.parsedDataset}
                  scales={state.scales[i]}
                  domainMap={state.domainMap}
                  selection={state.selection}
                  customMarks={customMarks}
                />
              </Entity>
            ))
          : null}
      </Entity>
    </DispatchContext.Provider>
  );
};

VRIA.propTypes = {
  config: PropTypes.object.isRequired,
  options: PropTypes.object,
  setSelection: PropTypes.object,
  onSelection: PropTypes.func,
  onConfigParsed: PropTypes.func,
  setFilters: PropTypes.object,
  onFilter: PropTypes.func,
  additionalFilters: PropTypes.array,
  customMarks: PropTypes.object
};

export default React.memo(VRIA);
