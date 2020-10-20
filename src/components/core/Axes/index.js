import React from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';

import { XAxis, YAxis, ZAxis } from './axes';

import { log } from '../../../utils';

import { defaults } from '../../../grammar/defaults';

const Axes = (props) => {
  log.debug('Axes Rendering');

  const { view, options, scales, rangesMax } = props;

  const generateTitle = () => {
    let title;
    if (view.title) {
      title = (
        <Entity
          text={{
            width: rangesMax.x,
            value: view.title,
            color: options.chartColor,
            side: 'front',
            anchor: 'align',
            align: 'center'
          }}
          position={`${rangesMax.x / 2 || 0} ${
            rangesMax.y ? rangesMax.y + view.titlePadding : view.titlePadding
          } 0`}
        />
      );
    }
    return title;
  };

  const generateAxes = () => {
    const axes = [];

    ['x', 'y', 'z'].forEach((channel) => {
      // If this channel is in the view
      if (view.encoding[channel] && view.encoding[channel]?.axis !== false) {
        // Set the axis title from encoding axis title or field name
        let title;
        if (view.encoding[channel].axis?.title !== undefined) {
          title = view.encoding[channel].axis.title;
        } else {
          title = view.encoding[channel].field;
        }

        let tickValues;
        let tickOffset = 0;
        let tickCount = null;

        // Use scale for ticks for quantitative fields
        if (view.encoding[channel].type === 'quantitative') {
          // Tick values from scale
          tickCount = view.encoding[channel]?.axis?.tickCount || tickCount;
          if (tickCount !== null) {
            tickValues = scales[channel].ticks(tickCount);
          } else {
            tickValues = scales[channel].ticks();
          }

          // Use scale domain for ticks for categorical fields
        } else {
          tickValues = scales[channel].domain();
          tickOffset = scales[channel].bandwidth() / 2;
        }

        // Store each axis
        // TODO: More orients
        // TODO: Copy and flip axis label and title 180 degrees for visibility
        // Faces only currently support:
        // - x: front, back
        // - y: front, back
        // - z : left, right

        let xFace =
          view.encoding[channel]?.axis?.face ||
          defaults.view.encoding.axis.face.x;

        xFace = xFace === 'front' ? 0 : -rangesMax.z;

        let yFace =
          view.encoding[channel]?.axis?.face ||
          defaults.view.encoding.axis.face.y;

        yFace = yFace === 'front' ? rangesMax.z : 0;

        let zFace =
          view.encoding[channel]?.axis?.face ||
          defaults.view.encoding.axis.face.z;

        zFace = zFace === 'left' ? 0 : rangesMax.x;

        switch (channel) {
          case 'x':
            axes.push(
              <XAxis
                key='xAxis'
                fieldType={view.encoding[channel].type}
                numberFormat={view.encoding[channel].numberFormat}
                tickValues={tickValues}
                tickOffset={tickOffset}
                scales={scales}
                rangesMax={rangesMax}
                color={options.chartColor}
                title={title}
                titlePadding={view.encoding[channel]?.axis?.titlePadding}
                labels={view.encoding[channel]?.axis?.labels}
                ticks={view.encoding[channel]?.axis?.ticks}
                position={`0 0 ${xFace}`}
              />
            );
            break;
          case 'y':
            axes.push(
              <YAxis
                key='yAxis'
                fieldType={view.encoding[channel].type}
                numberFormat={view.encoding[channel].numberFormat}
                tickValues={tickValues}
                tickOffset={tickOffset}
                scales={scales}
                rangesMax={rangesMax}
                color={options.chartColor}
                title={title}
                titlePadding={view.encoding[channel]?.axis?.titlePadding}
                labels={view.encoding[channel]?.axis?.labels}
                ticks={view.encoding[channel]?.axis?.ticks}
                position={`0 0 ${yFace}`}
              />
            );
            break;
          case 'z':
            axes.push(
              <ZAxis
                key='zAxis'
                fieldType={view.encoding[channel].type}
                numberFormat={view.encoding[channel].numberFormat}
                tickValues={tickValues}
                tickOffset={tickOffset}
                scales={scales}
                rangesMax={rangesMax}
                color={options.chartColor}
                title={title}
                titlePadding={view.encoding[channel]?.axis?.titlePadding}
                labels={view.encoding[channel]?.axis?.labels}
                ticks={view.encoding[channel]?.axis?.ticks}
                position={`${zFace} 0 0`}
              />
            );
            break;
          default:
            break;
        }
      }
    });

    return axes;
  };

  return (
    <Entity>
      {generateTitle()}
      {generateAxes()}
    </Entity>
  );
};

Axes.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  scales: PropTypes.object.isRequired,
  rangesMax: PropTypes.object.isRequired
};

export default React.memo(Axes, (prev, next) => prev.view === next.view);
