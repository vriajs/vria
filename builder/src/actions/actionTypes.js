// Builder Actions
const coreActions = {
  SET_COMPILED_CONFIG: 'SET_COMPILED_CONFIG'
};

// Editor Actions
const editorActions = {
  RUN_EDITOR_CONFIG: 'RUN_EDITOR_CONFIG',
  CLEAR_BUILDER_STATUS: 'CLEAR_BUILDER_STATUS'
};

// Settings Actions
const settingsActions = {
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

export default {
  ...coreActions,
  ...editorActions,
  ...settingsActions
};
