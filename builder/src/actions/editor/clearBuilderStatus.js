const clearBuilderStatus = (state, payload) => {
  return {
    ...state,
    builderStatus: null
  };
};

export default clearBuilderStatus;
