import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import View from './View';
import examples from '../../../examples';

const StyledExamples = styled(View)(
  ({ theme }) => css`
    height: 100%;
    color: white;
    padding: 0px 15px;

    a {
      color: white;

      &:hover {
        color: #ccc;
      }
    }

    button {
      font-size: 1em;
      padding: 0;
      border: none;
      margin: 0;
      color: white;
      text-decoration: underline;
      background: none;
      cursor: pointer;

      &:hover {
        color: #ccc;
      }
    }

    .intro {
      border-bottom: solid 1px #333;
    }

    .key {
      background-color: #eee;
      padding: 2px 4px;
      border-radius: 2px;
      color: #000;
      font-size: 0.8em;
    }
  `
);

const Examples = ({ actions }) => {
  return (
    <StyledExamples>
      <h1>Examples</h1>
      <section className='intro'>
        <p>
          Choose an example from below, then remix the vis-config and experience
          the immersive visualization in your headset. You can customise the
          scene further with the <Link to='/builder'>Builder</Link> or{' '}
          <Link to='/editor'>Editor</Link>.
        </p>
        <p>If you don't have an immersive headset to hand:</p>
        <ul>
          <li>
            Use the <span className='key'>W</span>,
            <span className='key'>A</span>.<span className='key'>S</span>, and{' '}
            <span className='key'>D</span> keys to move around
          </li>
          <li>
            Use your mouse to rotate the camera and interact with filters and
            marks.
          </li>
        </ul>
        <p>
          The examples on this page also work in mobile browsers, however for AR
          and VR your browser must support{' '}
          <a href='https://caniuse.com/webxr'>WebXR</a>.
        </p>
      </section>
      <>
        {examples.map((el, i) => (
          <section key={`example${i}`}>
            <h2>{el.title}</h2>
            <p>{el.description}</p>
            <ul>
              {el.examples.map((example, j) => (
                <li key={`example${j}`}>
                  <button
                    onClick={() => {
                      actions.runEditorConfig(example.config);
                    }}>
                    {example.description}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </>
    </StyledExamples>
  );
};

export default Examples;
