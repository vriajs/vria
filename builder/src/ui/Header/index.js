import React from 'react';
import styled, { css } from 'styled-components';
import Logo from './Logo';

const StyledHeader = styled.header(
  ({ theme }) => css`
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: ${theme.header.padding};
    height: ${theme.header.height};
    background-color: ${theme.header.backgroundColor};
    border-bottom: solid 1px ${theme.header.borderColor};
  `
);

const Menu = styled.nav(
  ({ theme }) => css`
    display: flex;
  `
);

const MenuItem = styled.a(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    height: 100%;
    color: ${theme.header.menu.color};
    text-decoration: none;
    margin-right: 15px;
    border: solid 1px ${theme.header.menu.border};
    padding: 0px 12px;
    box-sizing: border-box;
    border-radius: 4px;

    i {
      margin-right: 8px;
    }

    &:hover {
      background-color: ${theme.header.menu.highlight};
    }

    &:last-child {
      margin-right: 0px;
    }

    @media (max-width: 850px) {
      span {
        display: none;
      }
      i {
        margin: 0px;
      }
    }
  `
);

const Header = ({ version }) => {
  return (
    <StyledHeader>
      <Logo version={version} />
      <Menu>
        <MenuItem href='https://github.com/vriajs' target='_blank'>
          <i className='fab fa-github'></i>
          <span>VRIA on GitHub</span>
        </MenuItem>
        <MenuItem href='https://npmjs.com/vria' target='_blank'>
          <i className='fab fa-npm'></i>
          <span>VRIA on NPM</span>
        </MenuItem>
        <MenuItem
          href='https://ieeexplore.ieee.org/document/8954824'
          target='_blank'>
          <i className='far fa-file-pdf'></i>
          <span>VRIA TVCG Paper</span>
        </MenuItem>
      </Menu>
    </StyledHeader>
  );
};

export default Header;
