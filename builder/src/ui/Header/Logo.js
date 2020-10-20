import React from 'react';
import styled, { css } from 'styled-components';
import { VRIALogo } from '../../assets';

const StyledLogo = styled.div(
  ({ theme }) => css`
    height: ${theme.logo.height};
    width: auto;
    user-select: none;
    display: flex;
    align-items: center;
  `
);

const LogoIcon = styled.div(
  ({ theme }) => css`
    width: ${theme.logo.width};
    height: ${theme.logo.height};
    background-image: url(${VRIALogo});
    background-size: 80%;
    background-position: center center;
    background-repeat: no-repeat;

    @media (max-width: 480px) {
      width: calc(${theme.logo.width} / 2);
    }
  `
);

const LogoText = styled.div(
  ({ theme }) => css`
    line-height: 45px;
    font-weight: 300;
    height: 45px;
    border-left: solid 1px ${theme.logo.divider.color};
    margin-left: 15px;
    padding-left: 15px;
    color: ${theme.logo.color};

    @media (max-width: 420px) {
      span {
        display: none;
      }
    }
  `
);

const LogoVersion = styled.span`
  background-color: #090;
  font-weight: bold;
  padding: 5px;
  height: 14px;
  line-height: 14px;
  color: #fff;
  margin-left: 15px;
  font-size: 0.8em;
  border-radius: 2px;
`;

const Logo = ({ version }) => (
  <StyledLogo>
    <LogoIcon />
    <LogoText>
      VRIA<span> Builder</span>
    </LogoText>
    <LogoVersion>{version}</LogoVersion>
  </StyledLogo>
);

export default Logo;
