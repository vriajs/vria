import React from 'react';
import styled, { css } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

const StyledBuilderMenu = styled.nav(
  ({ theme }) => css`
    display: flex;
    justify-content: space-between;
    height: ${theme.builder.menu.height};
    background-color: ${theme.builder.menu.borderShadow};
    box-sizing: border-box;
    border-bottom: solid 1px ${theme.builder.menu.borderShadow};
  `
);

const MenuLeft = styled.div`
  display: flex;
`;

const MenuCentre = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

const MenuRight = styled.div`
  display: flex;
`;

const tooltip = ({ theme, color }) => css`
  ::after {
    transition: opacity 0.2s ease-in-out;
    opacity: 0;
    pointer-events: none;
    content: attr(data-tooltip);
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    height: 25px;
    line-height: 25px;
    color: #eee;
    white-space: nowrap;
    font-size: 0.8em;
    background-color: #101010;
    border-radius: 2px;
    padding: 0px 10px;
    pointer-events: none;
    z-index: 2;
  }

  &:hover {
    background-color: ${color
      ? color
      : theme.builder.menu.backgroundColorHover};
    opacity: ${color ? 0.8 : 1};

    &[data-tooltip]::after {
      opacity: 1;
      pointer-events: none;
      content: attr(data-tooltip);
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      height: 25px;
      line-height: 25px;
      color: #eee;
      white-space: nowrap;
      font-size: 0.8em;
      background-color: #101010;
      border-radius: 2px;
      padding: 0px 10px;
      pointer-events: none;
      z-index: 2;
    }
  }
`;

const LinkButton = styled(Link)(
  ({ theme, location, to }) => css`
    position: relative;
    color: ${location === to
      ? theme.builder.menu.activeColor
      : theme.builder.menu.inactiveColor};
    text-decoration: none;
    line-height: 40px;
    height: 40px;
    text-align: center;
    display: flex;
    box-sizing: border-box;
    background-color: ${location !== to
      ? theme.builder.menu.backgroundColor
      : theme.builder.menu.backgroundColorHover};
    border-right: solid 1px ${theme.builder.menu.borderHighlight};
    border-bottom: solid 1px ${theme.builder.menu.borderShadow};

    &:not(:first-child) {
      border-left: solid 1px ${theme.builder.menu.borderShadow};
    }

    ${tooltip}
  `
);

const ActionButton = styled.a(
  ({ theme, color }) => css`
    position: relative;
    cursor: pointer;
    color: ${color ? '#FFF' : theme.builder.menu.inactiveColor};
    text-decoration: none;
    line-height: 40px;
    height: 40px;
    text-align: center;
    display: flex;
    box-sizing: border-box;
    background-color: ${color ? color : theme.builder.menu.backgroundColor};
    border-right: solid 1px ${theme.builder.menu.borderHighlight};
    border-bottom: solid 1px ${theme.builder.menu.borderShadow};

    &:not(:first-child) {
      border-left: solid 1px ${theme.builder.menu.borderShadow};
    }

    ${tooltip}
  `
);

const ButtonIcon = styled.i(
  ({ theme }) => css`
    width: 40px;
    height: 40px;
    line-height: 40px;
    display: block;
    box-sizing: border-box;
  `
);

const ButtonText = styled.span(
  ({ theme }) => css`
    font-weight: 600;
    font-size: 0.9em;
    text-transform: uppercase;
    padding-right: 12px;

    &:only-child {
      padding-right: 0px;
    }

    @media (max-width: 556px) {
      display: none;
    }
  `
);

const ConfigTitle = styled.div`
  margin: 6px 16px;
  border-radius: 4px;
  height: 28px;
  width: 100%;
  background-color: #1b1b1b;
  line-height: 28px;
  font-size: 0.8em;
  padding: 0px 10px;
  color: #bbbbbb;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const BuilderMenu = ({ running, title, actions }) => {
  const location = useLocation().pathname;

  return (
    <StyledBuilderMenu>
      <MenuLeft>
        <LinkButton to='/docs' location={location} data-tooltip='Documentation'>
          <ButtonIcon className='far fa-book' />
          <ButtonText>Docs</ButtonText>
        </LinkButton>
        <LinkButton
          to='/editor'
          location={location}
          data-tooltip='Config Editor'>
          <ButtonIcon className='far fa-brackets-curly' />
          <ButtonText>Editor</ButtonText>
        </LinkButton>
        <LinkButton
          to='/builder'
          location={location}
          data-tooltip='Drop-Down Builder'>
          <ButtonIcon className='far fa-cube' />
          <ButtonText>Builder</ButtonText>
        </LinkButton>
      </MenuLeft>
      <MenuCentre>
        <ConfigTitle>{title}</ConfigTitle>
      </MenuCentre>
      <MenuRight>
        <LinkButton to='/data' location={location} data-tooltip='Dataset'>
          <ButtonIcon className='far fa-file-chart-line' />
        </LinkButton>
        <LinkButton to='/settings' location={location} data-tooltip='Settings'>
          <ButtonIcon className='far fa-cog' />
        </LinkButton>
        <LinkButton to='/examples' location={location} data-tooltip='Examples'>
          <ButtonIcon className='far fa-images' />
        </LinkButton>
        <LinkButton to='/download' location={location} data-tooltip='Download'>
          <ButtonIcon className='far fa-download' />
        </LinkButton>
        {/* <ActionButton
          color={running ? '#900' : '#090'}
          onClick={() => actions.runEditorConfig()}>
          {running ? (
            <>
              <ButtonIcon className='far fa-stop' />
              <ButtonText>Stop</ButtonText>
            </>
          ) : (
            <>
              <ButtonIcon className='far fa-play' />
              <ButtonText>Run</ButtonText>
            </>
          )}
        </ActionButton> */}
        <ActionButton color='#090' onClick={() => actions.runEditorConfig()}>
          <ButtonIcon className='far fa-play' />
          <ButtonText>Run</ButtonText>
        </ActionButton>
      </MenuRight>
    </StyledBuilderMenu>
  );
};

export default BuilderMenu;
