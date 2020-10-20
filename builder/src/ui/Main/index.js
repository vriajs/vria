import styled, { css } from 'styled-components';

const Main = styled.main(
  ({ theme }) => css`
    overflow: auto;
    box-sizing: border-box;
    height: calc(100% - ${theme.header.height});
    background-color: ${theme.main.backgroundColor};
  `
);

export default Main;
