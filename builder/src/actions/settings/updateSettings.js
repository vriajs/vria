const updateSettings = (state, payload) => {
  return {
    ...state,
    options: {
      ...state.options,
      ...payload.options
    },
    theme: payload.theme || state.theme,
    backgroundColor: payload.backgroundColor || state.backgroundColor,
    environment: payload.environment || state.environment
  };
};

export default updateSettings;
