import * as d3 from 'd3';
import * as moment from 'moment';

import { defaults } from './defaults';
import { log } from '../utils';

// Moment default export
const _moment = moment.default;

/**
 * @name parseDataset
 * @description VRIA Dataset parser
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} config - VRIA vis-config file as JSON
 * @returns {object}
 */
function parseDataset(config) {
  // Get data and views objects from vis-config
  const { data, views } = config;

  // Only perform dataset transforms on fields used in this vis-config
  const uniqueFields = new Set();
  const encodingMap = new Map();
  views.forEach((view) => {
    Object.keys(view.encoding).forEach((channel) => {
      if (!uniqueFields.has(view.encoding[channel].field)) {
        uniqueFields.add(view.encoding[channel].field);
        encodingMap.set(view.encoding[channel].field, view.encoding[channel]);
      }
    });
  });

  // Supported dataset file types
  const SUPPORTED_FILE_TYPES = ['csv', 'json', 'txt', 'text'];

  // Get file type of dataset
  const FILE_TYPE =
    typeof data.url === 'string'
      ? data.url.split('.').pop().toLowerCase()
      : 'json';

  // Transformed dataset
  let transformedDataset;

  // Load datasets with d3
  if (SUPPORTED_FILE_TYPES.includes(FILE_TYPE)) {
    switch (FILE_TYPE) {
      case 'txt':
      case 'text':
      case 'csv':
        try {
          transformedDataset = d3.csv(data.url, (row) =>
            _transformRow(row, encodingMap)
          );
        } catch (err) {
          log.error(
            `parseDataset - Error parsing dataset as ${FILE_TYPE}`,
            err
          );
        }
        break;
      case 'json':
      default:
        try {
          if (typeof data.url === 'string') {
            transformedDataset = d3
              .json(data.url)
              .then((d) => d.map((row) => _transformRow(row, encodingMap)));
          } else if (typeof data.values === 'object') {
            transformedDataset = Promise.resolve(
              data.values.map((row) => _transformRow(row, encodingMap))
            );
          }
        } catch (err) {
          log.error('parseDataset - Error parsing dataset as JSON', err);
        }
        break;
    }
  } else {
    log.error(
      `parseDataset - Error parsing dataset. Unsupported file type: ${FILE_TYPE}`
    );
  }

  return {
    dataset: transformedDataset,
    uniqueFields
  };
}

/**
 * @name _transformRow
 * @private
 * @description Perform data transformations on each row of a dataset
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} row - A row of a parsed dataset
 * @param {object} encodingMap - All encodings used in this vis-config
 * @returns {object} A transformed row
 */
function _transformRow(row, encodingMap) {
  encodingMap.forEach((encoding) => {
    switch (encoding.type) {
      // Transform quantitative fields
      case 'quantitative':
        if (typeof row[encoding.field] === 'string') {
          // Parsed as string
          if (row[encoding.field] === '') {
            // Set missing data to 0
            // TODO: Remove, flag or otherwise process missing values somehow?
            row[encoding.field] = 0;
          } else {
            // Ensure radix character is period and not comma (, => .)
            // Also parse as float...
            row[encoding.field] = +parseFloat(
              row[encoding.field].replace(',', '.')
            );
          }
        } else {
          // Parsed as number...
          row[encoding.field] = +row[encoding.field];
        }
        break;
      // Transform temporal fields
      case 'temporal':
        // Transform date if timeUnit is supplied
        // TODO: Consider insisting on moment formats rather than Vega-Lite?
        // TODO: Consider not altering the original dataset?
        if (encoding.timeUnit) {
          // Default timeUnits can be set in (grammar/defaults)
          const { timeUnit: dfTimeUnit } = defaults.view.encoding;
          const timeUnits = new Map([
            ['year', dfTimeUnit.year],
            ['quarter', dfTimeUnit.quarter],
            ['month', dfTimeUnit.month],
            ['date', dfTimeUnit.date],
            ['week', dfTimeUnit.week],
            ['day', dfTimeUnit.day],
            ['dayofyear', dfTimeUnit.dayofyear],
            ['hours', dfTimeUnit.hours],
            ['minutes', dfTimeUnit.minutes],
            ['seconds', dfTimeUnit.seconds],
            ['milliseconds', dfTimeUnit.milliseconds]
          ]);
          const timeUnit = timeUnits.get(encoding.timeUnit);
          row[encoding.field] = _moment(
            new Date(row[encoding.field].toString())
          ).format(timeUnit);
        } else {
          if (typeof row[encoding.field] !== 'string')
            row[encoding.field] = row[encoding.field].toString();
        }
        break;
      // Transform nominal fields
      case 'nominal':
        if (typeof row[encoding.field] !== 'string')
          row[encoding.field] = row[encoding.field].toString();
        break;
      // Transform ordinal fields
      case 'ordinal':
        if (typeof row[encoding.field] !== 'string')
          row[encoding.field] = row[encoding.field].toString();
        break;
      default:
        break;
    }
  });
  return row;
}

export default parseDataset;
