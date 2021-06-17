import cloneDeep from 'lodash/cloneDeep';
import * as d3 from 'd3';

import validateVisConfig from './validateVisConfig';
import parseDataset from './parseDataset';
import { defaults } from './defaults';
import { log } from '../utils';

/**
 * @name compileVisConfig
 * @description VRIA vis-config compiler
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} config - VRIA vis-config file as JSON
 * @param {boolean} validated - true if the vis-config has already been validated
 * @returns {object} Promise containing compiled vis-config, dataset, scales and encodings
 */
function compileVisConfig(config, additionalFilters = [], validated = false) {
  // vis-config must be an object
  if (typeof config !== 'object') {
    log.error(
      `compileVisConfig - Malformed vis-config passed to compiler. Expected type: 'object', got '${typeof config}'.`
    );
  }

  // Validate config if it has not already been
  let valid = false;
  if (validated) {
    valid = true;
  } else {
    try {
      valid = validateVisConfig(config);
    } catch (error) {
      log.error(error);
      return false;
    }
  }

  // This will contain the compiled vis-config
  let compiledConfig;

  // This will contain the domain of active fields in this vis-config
  const domainMap = new Map();

  // The original vis-config must pass validation before it can be compiled
  if (valid) {
    // The remainder of this function creates a complete VRIA vis-config
    // Missing values are inferred from defaults (grammar/defaults), the dataset
    // and the vis-config itself.

    // Views (config.views)
    // - If a view does not exist, create one and move properties inside
    if (config.views === undefined) {
      compiledConfig = {
        data: cloneDeep(config.data),
        title: config.title,
        views: [cloneDeep(config)]
      };
      delete compiledConfig.views[0].data;
    } else {
      // If views object exists, clone the original config
      compiledConfig = cloneDeep(config);
    }

    // Parse dataset
    // - The dataset is parsed after the vis-config views are normalised
    // - Parsing includes loading the dataset and returning a Set() of unique fields
    // - Once parsed, defaults can be inferred
    const { dataset } = parseDataset(compiledConfig);
    return dataset.then((d) => {
      // Resulting domains, ranges and scales
      const allScales = [];

      // Infer defaults for each view
      compiledConfig.views.forEach((view, i) => {
        // --------------------
        // Top level view properties
        // - Copy over top level properties and assign defaults
        ['x', 'y', 'z', 'width', 'height', 'depth', 'titlePadding'].forEach(
          (el) => {
            if (view[el] === undefined) {
              compiledConfig.views[i][el] = defaults.view[el];
            }
          }
        );

        // Top level shorthand view properties
        // - Replace shorthands with full property names
        [
          ['xrot', 'xrotation'],
          ['yrot', 'yrotation'],
          ['zrot', 'zrotation']
        ].forEach((el) => {
          if (view[el[0]] !== undefined) {
            compiledConfig.views[i][el[1]] = cloneDeep(view[el[0]]);
            delete compiledConfig.views[i][el[0]];
          } else if (view[el[0]] === undefined && view[el[1]] === undefined) {
            compiledConfig.views[i][el[1]] = defaults.view[el[1]];
          }
        });

        // --------------------
        // Mark (views[].mark)
        // - Get the mark type from mark object or string
        // - VRIA currently supports 2 mark types: bar and point
        // - These types are assigned shape primitives

        // Mark Type (views[].mark | views[].mark.type)
        const markType = view.mark.type ?? view.mark;

        // Mark Shape (views[].mark.shape)
        // - Default shapes are based on the mark type
        let markShape;
        switch (markType) {
          case 'bar':
            markShape = view.mark.shape ?? defaults.view.mark.bar.shape;
            break;
          case 'point':
          default:
            markShape = view.mark.shape ?? defaults.view.mark.point.shape;
            break;
        }

        // Mark Tooltip (views[].mark.tooltip)
        // - Set the mark tooltip
        let markTooltip;
        if (typeof view.mark.tooltip === 'object') {
          markTooltip = view.mark.tooltip;
        } else if (view.mark.tooltip === true) {
          markTooltip = defaults.view.mark.tooltip.on;
        } else {
          markTooltip = false;
        }

        // Replace existing mark config with compiled mark object
        compiledConfig.views[i].mark = {
          type: markType,
          shape: markShape,
          tooltip: markTooltip
        };

        // --------------------
        // Encoding (views[].encoding[channel])
        // - View encoding channels
        // - NOTE: timeUnit and numberFormat are optional and are not compiled

        // --------------------
        // Scale range (views[].encoding[channel].scale.range)
        // - Get the range from each encoding channel
        const ranges = _getRanges(compiledConfig.views[i], d);

        // Add channel properties
        Object.keys(view.encoding).forEach((el) => {
          // Add scale object if one does not exist
          if (view.encoding[el].scale === undefined) {
            compiledConfig.views[i].encoding[el].scale = {};
          }

          // Only add range if this encoding channel is not a constant
          if (view.encoding[el].value === undefined) {
            // Add range
            compiledConfig.views[i].encoding[el].scale.range = ranges[el];
          }

          // --------------------
          // Scheme (views[].encoding[channel].scale.scheme)
          // - If this is a colour scale, it should have a scheme
          // - The scheme contains a named scale range or an array of colours
          if (el === 'color') {
            // If a scheme is provided, validate it
            if (
              view.encoding[el].scale.scheme === 'string' &&
              d3[view.encoding[el].scale.scheme] === undefined
            ) {
              log.error(
                `compileVisConfig - Invalid scheme: ${view.encoding[el].scale.scheme} - VRIA accepts schemes from d3-scale-chromatic: https://github.com/d3/d3-scale-chromatic, or an array of colours`
              );
            }

            // If the range is a string, it is a colour scale, do a lookup
            // If the range is a string but the scheme is already set, ignore range
            if (
              typeof view.encoding[el].scale.range === 'string' &&
              view.encoding[el].scale.scheme === undefined
            ) {
              compiledConfig.views[i].encoding[el].scale.scheme =
                defaults.view.encoding.scale.scheme[
                  defaults.view.encoding.scale.range.color[
                    view.encoding[el].type
                  ]
                ];
            }
          }

          // --------------------
          // Nice (views[].encoding[channel].scale.nice)
          // - Nice the scale, never nice non-quantitative scales
          if (
            view.encoding[el].type === 'quantitative' &&
            view.encoding[el].scale.nice === undefined
          ) {
            compiledConfig.views[i].encoding[el].scale.nice =
              defaults.view.encoding.scale.nice;
          }

          // --------------------
          // Zero (views[].encoding[channel].scale.zero)
          // - Scale starts from zero, never zero non-quantitative scales
          if (
            view.encoding[el].type === 'quantitative' &&
            view.encoding[el].scale.zero === undefined
          ) {
            compiledConfig.views[i].encoding[el].scale.zero =
              defaults.view.encoding.scale.zero;
          }

          // Scale padding (only x, y, or z and non-quantitative fields)
          if (
            ['x', 'y', 'z'].includes(el) &&
            view.encoding[el].type !== 'quantitative'
          ) {
            // --------------------
            // Padding inner (views[].encoding[channel].scale.paddingInner)
            // - Sets padding inner to band scales
            if (view.encoding[el].scale.paddingInner === undefined) {
              compiledConfig.views[i].encoding[el].scale.paddingInner =
                defaults.view.encoding.scale.paddingInner;
            }
            // --------------------
            // Padding outer (views[].encoding[channel].scale.paddingOuter)
            // - Sets padding outer to band scales, sets padding to point scales
            if (view.encoding[el].scale.paddingOuter === undefined) {
              compiledConfig.views[i].encoding[el].scale.paddingOuter =
                defaults.view.encoding.scale.paddingOuter;
            }
          }

          // --------------------
          // Axis (views[].encoding[channel].axis)
          // - Set axis properties

          // Only applies to x, y and z channels
          // TODO: Instead of using if statements, use object spread instead?
          if (
            ['x', 'y', 'z'].includes(el) &&
            view.encoding[el]?.axis !== false
          ) {
            // Add axis object if one does not exist
            if (view.encoding[el].axis === undefined) {
              compiledConfig.views[i].encoding[el].axis = {};
            }

            // --------------------
            // Axis title (views[].encoding[channel].axis.title)
            // - Set axis title to field name if not specified
            if (view.encoding[el].axis.title === undefined) {
              compiledConfig.views[i].encoding[el].axis.title =
                view.encoding[el].field;
            }

            // --------------------
            // Axis title padding (views[].encoding[channel].axis.titlePadding)
            // - Set axis title padding if not specified
            if (view.encoding[el].axis.titlePadding === undefined) {
              compiledConfig.views[i].encoding[el].axis.titlePadding =
                defaults.view.encoding.axis.titlePadding;
            }

            // --------------------
            // Axis filter (views[].encoding[channel].axis.filter)
            // - Set axis filter on or off
            if (view.encoding[el].axis.filter === undefined) {
              compiledConfig.views[i].encoding[el].axis.filter =
                defaults.view.encoding.axis.filter;
            }

            // --------------------
            // Axis face (views[].encoding[channel].axis.face)
            // - Set axis face
            if (view.encoding[el].axis.face === undefined) {
              compiledConfig.views[i].encoding[el].axis.face =
                defaults.view.encoding.axis.face[el];
            }

            // --------------------
            // Axis orient (views[].encoding[channel].axis.orient)
            // - Set axis orient
            if (view.encoding[el].axis.orient === undefined) {
              compiledConfig.views[i].encoding[el].axis.orient =
                defaults.view.encoding.axis.orient[el];
            }

            // --------------------
            // Axis ticks (views[].encoding[channel].axis.ticks)
            // - Set axis tick visibility
            if (view.encoding[el].axis.ticks === undefined) {
              compiledConfig.views[i].encoding[el].axis.ticks =
                defaults.view.encoding.axis.ticks;
            }

            // --------------------
            // Axis tick count (views[].encoding[channel].axis.tickCount)
            // - Set axis tick count
            if (view.encoding[el].axis.tickCount === undefined) {
              compiledConfig.views[i].encoding[el].axis.tickCount =
                defaults.view.encoding.axis.tickCount;
            }

            // --------------------
            // Axis labels (views[].encoding[channel].axis.labels)
            // - Set axis label visability
            if (view.encoding[el].axis.labels === undefined) {
              compiledConfig.views[i].encoding[el].axis.labels =
                defaults.view.encoding.axis.labels;
            }
          }

          // --------------------
          // Legend (views[].encoding[channel].legend)
          // - Set legend properties
          // - By default, legends are added

          // TODO: Instead of using if statements, use object spread instead?
          if (
            [
              'width',
              'height',
              'depth',
              'xoffset',
              'yoffset',
              'zoffset',
              'xrotation',
              'yrotation',
              'zrotation',
              'size',
              'color',
              'opacity',
              'length',
              'shape'
            ].includes(el) &&
            view.encoding[el].legend !== false &&
            view.encoding[el].value === undefined
          ) {
            // Add axis object if one does not exist or is set to true
            if (
              view.encoding[el].legend === undefined ||
              view.encoding[el].legend === true
            ) {
              compiledConfig.views[i].encoding[el].legend = {};
            }

            // --------------------
            // Legend title (views[].encoding[channel].legend.title)
            // - Set legend title to field name if not specified
            if (view.encoding[el].legend === undefined) {
              compiledConfig.views[i].encoding[el].legend =
                view.encoding[el].field;
            }

            // --------------------
            // Legend filter (views[].encoding[channel].legend.filter)
            // - Set legend filter on or off
            if (view.encoding[el].legend.filter === undefined) {
              compiledConfig.views[i].encoding[el].legend.filter =
                defaults.view.encoding.legend.filter;
            }

            // --------------------
            // Legend face (views[].encoding[channel].legend.face)
            // - Set legend face
            if (view.encoding[el].legend.face === undefined) {
              if (view.encoding[el].type === 'quantitative' && el === 'color') {
                compiledConfig.views[i].encoding[el].legend.face =
                  defaults.view.encoding.legend.type.gradient.face;
              } else {
                compiledConfig.views[i].encoding[el].legend.face =
                  defaults.view.encoding.legend.type.symbol.face;
              }
            }

            // --------------------
            // Legend orient (views[].encoding[channel].legend.orient)
            // - Set legend orient
            if (view.encoding[el].legend.orient === undefined) {
              if (view.encoding[el].type === 'quantitative' && el === 'color') {
                compiledConfig.views[i].encoding[el].legend.orient =
                  defaults.view.encoding.legend.type.gradient.orient;
              } else {
                compiledConfig.views[i].encoding[el].legend.orient =
                  defaults.view.encoding.legend.type.symbol.orient;
              }
            }

            // --------------------
            // Legend ticks (views[].encoding[channel].legend.ticks)
            // - Set legend tick visibility
            if (view.encoding[el].legend.ticks === undefined) {
              compiledConfig.views[i].encoding[el].legend.ticks =
                defaults.view.encoding.legend.ticks;
            }

            // --------------------
            // Legend tick count (views[].encoding[channel].legend.tickCount)
            // - Set legend tick count
            if (view.encoding[el].legend.tickCount === undefined) {
              compiledConfig.views[i].encoding[el].legend.tickCount =
                defaults.view.encoding.legend.tickCount;
            }

            // --------------------
            // Legend x position
            // - Set legend x position
            if (view.encoding[el].legend.x === undefined) {
              compiledConfig.views[i].encoding[el].legend.x =
                defaults.view.encoding.legend.x;
            }

            // --------------------
            // Legend y position
            // - Set legend y position
            if (view.encoding[el].legend.y === undefined) {
              compiledConfig.views[i].encoding[el].legend.y =
                defaults.view.encoding.legend.y;
            }

            // --------------------
            // Legend z position
            // - Set legend z position
            if (view.encoding[el].legend.z === undefined) {
              compiledConfig.views[i].encoding[el].legend.z =
                defaults.view.encoding.legend.z;
            }

            // --------------------
            // Legend x rotation
            // - Set legend x rotation
            if (view.encoding[el].legend.xrotation === undefined) {
              compiledConfig.views[i].encoding[el].legend.xrotation =
                defaults.view.encoding.legend.xrotation;
            }

            // --------------------
            // Legend y rotation
            // - Set legend y rotation
            if (view.encoding[el].legend.yrotation === undefined) {
              compiledConfig.views[i].encoding[el].legend.yrotation =
                defaults.view.encoding.legend.yrotation;
            }

            // --------------------
            // Legend z rotation
            // - Set legend z rotation
            if (view.encoding[el].legend.zrotation === undefined) {
              compiledConfig.views[i].encoding[el].legend.zrotation =
                defaults.view.encoding.legend.zrotation;
            }
          }
        });

        // --------------------
        // Scale domain (views[].encoding[channel].scale.domain)
        // - Get the domain from each encoding channel in this view
        // - This function also returns a Map() of field:domain for filtering and API use
        const { domains } = _getDomains(compiledConfig.views[i], d);

        // Scales
        // - Using domains and ranges to produce scale functions
        // - These scale functions are for mapping data and are not added to the config
        const scales = _getScales(compiledConfig.views[i], domains, ranges);
        allScales.push(scales);

        // Add domain to compiled config
        // This also stores the domain of each field used in this view in a Map()
        // This is necessary because some domains will have been niced or zeroed
        Object.keys(view.encoding).forEach((el) => {
          // If this encoding has a field (excluding constant channels)
          if (view.encoding[el].value === undefined) {
            // Add domain to compiled config
            // compiledConfig.views[i].encoding[el].scale.domain = domains[el];
            compiledConfig.views[i].encoding[el].scale.domain = allScales[i][
              el
            ].domain();
            // Add domain to domain map
            domainMap.set(view.encoding[el].field, allScales[i][el].domain());
          }
        });
      });

      // Set additional filters to domain map
      if (additionalFilters) {
        additionalFilters.forEach((f) => {
          const values = d.map((row) => row[f.field]);
          domainMap.set(
            f.field,
            f.domain ||
              (f.type === 'quantitative'
                ? f.zero
                  ? [0, d3.max(values)]
                  : d3.extent(values)
                : [...new Set(values)])
          );
        });
      }

      return {
        dataset: d,
        compiledConfig,
        domainMap,
        scales: allScales
      };
    });
  }
}

