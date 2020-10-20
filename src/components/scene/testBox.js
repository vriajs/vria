import React from 'react';
import { Entity } from 'aframe-react';

const testBox = (
  <Entity
    position='0 1.6 -1'
    width='0.1'
    height='0.1'
    depth='0.1'
    primitive='a-box'
    color='red'
    className='interactive'
    grabbable={{
      suppressX: true,
      suppressZ: true
    }}
    events={{
      mouseenter: (e) => console.log('mouseenter', e),
      mouseleave: (e) => console.log('mouseleave', e),
      'grab-start': (e) => console.log('grab-start', e),
      'grab-end': (e) =>
        console.log('grab-end', e, e.detail.target.getAttribute('position').x),
      click: (e) => console.log('click', e)
    }}
  />
);

export default testBox;
