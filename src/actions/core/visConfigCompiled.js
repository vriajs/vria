import cloneDeep from 'lodash/cloneDeep';
import { applyFilters } from '../../functions';

const visConfigCompiled = (state, payload) => {
  return {
    ...state,
    compiledConfig: payload.compiledConfig,
    parsedDataset: payload.dataset,
    filteredDataset: applyFilters(payload.dataset, payload.domainMap),
    initialDomainMap: cloneDeep(payload.domainMap),
    domainMap: payload.domainMap,
    scales: payload.scales
  };
};

export default visConfigCompiled;
