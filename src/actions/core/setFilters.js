import { applyFilters } from '../../functions';
import cloneDeep from 'lodash/cloneDeep';

const setFilters = (state, payload) => {
  return {
    ...state,
    filteredDataset: applyFilters(state.parsedDataset, payload),
    domainMap: cloneDeep(payload)
  };
};

export default setFilters;
