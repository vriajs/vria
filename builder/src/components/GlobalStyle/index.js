import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: "Roboto", sans-serif;
  }

  .root {
    height: 100%;
  }

  /* Split Pane */

  .Resizer {
    box-sizing: border-box;
    background: #2A2A2A;
    opacity: 1;
    z-index: 1;
    background-clip: padding-box;
    position: relative;
    -webkit-transition: all 0.5s ease-in-out;
    transition: all 0.5s ease-in-out;
  }

  .Resizer::before {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: -8px;
    font-family: "Font Awesome 5 Pro";
    color: #505050;
    font-weight: 300;
    font-size: 0.7em;
    content: '\f053';
    -webkit-transition: all 0.5s ease-in-out;
    transition: all 0.5s ease-in-out;
  }

  .Resizer::after {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 3px;
    font-family: "Font Awesome 5 Pro";
    color: #505050;
    font-weight: 300;
    content: '\f054';
    font-size: 0.7em;
    -webkit-transition: all 0.5s ease-in-out;
    transition: all 0.5s ease-in-out;
  }

  .Resizer:hover::before {
    left: -13px;
    padding-right: 8px;
  }

  .Resizer:hover::after {
    ${'' /* left: 8px; */}
    padding-left: 6px;
  }

  .Resizer.horizontal {
    height: 11px;
    margin: -5px 0;
    border-top: 5px solid rgba(255, 255, 255, 0);
    border-bottom: 5px solid rgba(255, 255, 255, 0);
    cursor: row-resize;
    width: 100%;
  }

  .Resizer.horizontal:hover {
    border-top: 5px solid #2A2A2A;
    border-bottom: 5px solid #2A2A2A;
  }

  .Resizer.vertical {
    width: 11px;
    margin: 0 -5px;
    border-left: 5px solid rgba(255, 255, 255, 0);
    border-right: 5px solid rgba(255, 255, 255, 0);
    cursor: col-resize;
  }

  .Resizer.vertical:hover {
    border-left: 5px solid #2A2A2A;
    border-right: 5px solid #2A2A2A;
  }

  /* Syntax Highlighting */

  .config-editor {
    padding-left: 3em !important;
    font-size: 12px;
    font-variant-ligatures: common-ligatures;
    border-radius: 3px;
    counter-reset: line;
    color: #BBB;
    caret-color: #FFF;
    height: 100%;
  }

  .config-editor_line_number:before {
    position: absolute;
    right: 100%;
    margin-right: 10px;
    text-align: right;
    opacity: .3;
    user-select: none;
    counter-increment: line;
    content: counter(line);
  }

  .config-editor textarea {
    outline: none;
    height: 100%;
    padding-left: 3em !important;
  }

  .config-editor pre {
    padding-left: 0px !important;
  }

  /* Red: #ff2000, Blue: #008dc7, Green: #00a100 */

  .config-editor .token.comment,
  .config-editor .token.prolog,
  .config-editor .token.doctype,
  .config-editor .token.cdata {
    color: slategray;
  }

  .config-editor .token.punctuation {
    color: #f8f8f2;
  }

  .config-editor .namespace {
    opacity: .7;
  }

  .config-editor .token.property,
  .config-editor .token.tag,
  .config-editor .token.constant,
  .config-editor .token.symbol,
  .config-editor .token.deleted {
    /* color: #f92672; */
    color: #ff2000;
  }

  .config-editor .token.boolean,
  .config-editor .token.number {
    /* color: #ae81ff; */
    color: #00a100;
  }

  .config-editor .token.selector,
  .config-editor .token.attr-name,
  .config-editor .token.string,
  .config-editor .token.char,
  .config-editor .token.builtin,
  .config-editor .token.inserted {
    /* color: #a6e22e; */
    color: #008dc7;
  }

  .config-editor .token.operator,
  .config-editor .token.entity,
  .config-editor .token.url,
  .config-editor .language-css .token.string,
  .config-editor .style .token.string,
  .config-editor .token.variable {
    color: #f8f8f2;
  }

  .config-editor .token.atrule,
  .config-editor .token.attr-value,
  .config-editor .token.function,
  .config-editor .token.class-name {
    color: #e6db74;
  }

  .config-editor .token.keyword {
    color: #66d9ef;
  }

  .config-editor .token.regex,
  .config-editor .token.important {
    color: #fd971f;
  }
`;

export default GlobalStyle;
