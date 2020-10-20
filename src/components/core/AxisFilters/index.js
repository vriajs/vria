import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Entity } from 'aframe-react';

import { log } from '../../../utils';

import { DispatchContext } from '../../../reducer';
import { actionTypes } from '../../../actions';

import { defaults } from '../../../grammar/defaults';

const AxisFilters = (props) => {
  log.debug('Axis Filters Rendering');
  const dispatch = useContext(DispatchContext);

  const opacity = 1;

  const { view, options, dataset, scales, domainMap, rangesMax } = props;

  // Faces
  // TODO: Orients
  // Faces only currently support:
  // - x: front, back
  // - y: front, back
  // - z : left, right

  let xFace;
  let yFace;
  let zFace;

  if (view.encoding.x?.axis?.filter === true) {
    xFace = view.encoding.x?.axis?.face || defaults.view.encoding.axis.face.x;
    xFace = xFace === 'front' ? 0 : -rangesMax.z;
  }

  if (view.encoding.y?.axis?.filter === true) {
    yFace = view.encoding.y?.axis?.face || defaults.view.encoding.axis.face.y;
    yFace = yFace === 'front' ? rangesMax.z : 0;
  }

  if (view.encoding.z?.axis?.filter === true) {
    zFace = view.encoding.z?.axis?.face || defaults.view.encoding.axis.face.z;
    zFace = zFace === 'left' ? 0 : rangesMax.x;
  }

  let faces = { xFace, yFace, zFace };

  const XFilter = (view, scales, opacity, domainMap, faces) => (
    <Entity position={`0 0 ${faces.xFace}`}>
      <Entity
        class='interactive'
        grabbable={{
          suppressY: true,
          suppressZ: true
        }}
        events={{
          'grab-end': (e) => {
            dispatch({
              type: actionTypes.FILTER_DATA,
              payload: {
                value: scales.x.invert(
                  e.detail.target.getAttribute('position').x
                ),
                field: view.encoding.x.field,
                bound: 0,
                type: 'axis'
              }
            });
          }
        }}
        opacity={opacity}
        primitive='a-cone'
        radius-top='0.0'
        radius-bottom='0.01'
        height='0.03'
        color='#FFA493'
        position={`${scales.x(
          domainMap.get(view.encoding.x.field)[0]
        )} -0.015 ${scales.z ? scales.z.range()[1] : 0}`}
        rotation='0 0 0'
      />
      <Entity
        class='interactive'
        grabbable={{
          suppressY: true,
          suppressZ: true
        }}
        events={{
          'grab-end': (e) => {
            dispatch({
              type: actionTypes.FILTER_DATA,
              payload: {
                value: scales.x.invert(
                  e.detail.target.getAttribute('position').x
                ),
                field: view.encoding.x.field,
                bound: 1,
                type: 'axis'
              }
            });
          }
        }}
        opacity={opacity}
        primitive='a-cone'
        radius-top='0.0'
        radius-bottom='0.01'
        height='0.03'
        color='#FFA493'
        position={`${scales.x(
          domainMap.get(view.encoding.x.field)[1]
        )} -0.015 ${scales.z ? scales.z.range()[1] : 0}`}
        rotation='0 0 0'
      />
    </Entity>
  );

  const YFilter = (view, scales, opacity, domainMap, faces) => (
    <Entity position={`0 0 ${faces.yFace}`}>
      <Entity
        class='interactive'
        grabbable={{
          suppressX: true,
          suppressZ: true
        }}
        events={{
          'grab-end': (e) => {
            dispatch({
              type: actionTypes.FILTER_DATA,
              payload: {
                value: scales.y.invert(
                  e.detail.target.getAttribute('position').y
                ),
                field: view.encoding.y.field,
                bound: 0,
                type: 'axis'
              }
            });
          }
        }}
        opacity={opacity}
        primitive='a-cone'
        radius-top='0.0'
        radius-bottom='0.01'
        height='0.03'
        color='#98FF97'
        position={`-0.015 ${scales.y(
          domainMap.get(view.encoding.y.field)[0]
        )} ${scales.z ? scales.z.range()[0] : 0}`}
        rotation='0 0 -90'
      />
      <Entity
        class='interactive'
        grabbable={{
          suppressX: true,
          suppressZ: true
        }}
        events={{
          'grab-end': (e) => {
            dispatch({
              type: actionTypes.FILTER_DATA,
              payload: {
                value: scales.y.invert(
                  e.detail.target.getAttribute('position').y
                ),
                field: view.encoding.y.field,
                bound: 1,
                type: 'axis'
              }
            });
          }
        }}
        opacity={opacity}
        primitive='a-cone'
        radius-top='0.0'
        radius-bottom='0.01'
        height='0.03'
        color='#98FF97'
        position={`-0.015 ${scales.y(
          domainMap.get(view.encoding.y.field)[1]
        )} ${scales.z ? scales.z.range()[0] : 0}`}
        rotation='0 0 -90'
      />
    </Entity>
  );

  const ZFilter = (view, scales, opacity, domainMap, faces) => (
    <Entity position={`${faces.zFace} 0 0`}>
      <Entity
        class='interactive'
        grabbable={{
          suppressX: true,
          suppressY: true
        }}
        events={{
          'grab-end': (e) => {
            dispatch({
              type: actionTypes.FILTER_DATA,
              payload: {
                value: scales.z.invert(
                  e.detail.target.getAttribute('position').z
                ),
                field: view.encoding.z.field,
                bound: 0,
                type: 'axis'
              }
            });
          }
        }}
        opacity={opacity}
        primitive='a-cone'
        radius-top='0.0'
        radius-bottom='0.01'
        height='0.03'
        color='#86D7F5'
        position={`-0.015 0 ${scales.z(
          domainMap.get(view.encoding.z.field)[0]
        )}`}
        rotation='0 0 -90'
      />
      <Entity
        class='interactive'
        grabbable={{
          suppressX: true,
          suppressY: true
        }}
        events={{
          'grab-end': (e) => {
            dispatch({
              type: actionTypes.FILTER_DATA,
              payload: {
                value: scales.z.invert(
                  e.detail.target.getAttribute('position').z
                ),
                field: view.encoding.z.field,
                bound: 1,
                type: 'axis'
              }
            });
          }
        }}
        opacity={opacity}
        primitive='a-cone'
        radius-top='0.0'
        radius-bottom='0.01'
        height='0.03'
        color='#86D7F5'
        position={`-0.015 0 ${scales.z(
          domainMap.get(view.encoding.z.field)[1]
        )}`}
        rotation='0 0 -90'
      />
    </Entity>
  );

  const mutualProps = [view, scales, opacity, domainMap, faces];

  return (
    <Entity>
      {view.encoding.x?.axis?.filter === true ? XFilter(...mutualProps) : null}
      {view.encoding.y?.axis?.filter === true ? YFilter(...mutualProps) : null}
      {view.encoding.z?.axis?.filter === true ? ZFilter(...mutualProps) : null}
    </Entity>
  );
};

AxisFilters.propTypes = {
  view: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  dataset: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired,
  domainMap: PropTypes.object.isRequired
};

export default React.memo(
  AxisFilters,
  (prev, next) => prev.domainMap === next.domainMap
);
