import React from 'react';
import styled, { css } from 'styled-components';

const StyledBuilderStatus = styled.footer(
  ({ theme, statusType }) => css`
    height: ${theme.builder.status.height};
    line-height: ${theme.builder.status.height};
    padding: 0px 6px;
    background-color: ${statusType
      ? theme.builder.status[statusType]
      : theme.builder.status.backgroundColor};
    border-top: solid 1px ${theme.builder.status.borderHighlight};
    color: ${statusType
      ? theme.builder.status.activeColor
      : theme.builder.status.inactiveColor};
    font-size: 0.8em;
    display: flex;
    justify-content: space-between;
  `
);

const StyledStatusIcon = styled.i(
  ({ theme }) => css`
    height: ${theme.builder.status.height};
    line-height: ${theme.builder.status.height};
    margin-right: 6px;
  `
);

const StatusClearButton = styled.button`
  font-size: 0.8em;
  background: transparent;
  border: none;
  color: #fff;
  height: 30px;
  line-height: 30px;
  padding: 0px;
  margin-right: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0px 8px;
  white-space: nowrap;
  cursor: pointer;

  i {
    margin-right: 6px;
  }

  span {
    text-transform: uppercase;
  }
`;

const StatusClear = ({ clearBuilderStatus }) => (
  <StatusClearButton onClick={clearBuilderStatus}>
    <i className='far fa-times'></i>
    <span>Clear</span>
  </StatusClearButton>
);

const StatusIcon = ({ iconClass }) => {
  return <StyledStatusIcon className={iconClass} />;
};

const StyledStatusMessage = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 auto;
`;

const StatusMessage = ({ message }) => {
  return <StyledStatusMessage>{message}</StyledStatusMessage>;
};

const BuilderStatus = ({ status, actions }) => {
  const type = status ? status.type : null;
  const message = status ? status.message : 'Ready';

  let iconClass = null;
  let statusType = null;

  switch (type) {
    // Success
    case 0:
      iconClass = 'far fa-check-circle';
      statusType = 'success';
      break;
    // Error
    case 1:
      iconClass = 'far fa-times-circle';
      statusType = 'error';
      break;
    // Warning
    case 2:
      iconClass = 'far fa-exclamation-triangle';
      statusType = 'warning';
      break;
    // Info
    case 3:
      iconClass = 'far fa-info-circle';
      statusType = 'info';
      break;
    default:
      break;
  }

  return (
    <StyledBuilderStatus statusType={statusType}>
      <StatusIcon iconClass={iconClass} />
      <StatusMessage message={message} />
      {statusType ? (
        <StatusClear clearBuilderStatus={actions.clearBuilderStatus} />
      ) : null}
    </StyledBuilderStatus>
  );
};

export default BuilderStatus;
