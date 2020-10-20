const setOptions = (state, payload) => {
  return {
    ...state,
    options: {
      ...state.options,
      ...payload
    }
  };
};

export default setOptions;
