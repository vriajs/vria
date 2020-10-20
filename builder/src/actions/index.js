import setCompiledConfig from './core/setCompiledConfig';
import runEditorConfig from './editor/runEditorConfig';
import clearBuilderStatus from './editor/clearBuilderStatus';
import updateSettings from './settings/updateSettings';

export { default as actionTypes } from './actionTypes';

export default {
  setCompiledConfig,
  runEditorConfig,
  clearBuilderStatus,
  updateSettings
};
