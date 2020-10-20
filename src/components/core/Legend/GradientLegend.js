import React from 'react';
import { Entity } from 'aframe-react';
import * as d3 from 'd3';

const GradientLegend = ({
  options,
  channel,
  scales,
  color,
  legendTitle,
  posrot
}) => {
  if (channel !== 'color') return null;

  const { xpos, ypos, zpos, xrot, yrot, zrot } = posrot;

  const background = (
    <Entity
      primitive='a-plane'
      width='0.3'
      height='0.2'
      color={options.chartColor}
      opacity='0.2'
      position='0 0 0'
    />
  );

  let minValue = scales.color.domain()[0];
  if (color.numberFormat !== undefined)
    minValue = d3.format(color.numberFormat)(minValue);

  const min = (
    <Entity
      primitive='a-text'
      width='0.5'
      value={minValue}
      color={options.chartColor}
      side='front'
      anchor='align'
      align='left'
      position='-0.125 0.01 0.002'
    />
  );

  let maxValue = scales.color.domain()[1];
  if (color.numberFormat !== undefined)
    maxValue = d3.format(color.numberFormat)(maxValue);

  const max = (
    <Entity
      primitive='a-text'
      width='0.5'
      value={maxValue}
      color={options.chartColor}
      side='front'
      anchor='align'
      align='right'
      position='0.125 0.01 0.002'
    />
  );

  const label = (
    <Entity
      primitive='a-text'
      width='0.5'
      value={legendTitle}
      color={options.chartColor}
      side='front'
      anchor='align'
      align='center'
      position='0 0.06 0.002'
    />
  );

  const gradient = [];

  let scheme;

  if (typeof color?.scale?.scheme === 'string') {
    scheme = d3
      .scaleSequential()
      .domain([0, 1])
      .interpolator(d3[color.scale.scheme]);
  } else {
    scheme = d3.scaleLinear().domain([0, 1]).range(color.scale.scheme);
  }

  for (var i = 0; i < 50; i++) {
    gradient.push(
      <Entity
        key={`gradient${i}`}
        primitive='a-plane'
        width='0.005'
        height='0.05'
        color={scheme(i / 50)}
        position={`${-0.12 + 0.005 * i} -0.04 0.001`}
      />
    );
  }

  return (
    <Entity
      rotation={{ x: xrot, y: yrot, z: zrot }}
      position={{ x: xpos, y: ypos, z: zpos }}
      className='legend'>
      {background}
      {label}
      {min}
      {max}
      {gradient}
    </Entity>
  );
};

export default GradientLegend;
