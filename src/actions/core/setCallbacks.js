const setCallbacks = (state, payload) => {
  return {
    ...state,
    appCallback: payload.appCallback
  };
};

export default setCallbacks;
