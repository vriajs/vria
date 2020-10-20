import Ajv from 'ajv';

import { log } from '../utils';
import schema from './schema';

/**
 * @name validateVisConfig
 * @description VRIA vis-config JSON Schema validator
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} config - VRIA vis-config file as JSON
 */
function validateVisConfig(config) {
  // config must be an object
  if (typeof config !== 'object') {
    log.error(
      `ValidateVisConfig - Malformed vis-config passed to validator. Expected type: 'object', got '${typeof config}'.`
    );
  }

  // Validate vis-config against VRIA JSON Schema
  // - VRIA JSON Schemas are filed under src/grammar/schema/
  // - VRIA vis-config validation uses the Ajv JSON Schema Validator.
  // - Defaults are not applied to nested properties or $refs in Ajv and therefore no defaults should be specified in the schema.
  // - - This is a noted limitation of Ajv, so defaults for all properties are added after schema validation.

  const ajv = new Ajv({ useDefaults: false, jsonPointers: true });
  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (valid) {
    log.debug(`ValidateVisConfig - vis-config successfully validated`, config);
  } else {
    log.error(
      `ValidateVisConfig - vis-config validation failed`,
      ajv.errorsText(validate.errors),
      validate.errors
    );
  }

  return valid;
}

export default validateVisConfig;