/**
 * @name _getDomains
 * @private
 * @description Get the domains of each encoding channel in a view
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} view - Set domains for each encoding channel in this view
 * @param {object} dataset - Dataset from which to retrieve domains
 * @returns {object} Domains
 */
function _getDomains(view, dataset) {
  const { encoding } = view;
  const domains = {};
  const domainsWithFields = {};
  const channelFields = {};
  Object.keys(encoding).forEach((channel) => {
    // This channel's domain;
    let domain;
    // If a domain is specified in the vis-config
    if (encoding[channel].scale?.domain) {
      domain = encoding[channel].scale.domain;
    } else if (encoding[channel]?.value) {
      domain = encoding[channel]?.value;
    } else {
      const values = dataset.map((row) => row[encoding[channel].field]);
      switch (encoding[channel].type) {
        case 'quantitative':
          // Should the domain start from zero?
          if (encoding[channel].scale?.zero === true) {
            domain = [0, d3.max(values)];
          } else {
            domain = d3.extent(values);
          }
          break;
        case 'temporal':
        case 'nominal':
        case 'ordinal':
        default:
          domain = [...new Set(values)];
          break;
      }
    }
    domains[channel] = domain;
    domainsWithFields[encoding[channel].field] = domain;
    channelFields[channel] = encoding[channel].field;
  });
  return { domains, domainsWithFields, channelFields };
}

