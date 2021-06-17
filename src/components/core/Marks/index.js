import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';
import * as d3 from 'd3';
import isEqual from 'react-fast-compare';

import { defaults } from '../../../grammar/defaults';

import { log } from '../../../utils';

import { DispatchContext } from '../../../reducer';
import { actionTypes } from '../../../actions';

const Marks = (props) => {
  log.debug('Marks Rendering');
  const { view, dataset, scales, customMarks } = props;

  const dispatch = useContext(DispatchContext);

  const markType = view.mark.type;
  const markShape = view.mark.shape;

  // Loop over all rows in the data
  const marks = dataset.map((row, i) => {
    const vriaid = `vria-${row.vriaid}`;

    // Set up tooltip
    let tooltipContent = '';
    let tooltipHeight = 0.05;
    const lineHeight = 0.021;
    if (view.mark.tooltip !== false && view.mark.tooltip !== undefined) {
      if (view.mark.tooltip.content === 'data') {
        // Show all data in the dataset
        Object.keys(row).forEach((el) => {
          if (el !== 'vriaid') {
            tooltipContent += `${el}: ${row[el]}\n`;
          }
        });
        tooltipHeight = Object.keys(row).length * lineHeight;
      } else if (view.mark.tooltip.content === 'encoding') {
        // Show just the encodings in this view for this mark
        // Get all fields in this view
        const fields = new Set();
        Object.keys(view.encoding).forEach((channel) => {
          if (view.encoding[channel].field)
            fields.add(view.encoding[channel].field);
        });
        Object.keys(row).forEach((el) => {
          if (el !== 'vriaid' && fields.has(el)) {
            tooltipContent += `${el}: ${row[el]}\n`;
          }
        });
        tooltipHeight = (fields.size + 1) * lineHeight;
      } else if (Array.isArray(view.mark.tooltip.content)) {
        // If tooltip content is an array, get field names
        Object.keys(row).forEach((el) => {
          if (el !== 'vriaid' && view.mark.tooltip.content.includes(el)) {
            tooltipContent += `${el}: ${row[el]}\n`;
          }
        });
        tooltipHeight = (view.mark.tooltip.content.length + 1) * lineHeight;
      } else {
        // Single field name
        tooltipContent = `${view.mark.tooltip.content}: ${
          row[view.mark.tooltip.content]
        }`;
      }
    }

    const markEvents = {
      mouseenter: (e) => {
        e.target.setAttribute('opacity', 0.5);

        if (view.mark.tooltip !== false && view.mark.tooltip !== undefined) {
          const tooltip = e.detail.cursorEl.parentEl.querySelector('.tooltip');
          tooltip.setAttribute(
            'height',
            e.target.getAttribute('tooltipHeight')
          );
          tooltip.setAttribute('visible', true);
          tooltip.setAttribute('text', {
            ...tooltip.getAttribute('text'),
            value: e.target.getAttribute('tooltipContent')
          });
        }
      },
      mouseleave: (e) => {
        e.target.setAttribute(
          'opacity',
          e.target.getAttribute('initialOpacity') || 0
        );
        if (view.mark.tooltip !== false && view.mark.tooltip !== undefined) {
          // If there is a single selected mark in the scene, set tooltip, else hide
          if (
            document.querySelectorAll('[vria-only-selected-mark]').length !== 0
          ) {
            document.querySelectorAll('.tooltip').forEach((el) => {
              el.setAttribute('text', {
                value: document
                  .querySelector('[selected]')
                  .getAttribute('tooltipContent')
              });
            });
          } else {
            const tooltip = e.detail.cursorEl.parentEl.querySelector(
              '.tooltip'
            );
            tooltip.setAttribute('visible', false);
          }
        }
        if (
          e.target.getAttribute('selected') &&
          e.target.getAttribute('wireframe')
        ) {
          e.target.setAttribute('opacity', 1);
        }
      },
      click: (e) => {
        if (e.detail !== 0) {
          const showTooltip =
            view.mark.tooltip !== false && view.mark.tooltip !== undefined;

          dispatch({
            type: actionTypes.MARK_SELECTED,
            payload: {
              id: row.vriaid,
              vriaid,
              cursor: showTooltip
                ? e.detail.cursorEl.parentEl.querySelector('.tooltip')
                : null,
              tooltipHeight: showTooltip
                ? e.target.getAttribute('tooltipHeight')
                : null,
              tooltipContent: showTooltip
                ? e.target.getAttribute('tooltipContent')
                : null
            }
          });
        }
      }
    };

    // The resulting mark to be displayed
    let mark;

    // Store all attributes of this mark
    const attributes = {};

    // Loop over every encoding channel
    Object.keys(view.encoding).forEach((channel) => {
      // Get the field of that channel
      const field = view.encoding[channel].field;

      // Get the appropriate scale for this channel
      const scale = scales[channel];

      // Set property in attributes object
      attributes[channel] = scale(row[field]);
    });

    // Defaults
    if (attributes.opacity === undefined) attributes.opacity = 1;
    if (attributes.color === undefined)
      attributes.color = d3.schemeCategory10[0];

    // Which type to render
    switch (markType) {
      // Scatter based charts
      case 'point': {
        attributes.size = attributes.size || defaults.view.mark.point.size;
        const radius = attributes.size;

        attributes.width = attributes.width || attributes.size;
        attributes.height = attributes.height || attributes.size;
        attributes.depth = attributes.depth || attributes.size;

        // This point's offset in the view
        if (typeof attributes.xoffset === 'string') {
          switch (attributes.xoffset) {
            case 'half': {
              attributes.x = attributes.x / 2;
            }
          }
        } else if (attributes.xoffset !== undefined) {
          attributes.x += attributes.xoffset;
        }
        if (typeof attributes.yoffset === 'string') {
          switch (attributes.yoffset) {
            case 'half': {
              attributes.y = attributes.y / 2;
            }
          }
        } else if (attributes.yoffset !== undefined) {
          attributes.y += attributes.yoffset;
        }
        if (attributes.z && typeof attributes.zoffset === 'string') {
          switch (attributes.zoffset) {
            case 'half': {
              attributes.z = attributes.z / 2;
            }
          }
        } else if (attributes.zoffset !== undefined) {
          attributes.z += attributes.zoffset;
        }

        // This point's position in the view
        attributes.position = `${attributes.x || 0} ${attributes.y || 0} ${
          attributes.z || 0
        }`;

        // This point's rotation in the view
        attributes.rotation = `${attributes.xrotation || 0} ${
          attributes.yrotation || 0
        } ${attributes.zrotation || 0}`;
        console.log(attributes.rotation);

        // Shape scale
        const shapeScaleMark = attributes.shape ? attributes.shape : null;

        switch (shapeScaleMark || markShape) {
          case 'sphere':
            mark = (
              <Entity
                key={i}
                tooltipContent={tooltipContent}
                tooltipHeight={tooltipHeight}
                primitive='a-sphere'
                className={`interactive vria-mark ${vriaid}`}
                data-mark={JSON.stringify(row)}
                radius='0.5'
                scale={{
                  x: attributes.width || radius,
                  y: attributes.height || radius,
                  z: attributes.depth || radius
                }}
                segments-height='9'
                segments-width='18'
                color={attributes.color}
                initialColor={attributes.color}
                position={attributes.position}
                rotation={attributes.rotation}
                initialOpacity={attributes.opacity}
                opacity={attributes.opacity}
                events={markEvents}
              />
            );
            break;
          case 'box':
            mark = (
              <Entity
                key={i}
                tooltipContent={tooltipContent}
                tooltipHeight={tooltipHeight}
                primitive='a-box'
                className={`interactive vria-mark ${vriaid}`}
                data-mark={JSON.stringify(row)}
                scale={{
                  x: attributes.width || radius,
                  y: attributes.height || radius,
                  z: attributes.depth || radius
                }}
                width='1'
                height='1'
                depth='1'
                color={attributes.color}
                initialColor={attributes.color}
                position={attributes.position}
                rotation={attributes.rotation}
                initialOpacity={attributes.opacity}
                opacity={attributes.opacity}
                events={markEvents}
              />
            );
            break;
          case 'cone':
            mark = (
              <Entity
                key={i}
                tooltipContent={tooltipContent}
                tooltipHeight={tooltipHeight}
                primitive='a-cone'
                className={`interactive vria-mark ${vriaid}`}
                data-mark={JSON.stringify(row)}
                // height={attributes.length || attributes.height || radius * 2}
                height='1'
                scale={{
                  x: attributes.width || radius,
                  y: attributes.height || radius,
                  z: attributes.depth || radius
                }}
                color={attributes.color}
                initialColor={attributes.color}
                position={attributes.position}
                rotation={attributes.rotation}
                segments-height='9'
                segments-radial='18'
                radius-top='0'
                radius-bottom='0.5'
                initialOpacity={attributes.opacity}
                opacity={attributes.opacity}
                events={markEvents}
              />
            );
            break;
          case 'tetrahedron':
            mark = (
              <Entity
                key={i}
                tooltipContent={tooltipContent}
                tooltipHeight={tooltipHeight}
                primitive='a-tetrahedron'
                className={`interactive vria-mark ${vriaid}`}
                data-mark={JSON.stringify(row)}
                radius='1'
                scale={{
                  x: attributes.width || radius,
                  y: attributes.height || radius,
                  z: attributes.depth || radius
                }}
                color={attributes.color}
                initialColor={attributes.color}
                position={attributes.position}
                rotation={attributes.rotation}
                initialOpacity={attributes.opacity}
                opacity={attributes.opacity}
                events={markEvents}
              />
            );
            break;
          case 'torus':
            mark = (
              <Entity
                key={i}
                tooltipContent={tooltipContent}
                tooltipHeight={tooltipHeight}
                primitive='a-torus'
                className={`interactive vria-mark ${vriaid}`}
                data-mark={JSON.stringify(row)}
                radius='0.5'
                radius-tubular='0.05'
                scale={{
                  x: attributes.width || radius,
                  y: attributes.height || radius,
                  z: attributes.depth || radius
                }}
                segments-radial='18'
                segments-tubular='16'
                color={attributes.color}
                initialColor={attributes.color}
                position={attributes.position}
                rotation={attributes.rotation}
                initialOpacity={attributes.opacity}
                opacity={attributes.opacity}
                events={markEvents}
              />
            );
            break;
          case 'cylinder':
            mark = (
              <Entity
                key={i}
                tooltipContent={tooltipContent}
                tooltipHeight={tooltipHeight}
                primitive='a-cylinder'
                className={`interactive vria-mark ${vriaid}`}
                data-mark={JSON.stringify(row)}
                rotation={attributes.rotation}
                radius={attributes.width / 2 || 0.05}
                height={attributes.depth !== 0 ? attributes.depth : 0.001}
                color={attributes.color}
                initialColor={attributes.color}
                position={attributes.position}
                initialOpacity={attributes.opacity}
                opacity={attributes.opacity}
                events={markEvents}
              />
            );
            break;
          // Custom Mark
          default: {
            const data = JSON.stringify(row);
            const key = i;
            const className = `interactive vria-mark ${vriaid}`;
            mark = (
              <Entity
                tooltipContent={tooltipContent}
                tooltipHeight={tooltipHeight}
                wireframe
                color='white'
                initialColor='white'
                primitive='a-box'
                opacity='0'
                key={key}
                className={className}
                data-mark={data}
                width={attributes.size}
                height={attributes.size}
                depth={attributes.size}
                rotation={attributes.rotation}
                position={attributes.position}
                events={markEvents}>
                {customMarks[markShape]({ ...attributes, scales, data })}
              </Entity>
            );
            break;
          }
        }
        break;
      }
      // Bar based charts
      case 'bar': {
        // Data field types
        const fTypes = {
          x: view.encoding?.x?.type || null,
          y: view.encoding?.y?.type || null,
          z: view.encoding?.z?.type || null
        };

        // Quantitative field
        const q = [];

        // Null fields
        const n = [];

        // Field counts
        Object.keys(fTypes).forEach((f) => {
          if (fTypes[f] === 'quantitative') {
            q.push(f);
          } else if (fTypes[f] === null) {
            n.push(f);
          }
        });

        // Valid number of quantitative data fields
        if (q.length === 1) {
          // Number of null fields determines dimensionality
          if (n.length === 2) {
            // 1D chart
            log.error(
              'Chart type "bar" expects 2 axis encoding channels (x, y and/or z)'
            );
          } else if (n.length === 1) {
            // 2D chart
          } else {
            // 3D chart
          }
        } else {
          log.error(
            'Chart type "bar" expects exactly one quantitative data field'
          );
        }

        // The quantitative data field/axis
        const quantField = q[0];

        if (!scales.width && !scales.height && !scales.depth) {
          // Position and dimensions of bars
          let xPos = 0;
          let yPos = 0;
          let zPos = 0;
          let width = 0;
          let height = 0;
          let depth = 0;

          switch (quantField) {
            case 'x':
              xPos = scales.x ? attributes.x / 2 : 0.001;
              yPos = scales.y ? attributes.y + scales.y.bandwidth() / 2 : 0.001;
              zPos = scales.z
                ? attributes.z + scales.z.bandwidth() / 2 || 0
                : -0.001;
              width = attributes.x || 0.001;
              height = scales.y ? scales.y.bandwidth() : 0.001;
              depth = scales.z ? scales.z.bandwidth() : 0.0001;
              break;
            case 'y':
              xPos = scales.x ? attributes.x + scales.x.bandwidth() / 2 : 0.001;
              yPos = scales.y ? attributes.y / 2 : 0.001;
              zPos = scales.z
                ? attributes.z + scales.z.bandwidth() / 2 || 0
                : -0.001;
              width = scales.x ? scales.x.bandwidth() : 0.001;
              height = attributes.y || 0.001;
              depth = scales.z ? scales.z.bandwidth() : 0.001;
              break;
            case 'z':
              xPos = scales.x ? attributes.x + scales.x.bandwidth() / 2 : 0.001;
              yPos = scales.y
                ? attributes.y + scales.y.bandwidth() / 2 || 0
                : 0.001;
              zPos = scales.z ? attributes.z / 2 : -0.001;
              width = scales.x ? scales.x.bandwidth() : 0.001;
              height = scales.y ? scales.y.bandwidth() : 0.001;
              depth = attributes.z || 0.001;
              break;
            default:
              break;
          }

          attributes.position = `${xPos} ${yPos} ${zPos}`;

          switch (markShape) {
            case 'box':
              mark = (
                <Entity
                  key={i}
                  tooltipContent={tooltipContent}
                  tooltipHeight={tooltipHeight}
                  position={attributes.position}
                  primitive='a-box'
                  className={`interactive vria-mark ${vriaid}`}
                  data-mark={JSON.stringify(row)}
                  width={width}
                  height={height}
                  depth={depth}
                  color={attributes.color}
                  initialColor={attributes.color}
                  initialOpacity={attributes.opacity}
                  opacity={attributes.opacity}
                  events={markEvents}
                />
              );
              break;
            case 'plane':
              // TODO: Plane
              break;
            case 'cylinder':
              mark = (
                <Entity
                  key={i}
                  tooltipContent={tooltipContent}
                  tooltipHeight={tooltipHeight}
                  primitive='a-cylinder'
                  className={`interactive vria-mark ${vriaid}`}
                  data-mark={JSON.stringify(row)}
                  rotation='0 0 0'
                  radius={width / 2}
                  height={height}
                  color={attributes.color}
                  initialColor={attributes.color}
                  position={attributes.position}
                  initialOpacity={attributes.opacity}
                  opacity={attributes.opacity}
                  events={markEvents}
                />
              );
              break;
            case 'cone':
              mark = (
                <Entity
                  key={i}
                  tooltipContent={tooltipContent}
                  tooltipHeight={tooltipHeight}
                  primitive='a-cone'
                  className={`interactive vria-mark ${vriaid}`}
                  data-mark={JSON.stringify(row)}
                  height={height}
                  color={attributes.color}
                  initialColor={attributes.color}
                  position={attributes.position}
                  rotation={attributes.rotation}
                  segments-height='9'
                  segments-radial='18'
                  radius-top='0'
                  radius-bottom={d3.min([
                    scales.x.bandwidth() / 2,
                    scales.z.bandwidth() / 2
                  ])}
                  initialOpacity={attributes.opacity}
                  opacity={attributes.opacity}
                  events={markEvents}
                />
              );
              break;
            // Custom Mark
            default: {
              const data = JSON.stringify(row);
              const key = i;
              const className = `interactive vria-mark ${vriaid}`;
              console.log('custommarks', customMarks);
              mark = (
                <Entity
                  tooltipContent={tooltipContent}
                  tooltipHeight={tooltipHeight}
                  wireframe
                  color='white'
                  initialColor='white'
                  primitive='a-box'
                  opacity='0'
                  key={key}
                  className={className}
                  width={width}
                  height={height}
                  depth={depth}
                  rotation={attributes.rotation}
                  position={attributes.position}
                  events={markEvents}>
                  {customMarks[markShape]({
                    ...attributes,
                    scales,
                    data,
                    width,
                    height,
                    depth
                  })}
                </Entity>
              );
              break;
            }
          }
        }
        break;
      }
      default:
        break;
    }
    return mark;
  });

  return <Entity className='marks'>{marks}</Entity>;
};

Marks.propTypes = {
  view: PropTypes.object.isRequired,
  customMarks: PropTypes.object,
  dataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired
};

export default React.memo(Marks, (prevProps, nextProps) => {
  return (
    isEqual(prevProps.view, nextProps.view) &&
    isEqual(prevProps.parsedDataset, nextProps.parsedDataset)
  );
});
