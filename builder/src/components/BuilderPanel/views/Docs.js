import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import View from './View';

import docs from '../../../assets/docs.md';

import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const StyledDocs = styled(View)(
  ({ theme }) => css`
    height: 100%;
    color: white;
    padding: 0px 15px;

    a {
      color: #fff;

      &:hover {
        color: #ccc;
      }
    }

    ul {
      padding-left: 30px;
    }

    td,
    th {
      border: solid 1px #ccc;
      padding: 4px;
    }

    table {
      border-collapse: collapse;
      border: solid 1px #ccc;
    }
  `
);

const Docs = () => {
  const [md, setmd] = useState(null);

  fetch(docs)
    .then((res) => res.text())
    .then((content) => setmd(content));

  return (
    <StyledDocs>
      <ReactMarkdown
        plugins={[gfm]}
        children={md}
        linkTarget='_blank'
        transformLinkUri={(href) => {
          if (href.includes('https://')) {
            return href;
          } else {
            return `https://github.com/vriajs/vria/blob/master/README.md${href}`;
          }
        }}
      />
    </StyledDocs>
  );
};

export default Docs;
