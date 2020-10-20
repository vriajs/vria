import actions, { actionTypes } from '../actions';

const reducer = (state, { type, payload }) => {
  switch (type) {
    // SET_COMPILED_CONFIG
    case actionTypes.SET_COMPILED_CONFIG:
      return actions.setCompiledConfig(state, payload);
    // RUN_EDITOR_CONFIG
    case actionTypes.RUN_EDITOR_CONFIG:
      return actions.runEditorConfig(state, payload);
    // CLEAR_BUILDER_STATUS
    case actionTypes.CLEAR_BUILDER_STATUS:
      return actions.clearBuilderStatus(state, payload);
    // UPDATE_SETTINGS
    case actionTypes.UPDATE_SETTINGS:
      return actions.updateSettings(state, payload);
    default:
      console.error(`reducer - Unknown action type: ${type}`);
      break;
  }
};

export default reducer;
