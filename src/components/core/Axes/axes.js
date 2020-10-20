import React from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';
import * as d3 from 'd3';

import { defaults } from '../../../grammar/defaults';

const Axis = (props) => {
  const AxisLine = () => (
    <Entity
      opacity={props.opacity}
      line={{
        start: props.start,
        end: props.end,
        color: props.color
      }}
    />
  );

  return (
    <Entity position={props.position}>
      <AxisLine />
      {props.ticks}
      {props.tickText}
      {props.title}
    </Entity>
  );
};

Axis.propTypes = {
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  position: PropTypes.string,
  rotation: PropTypes.string
};

export const XAxis = (props) => {
  const {
    scales,
    tickOffset,
    color,
    tickValues,
    rangesMax,
    numberFormat,
    title,
    titlePadding,
    labels,
    ticks
  } = props;

  const axisTicks = () =>
    tickValues.map((tick, i) => (
      <Entity
        key={`xTicks${i}`}
        line={{
          start: `${scales.x(tick) + tickOffset} 0 ${rangesMax.z}`,
          end: `${scales.x(tick) + tickOffset} -0.025 ${rangesMax.z}`,
          color: color
        }}
      />
    ));

  const axisTickText = () =>
    tickValues.map((tick, i) => {
      let value = tick;
      if (typeof value === 'number' && typeof numberFormat === 'string') {
        value = d3.format(numberFormat)(tick);
      }

      return (
        <Entity
          key={`xTickText${i}`}
          text={{
            width: 0.6,
            value: value,
            color: color,
            side: 'front',
            anchor: 'align',
            align: 'right'
          }}
          position={`${scales.x(tick) + tickOffset} -0.035 ${rangesMax.z}`}
          rotation='0 0 90'
        />
      );
    });

  const axisTitle = () => (
    <Entity
      text={{
        width: rangesMax.x,
        value: title,
        color: color,
        side: 'front',
        anchor: 'align',
        align: 'center'
      }}
      position={`${rangesMax.x / 2} ${
        titlePadding !== null ? -titlePadding : -0.22
      } ${rangesMax.z}`}
      rotation='0 0 0'
    />
  );

  const showLabels =
    labels === false ? labels : defaults.view.encoding.axis.labels;

  const showTicks = ticks === false ? ticks : defaults.view.encoding.axis.ticks;

  return (
    <Axis
      {...props}
      axis='x'
      start={`0 0 ${rangesMax.z}`}
      end={`${rangesMax.x} 0 ${rangesMax.z}`}
      color={color}
      ticks={showTicks ? axisTicks() : null}
      tickText={showTicks && showLabels ? axisTickText() : null}
      title={axisTitle()}
    />
  );
};

export const YAxis = (props) => {
  const {
    scales,
    tickOffset,
    color,
    tickValues,
    rangesMax,
    numberFormat,
    title,
    titlePadding,
    labels,
    ticks
  } = props;

  const axisTicks = () =>
    tickValues.map((tick, i) => (
      <Entity
        key={`yTicks${i}`}
        line={{
          start: `0 ${scales.y(tick) + tickOffset} 0`,
          end: `-0.025 ${scales.y(tick) + tickOffset} 0`,
          color: color
        }}
      />
    ));

  const axisTickText = () =>
    tickValues.map((tick, i) => {
      let value = tick;
      if (typeof value === 'number' && typeof numberFormat === 'string') {
        value = d3.format(numberFormat)(tick);
      }

      return (
        <Entity
          key={`yTickText${i}`}
          text={{
            width: 0.6,
            value: value,
            color: color,
            side: 'front',
            anchor: 'align',
            align: 'right'
          }}
          position={`-0.035 ${scales.y(tick) + tickOffset} 0`}
          rotation='0 0 0'
        />
      );
    });

  const axisTitle = () => (
    <Entity
      text={{
        width: rangesMax.y,
        value: title,
        color: color,
        side: 'front',
        anchor: 'align',
        align: 'center'
      }}
      position={`${titlePadding !== null ? -titlePadding : -0.22} ${
        rangesMax.y / 2
      } 0`}
      rotation='0 0 90'
    />
  );

  const showLabels =
    labels === false ? labels : defaults.view.encoding.axis.labels;

  const showTicks = ticks === false ? ticks : defaults.view.encoding.axis.ticks;

  return (
    <Axis
      {...props}
      axis='y'
      start='0 0 0'
      end={`0 ${rangesMax.y} 0`}
      color={color}
      ticks={showTicks ? axisTicks() : null}
      tickText={showTicks && showLabels ? axisTickText() : null}
      title={axisTitle()}
    />
  );
};

export const ZAxis = (props) => {
  const {
    scales,
    tickOffset,
    color,
    tickValues,
    rangesMax,
    numberFormat,
    title,
    titlePadding,
    labels,
    ticks
  } = props;

  const axisTicks = () =>
    tickValues.map((tick, i) => (
      <Entity
        key={`zTicks${i}`}
        line={{
          start: `0 0 ${scales.z(tick) + tickOffset}`,
          end: `0 -0.025 ${scales.z(tick) + tickOffset}`,
          color: color
        }}
      />
    ));

  const axisTickText = () =>
    tickValues.map((tick, i) => {
      let value = tick;
      if (typeof value === 'number' && typeof numberFormat === 'string') {
        value = d3.format(numberFormat)(tick);
      }

      return (
        <Entity
          key={`zTickText${i}`}
          text={{
            width: 0.6,
            value: value,
            color: color,
            side: 'front',
            anchor: 'align',
            align: 'right'
          }}
          position={`0 -0.035 ${scales.z(tick) + tickOffset}`}
          rotation='0 -90 90'
        />
      );
    });

  const axisTitle = () => (
    <Entity
      text={{
        width: rangesMax.z,
        value: title,
        color: color,
        side: 'front',
        anchor: 'align',
        align: 'center'
      }}
      position={`0 ${titlePadding !== null ? -titlePadding : -0.22} ${
        rangesMax.z / 2
      }`}
      rotation='0 -90 0'
    />
  );

  const showLabels =
    labels === false ? labels : defaults.view.encoding.axis.labels;

  const showTicks = ticks === false ? ticks : defaults.view.encoding.axis.ticks;

  return (
    <Axis
      {...props}
      axis='z'
      start='0 0 0'
      end={`0 0 ${rangesMax.z}`}
      color={color}
      ticks={showTicks ? axisTicks() : null}
      tickText={showTicks && showLabels ? axisTickText() : null}
      title={axisTitle()}
    />
  );
};

export const axes = [XAxis, YAxis, ZAxis];

export default axes;