/**
 * @name _getRanges
 * @private
 * @description Get the ranges of each encoding channel in a view
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} view - Set range for each encoding channel in this view
 * @returns {object} Ranges
 */
function _getRanges(view) {
  const { encoding } = view;
  const ranges = {};
  Object.keys(encoding).forEach((channel) => {
    // This channel's range
    let range;
    // If a range is specified in the vis-config
    if (encoding[channel].scale?.range) {
      // Use this range
      range = encoding[channel].scale.range;
    } else {
      // If the range is not specified, do a lookup
      switch (channel) {
        case 'x':
        case 'width':
          range = [0, view.width];
          break;
        case 'y':
        case 'height':
          range = [0, view.height];
          break;
        case 'z':
        case 'depth':
          range = [0, view.depth];
          break;
        case 'size':
          range = defaults.view.encoding.scale.range.size;
          break;
        case 'opacity':
          range = [0, 1];
          break;
        case 'length':
          range = defaults.view.encoding.scale.range.length;
          break;
        case 'color':
          range =
            defaults.view.encoding.scale.range.color[encoding[channel].type];
          break;
        case 'shape':
          range = defaults.view.encoding.scale.range.shape;
          break;
        case 'xrotation':
        case 'yrotation':
        case 'zrotation':
          range = defaults.view.encoding.scale.range.rotation;
          break;
        case 'xoffset':
        case 'yoffset':
        case 'zoffset':
          range = defaults.view.encoding.scale.range.offset;
          break;
        default:
          break;
      }
    }
    ranges[channel] = range;
  });
  return ranges;
}

