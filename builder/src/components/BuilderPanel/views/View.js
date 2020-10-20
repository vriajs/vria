import styled, { css } from 'styled-components';

const View = styled.div(
  ({ theme }) => css`
    height: calc(100% - ${theme.builder.status.height});
    overflow: auto;
  `
);

export default View;
