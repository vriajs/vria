import React from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';

import { log } from '../../../utils';

import GradientLegend from './GradientLegend';
import SymbolLegend from './SymbolLegend';

const Legend = (props) => {
  log.debug('Legend Rendering');
  const {
    view,
    channel,
    index,
    options,
    scales,
    domainMap,
    customMarks,
    rangesMax
  } = props;

  // Channel encoding
  const c = view.encoding[channel];

  // Position
  let xpos = c.legend.x || 0;
  let ypos = c.legend.y || 0;
  let zpos = c.legend.z || 0;

  // Rotation
  const xrot = c.legend.xrot || c.legend.xrotation || 0;
  const yrot = c.legend.yrot || c.legend.yrotation || 0;
  const zrot = c.legend.zrot || c.legend.zrotation || 0;

  // Face and orientation
  const { face, orient } = c.legend;

  // Offsets
  const xoffsetLeft = 0.2 + (view.encoding?.x?.axis?.titlePadding || 0);
  const xoffsetRight = 0.2;

  // Face and orient
  switch (face) {
    case 'front':
      zpos += rangesMax.z;
    // eslint-disable-next-line no-fallthrough
    case 'back':
      if (orient === 'bottom-left') {
        xpos -= xoffsetLeft;
      }
      if (orient === 'left') {
        ypos += rangesMax.y / 2;
        xpos -= xoffsetLeft;
      }
      if (orient === 'top-left') {
        ypos += rangesMax.y;
        xpos -= xoffsetLeft;
      }
      if (orient === 'top') {
        ypos += rangesMax.y;
        xpos += rangesMax.x / 2;
      }
      if (orient === 'top-right') {
        ypos += rangesMax.y;
        xpos += rangesMax.x + xoffsetRight;
      }
      if (orient === 'right') {
        ypos += rangesMax.y / 2;
        xpos += rangesMax.x + xoffsetRight;
      }
      if (orient === 'bottom-right') {
        xpos += rangesMax.x + xoffsetRight;
      }
      if (orient === 'bottom') {
        xpos += rangesMax.x / 2;
      }
      if (orient === 'middle') {
        xpos += rangesMax.x / 2;
        ypos += rangesMax.y / 2;
      }
      break;
    case 'left':
      break;
    case 'right':
      break;
    default:
      break;
  }

  // Pos Rot
  const posrot = { xpos, ypos, zpos, xrot, yrot, zrot };

  // Title
  const legendTitle = c.legend?.title || c.field;

  // Return legend type
  return c.type === 'quantitative' ? (
    <GradientLegend
      options={options}
      scales={scales}
      color={c}
      legendTitle={legendTitle}
      posrot={posrot}
      channel={channel}
    />
  ) : (
    <SymbolLegend
      view={view}
      domainMap={domainMap}
      customMarks={customMarks}
      options={options}
      legendTitle={legendTitle}
      scales={scales}
      posrot={posrot}
      channel={channel}
    />
  );

  // return <Entity rotation='0 0 0'>{generateLegend()}</Entity>;
};

Legend.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  dataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired,
  domainMap: PropTypes.object.isRequired
};

export default React.memo(
  Legend,
  (prev, next) => prev.domainMap === next.domainMap
);
