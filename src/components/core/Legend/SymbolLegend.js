import React, { useContext } from 'react';
import { Entity } from 'aframe-react';
import * as d3 from 'd3';

import { DispatchContext } from '../../../reducer';
import { actionTypes } from '../../../actions';

const SymbolLegend = ({
  view,
  channel,
  domainMap,
  customMarks,
  options,
  legendTitle,
  scales,
  posrot
}) => {
  if (view.encoding.color && view.encoding.shape) {
    if (view.encoding.color.field === view.encoding.shape.field) {
      if (channel !== 'color') return null;
    }
  }

  const dispatch = useContext(DispatchContext);
  const { xpos, ypos, zpos, xrot, yrot, zrot } = posrot;

  const legendWidth = 0.25;
  const legendHeight = 0.09 + scales[channel].domain().length * 0.04;
  const legendYPos = legendHeight / 2 - 0.05;

  const labels = scales[channel].domain().map((v, i) => {
    let opacity = 1;
    let isChecked = true;
    const color = scales.color ? scales.color(v) : d3.schemeCategory10[0];
    const shape = scales.shape ? scales.shape(v) : view.mark.shape;
    const topOffset = 0.015 + legendYPos - 0.055;
    const step = i * -0.04;

    if (
      domainMap.get(view.encoding[channel].field) &&
      !domainMap
        .get(view.encoding[channel].field)
        .includes(scales[channel].domain()[i])
    ) {
      opacity = 0.5;
      isChecked = false;
    }

    const checked = (
      <Entity>
        <Entity
          primitive='a-plane'
          width='0.004'
          height='0.01'
          color='#333333'
          position={{
            x: -0.0864,
            y: topOffset - 0.003 + step,
            z: 0.002
          }}
          rotation='0 0 45'
        />
        <Entity
          primitive='a-plane'
          width='0.004'
          height='0.02'
          color='#333333'
          position={{
            x: -0.078,
            y: topOffset + step,
            z: 0.002
          }}
          rotation='0 0 -45'
        />
      </Entity>
    );

    const checkbox = (
      <Entity>
        {isChecked ? checked : null}
        <Entity
          className='interactive'
          primitive='a-plane'
          width='0.025'
          height='0.025'
          color='#FFFFFF'
          opacity='1'
          position={{
            x: -0.08,
            y: topOffset + step,
            z: 0.001
          }}
          events={{
            mouseenter: (e) => {
              e.target.setAttribute('opacity', 0.5);
            },
            mouseleave: (e) => {
              e.target.setAttribute('opacity', 1);
            },
            click: (e) => {
              if (e.detail !== 0) {
                dispatch({
                  type: actionTypes.FILTER_DATA,
                  payload: {
                    value: scales[channel].domain()[i],
                    field: view.encoding[channel].field,
                    bound: null,
                    type: 'legend'
                  }
                });
              }
            }
          }}
        />
      </Entity>
    );

    let mark;

    switch (shape) {
      case 'box': {
        mark = (
          <Entity
            primitive='a-plane'
            width='0.025'
            height='0.025'
            color={color}
            position={{
              x:
                view.encoding[channel].legend?.filter !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            }}
            opacity={opacity}
          />
        );

        break;
      }
      case 'sphere':
        mark = (
          <Entity
            radius='0.0125'
            primitive='a-circle'
            color={color}
            position={{
              x:
                view.encoding[channel].legend?.filter !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            }}
          />
        );
        break;
      case 'cone':
        mark = (
          <Entity
            primitive='a-cone'
            radius-top='0'
            radius-bottom='0.01'
            color={color}
            position={{
              x:
                view.encoding[channel].legend?.filter !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            }}
          />
        );
        break;
      case 'tetrahedron':
        mark = (
          <Entity
            primitive='a-triangle'
            scale='0.025 0.025 0.025'
            color={color}
            position={{
              x:
                view.encoding[channel].legend?.filter !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            }}
          />
        );
        break;
      case 'torus':
        mark = (
          <Entity
            primitive='a-torus'
            radius='0.01'
            color={color}
            position={{
              x:
                view.encoding[channel].legend?.filter !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            }}
          />
        );
        break;
      case 'cylinder':
        mark = (
          <Entity
            radius={0.01}
            primitive='a-circle'
            color={color}
            position={{
              x:
                view.encoding[channel].legend?.filter !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            }}
          />
        );
        break;
      default:
        mark = (
          <Entity
            width='0.025'
            height='0.025'
            depth='0.025'
            position={{
              x:
                view.encoding[channel].legend?.filter !== false ? -0.04 : -0.08,
              y: topOffset + step,
              z: 0.001
            }}>
            {customMarks[view.mark.shape]({
              width: 0.025,
              height: 0.025,
              depth: 0.025,
              size: 0.025,
              radius: 0.0125,
              color
            })}
          </Entity>
        );
        break;
    }

    return (
      <Entity key={`lC${i}`}>
        {mark}
        {view.encoding[channel].legend?.filter !== false ? checkbox : null}
        <Entity
          primitive='a-text'
          width='0.5'
          value={scales[channel].domain()[i]}
          color={options.chartColor}
          side='front'
          anchor='align'
          align='left'
          opacity={opacity}
          position={{
            x: view.encoding[channel].legend?.filter !== false ? -0.02 : -0.06,
            y: topOffset + step,
            z: 0.001
          }}
        />
      </Entity>
    );
  });

  return (
    <Entity
      primitive='a-plane'
      width={legendWidth}
      height={legendHeight}
      color={options.chartColor}
      opacity='0.2'
      rotation={{ x: xrot, y: yrot, z: zrot }}
      position={{ x: xpos, y: ypos, z: zpos }}>
      <Entity
        primitive='a-text'
        width='0.5'
        value={`${legendTitle}`}
        color={options.chartColor}
        side='front'
        anchor='align'
        align='left'
        position={`-0.09 ${legendYPos + 0.01} 0.001`}
      />
      {labels}
    </Entity>
  );
};

export default SymbolLegend;
