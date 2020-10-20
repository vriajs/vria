import styled, { css } from 'styled-components';
import SplitPane from 'react-split-pane';

const StyledSplitPane = styled(SplitPane)(
  ({ theme }) => css`
    overflow: auto;
    box-sizing: border-box;
    height: calc(
      100% - ${theme.header.height} - ${theme.builder.menu.height}
    ) !important;
  `
);

export default StyledSplitPane;
