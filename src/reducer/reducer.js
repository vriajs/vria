import actions, { actionTypes } from '../actions';
import { log } from '../utils';

const reducer = (state, { type, payload }) => {
  log.debug('reducer', type, payload);
  switch (type) {
    // VIS_CONFIG_COMPILED
    case actionTypes.VIS_CONFIG_COMPILED:
      return actions.visConfigCompiled(state, payload);
    // FILTER_DATA
    case actionTypes.FILTER_DATA:
      return actions.filterData(state, payload);
    // SET_CALLBACKS
    case actionTypes.SET_CALLBACKS:
      return actions.setCallbacks(state, payload);
    // MARK_SELECTED
    case actionTypes.MARK_SELECTED:
      return actions.markSelected(state, payload);
    // SET_SELECTION
    case actionTypes.SET_SELECTION:
      return actions.setSelection(state, payload);
    // SET_FILTERS
    case actionTypes.SET_FILTERS:
      return actions.setFilters(state, payload);
    // SET_ADDITIONAL_FILTERS
    case actionTypes.SET_ADDITIONAL_FILTERS:
      return actions.setAdditionalFilters(state, payload);
    // SET_OPTIONS
    case actionTypes.SET_OPTIONS:
      return actions.setOptions(state, payload);
    default:
      log.debug(`reducer - Unknown action type: ${type}`);
      break;
  }
};

export default reducer;
