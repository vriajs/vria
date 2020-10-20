import React from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';

import { defaults } from '../../../grammar/defaults';

import Legend from '../Legend';
import Axes from '../Axes';
import AxisFilters from '../AxisFilters';
import Marks from '../Marks';

const View = (props) => {
  const { view, scales, index } = props;
  const position = `${view.x} ${view.y + defaults.options.userHeight} ${
    view.z
  }`;
  const rotation = `${view.xrotation} ${view.yrotation} ${view.zrotation}`;
  const { width, height, depth } = view;

  // Range maximums
  const rangesMax = {
    x: scales.x ? scales.x.range()[1] : 0,
    y: scales.y ? scales.y.range()[1] : 0,
    z: scales.z ? scales.z.range()[1] : 0
  };

  // Legends
  const legends = Object.keys(view.encoding)
    .filter((c) => view.encoding[c].legend)
    .map((channel, i) => (
      <Legend
        key={`v${index}l${i}${channel}`}
        {...props}
        index={i}
        channel={channel}
        rangesMax={rangesMax}
      />
    ));

  const markProps = {
    view: props.view,
    customMarks: props.customMarks,
    dataset: props.dataset,
    parsedDataset: props.parsedDataset,
    scales: props.scales,
    options: props.options
  };

  return (
    <Entity
      className={`vria-view-${index}`}
      position={position}
      rotation={rotation}
      width={width}
      height={height}
      depth={depth}>
      {legends}
      <Axes {...props} rangesMax={rangesMax} />
      <AxisFilters {...props} rangesMax={rangesMax} />
      <Marks {...markProps} />
    </Entity>
  );
};

View.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  dataset: PropTypes.array.isRequired,
  parsedDataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired,
  domainMap: PropTypes.object.isRequired
};

export default View;
