import { applyFilters } from '../../functions';
import { log } from '../../utils';

const filterData = (state, payload) => {
  const { value, field, bound, type } = payload;

  let filteredDomain;

  switch (type) {
    case 'legend':
      if (state.domainMap.get(field).includes(value)) {
        filteredDomain = state.domainMap.get(field).filter((v) => v !== value);
      } else {
        // Check if this value was in the original domain
        if (state.initialDomainMap.get(field).includes(value)) {
          filteredDomain = state.domainMap.get(field);
          filteredDomain.push(value);
        } else {
          log.error(
            `filterData - Value not added, ${value} was not in original domain`
          );
        }
      }
      break;
    case 'axis':
      // TODO: Make available for non-quantitative axes?
      filteredDomain = state.domainMap.get(field);
      // Only update the filter if the new value is within the bounds of the original domain
      if (bound === 0) {
        if (value > state.initialDomainMap.get(field)[0]) {
          filteredDomain[bound] = value;
        } else {
          filteredDomain[bound] = state.initialDomainMap.get(field)[0];
        }
      } else {
        if (value < state.initialDomainMap.get(field)[1]) {
          filteredDomain[bound] = value;
        } else {
          filteredDomain[bound] = state.initialDomainMap.get(field)[1];
        }
      }
      break;
  }

  const newDomainMap = new Map(state.domainMap).set(field, filteredDomain);

  return {
    ...state,
    filteredDataset: applyFilters(state.parsedDataset, newDomainMap),
    domainMap: newDomainMap
  };
};

export default filterData;
