import cy_precip from './cy_precip.json';
import cy_precip_h from './cy_precip_h.json';
import cy_precip_tooltip from './cy_precip_tooltip.json';
import cy_precip_filters from './cy_precip_filters.json';
import iris from './iris.json';
import iris_tooltip from './iris_tooltip.json';
import iris_filters from './iris_filters.json';
import iris_shape from './iris_shape.json';
import populations from './populations.json';
import populations_h from './populations_h.json';
import populations_tooltip from './populations_tooltip.json';
import populations_filters from './populations_filters.json';
import populations_shape from './populations_shape.json';
import iris_3d from './iris_3d.json';
import iris_3d_advanced from './iris_3d_advanced.json';
import cars_linked from './cars_linked.json';
import iris_linked from './iris_linked.json';

export {
  cy_precip,
  cy_precip_h,
  cy_precip_tooltip,
  cy_precip_filters,
  iris,
  iris_tooltip,
  iris_filters,
  iris_shape,
  populations,
  populations_h,
  populations_tooltip,
  populations_filters,
  populations_shape,
  iris_3d,
  cars_linked,
  iris_linked
};

export default [
  {
    title: '2D Bar Charts',
    description: '2018 Welsh Precipitation Dataset',
    examples: [
      {
        description: 'Basic Vertical',
        config: JSON.stringify(cy_precip)
      },
      {
        description: 'Basic Horizontal',
        config: JSON.stringify(cy_precip_h)
      },
      {
        description: 'With tooltips',
        config: JSON.stringify(cy_precip_tooltip)
      },
      {
        description: 'With filters and tooltips',
        config: JSON.stringify(cy_precip_filters)
      }
    ]
  },
  {
    title: '2D Scatter Plots',
    description: 'The Iris Flower Dataset',
    examples: [
      {
        description: 'Basic',
        config: JSON.stringify(iris)
      },
      {
        description: 'With tooltips',
        config: JSON.stringify(iris_tooltip)
      },
      {
        description: 'With filters and tooltips',
        config: JSON.stringify(iris_filters)
      },
      {
        description: 'With shapes',
        config: JSON.stringify(iris_shape)
      }
    ]
  },
  {
    title: '3D Bar Charts',
    description: 'Populations Dataset',
    examples: [
      {
        description: 'Basic Vertical',
        config: JSON.stringify(populations)
      },
      {
        description: 'Basic Horizontal',
        config: JSON.stringify(populations_h)
      },
      {
        description: 'With tooltips',
        config: JSON.stringify(populations_tooltip)
      },
      {
        description: 'With filters and tooltips',
        config: JSON.stringify(populations_filters)
      },
      {
        description: 'With cylinder mark',
        config: JSON.stringify(populations_shape)
      }
    ]
  },
  {
    title: '3D Scatter Plots',
    description: 'Examples of 3D scatter plots',
    examples: [
      {
        description: 'Basic',
        config: JSON.stringify(iris_3d)
      },
      {
        description: 'Advanced',
        config: JSON.stringify(iris_3d_advanced)
      }
    ]
  },
  {
    title: 'Linked Views',
    description: 'Examples of linked view plots with VRIA',
    examples: [
      {
        description: 'Automobile Dataset',
        config: JSON.stringify(cars_linked)
      },
      {
        description: 'The Iris Flower Dataset',
        config: JSON.stringify(iris_linked)
      }
    ]
  }
];
