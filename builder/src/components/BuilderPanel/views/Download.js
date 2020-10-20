import React from 'react';
import styled, { css } from 'styled-components';
import View from './View';

const StyledDownload = styled(View)(
  ({ theme }) => css`
    color: white;
    padding: 0px 15px;

    .intro {
      border-bottom: solid 1px #333;
    }

    div {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0px;
      }
    }
  `
);

const DownloadButton = styled.a`
  border: none;
  font-size: 0.9em;
  background: #2196f3;
  color: white;
  padding: 6px;
  margin: 0px 0px 0px 3px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;

  span {
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 6px;
  }
`;

const Download = ({ editorConfig, compiledConfig }) => {
  return (
    <StyledDownload>
      <h1>Download</h1>
      <section className='intro'>
        <p>
          You can download your VRIA vis-config compiled or uncompiled, either
          will work in a standalone VRIA application.
        </p>
        {compiledConfig ? (
          <>
            <div>
              <DownloadButton
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(compiledConfig)
                )}`}
                download='vria-builder-vis-config-compiled.json'>
                <i className='far fa-download'></i>
                <span>Download Compiled Vis-Config</span>
              </DownloadButton>
            </div>
            <div>
              <DownloadButton
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  editorConfig
                )}`}
                download='vria-builder-vis-config-uncompiled.json'>
                <i className='far fa-download'></i>
                <span>Download Uncompiled Vis-config</span>
              </DownloadButton>
            </div>
          </>
        ) : (
          <p>No valid vis-configs are available to download.</p>
        )}
      </section>
      <h2>Going Further</h2>
      <p>
        If you would like to include VRIA in a standalone application, you can
        do so by following the usage guides in the documentation. The{' '}
        <code>boilerplate/</code> directory in the VRIA package contains a
        starting point for new projects.
      </p>
    </StyledDownload>
  );
};

export default Download;
