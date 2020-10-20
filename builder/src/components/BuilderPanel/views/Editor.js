import React from 'react';
import styled, { css } from 'styled-components';
import CodeEditor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
// import 'prismjs/components/prism-clike';

import View from './View';

const StyledEditor = styled(View)(
  ({ theme }) =>
    css`
      padding: 10px 0px;
      box-sizing: border-box;
      height: auto;
    `
);

const StyledCodeEditor = styled(CodeEditor)(
  ({ theme }) => css`
    font-family: 'Fira code', 'Fira Mono', monospace;
    font-size: 12;
  `
);

const Editor = ({ code, actions }) => {
  return (
    <StyledEditor>
      <StyledCodeEditor
        value={code}
        onValueChange={actions.onEditorChange}
        highlight={(c) =>
          highlight(c, languages.json)
            .split('\n')
            .map(
              (line) => `<span class="config-editor_line_number">${line}</span>`
            )
            .join('\n')
        }
        padding='10'
        className='config-editor'
      />
    </StyledEditor>
  );
};

export default Editor;
