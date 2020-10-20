import React from 'react';
import { Scene, Entity } from 'aframe-react';
import 'aframe-environment-component';

import VRIA from 'vria';

const App = () => (
  <Scene>
    <VRIA
      position='-0.5 -0.5 -1'
      config={{
        title: 'Hello VRIA',
        data: {
          values: [
            { a: 'A', b: 3 },
            { a: 'B', b: 5 },
            { a: 'C', b: 7 },
            { a: 'D', b: 6 },
            { a: 'E', b: 4 }
          ]
        },
        mark: 'bar',
        encoding: {
          x: { field: 'a', type: 'nominal' },
          y: { field: 'b', type: 'quantitative', axis: { filter: true } }
        }
      }}
    />

    {/*
        Include an environment in your scene with the aframe-environment-component
        For available presets and API see:
        https://github.com/supermedium/aframe-environment-component

        <Entity environment={{ preset: 'default' }}/>
      */}
  </Scene>
);

export default App;
