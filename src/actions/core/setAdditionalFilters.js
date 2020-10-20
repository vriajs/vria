const setAdditionalFilters = (state, payload) => {
  return {
    ...state,
    additionalFilters: payload
  };
};

export default setAdditionalFilters;