/**
 * @name _getScales
 * @private
 * @description Generate scale functions of each encoding channel in each view
 * @author Peter Butcher <pete@pbutcher.uk>
 * @param {object} view - Generate scale functions for encoding channels in this view
 * @param {object} domains - Data domaisn
 * @param {object} ranges - Data ranges
 * @returns {object} Scales
 */
function _getScales(view, domains, ranges) {
  const { encoding } = view;
  const scales = {};
  Object.keys(encoding).forEach((channel) => {
    // This channel's scale
    let scale;
    // Create scales for each channel based on encoding type
    if (encoding[channel].value) {
      scale = () => encoding[channel].value;
    } else {
      switch (encoding[channel].type) {
        case 'quantitative':
          switch (channel) {
            case 'color':
              // If a scheme is defined, use that scheme
              if (encoding[channel]?.scale?.scheme !== undefined) {
                if (typeof encoding[channel].scale?.scheme === 'string') {
                  // Scheme is a string
                  scale = d3
                    .scaleSequential()
                    .domain(domains[channel])
                    .interpolator(d3[encoding[channel].scale?.scheme]);
                } else {
                  // Scheme is an array
                  scale = d3
                    .scaleLinear()
                    .domain(domains[channel])
                    .range(encoding[channel].scale?.scheme);
                }
              }
              break;
            default:
              // Default scale
              scale = d3
                .scaleLinear()
                .domain(domains[channel])
                .range(ranges[channel]);
              break;
          }
          break;
        case 'temporal':
        case 'nominal':
        case 'ordinal':
        default: {
          // Set padding inner and outer from config or defaults
          // Padding outer acts as padding for scalePoint
          const paddingInner = encoding[channel].scale.paddingInner;
          const paddingOuter = encoding[channel].scale.paddingOuter;

          switch (channel) {
            case 'x':
            case 'y':
            case 'z':
              switch (view.mark.type) {
                case 'bar':
                  scale = d3
                    .scaleBand()
                    .domain(domains[channel])
                    .paddingInner(paddingInner)
                    .paddingOuter(paddingOuter)
                    .range(ranges[channel]);
                  break;
                case 'point':
                  scale = d3
                    .scalePoint()
                    .domain(domains[channel])
                    .padding(paddingOuter)
                    .range(ranges[channel]);
                  break;
                default:
                  break;
              }
              break;
            case 'color':
              if (encoding[channel].scale?.scheme !== undefined) {
                if (typeof encoding[channel].scale?.scheme === 'string') {
                  // Scheme is a string
                  scale = d3
                    .scaleOrdinal()
                    .domain(domains[channel])
                    .range(d3[encoding[channel].scale?.scheme]);
                } else {
                  // Scheme is an array
                  scale = d3
                    .scaleOrdinal()
                    .domain(domains[channel])
                    .range(encoding[channel].scale?.scheme);
                }
              }
              break;
            case 'shape':
              scale = d3
                .scaleOrdinal()
                .domain(domains[channel])
                .range(encoding[channel].scale.range);
              break;
            default:
              scale = d3
                .scaleOrdinal()
                .domain(domains[channel])
                .range(ranges[channel]);
              break;
          }
          break;
        }
      }
    }

    // Nice the scale
    if (encoding[channel].scale?.nice === true) {
      scale = scale.nice();
    }

    scales[channel] = scale;
  });
  return scales;
}

export default compileVisConfig;
