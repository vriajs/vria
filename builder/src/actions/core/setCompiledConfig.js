const setCompiledConfig = (state, payload) => {
  return {
    ...state,
    compiledConfig: payload
  };
};

export default setCompiledConfig;
