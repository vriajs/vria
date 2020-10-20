import { validateVisConfig } from 'vria';
import parseJson from 'json-parse-better-errors';

const runEditorConfig = (state, payload) => {
  try {
    const config = parseJson(payload);
    validateVisConfig(config);
    return {
      ...state,
      editorConfig: JSON.stringify(config, null, 2),
      builderStatus: {
        type: 0,
        message: 'Valid JSON and VRIA JSON Schema'
      },
      sceneActive: true,
      config: JSON.stringify(config, null, 2)
    };
  } catch (err) {
    const message = `${err.message} - See console for further details`;
    return {
      ...state,
      builderStatus: {
        type: 1,
        message
      }
    };
  }
};

export default runEditorConfig;
