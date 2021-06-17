import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

import View from './View';

const StyledBuilder = styled(View)(
  ({ theme }) => css`
    color: white;
    padding: 15px 15px;

    h1 {
      margin-top: 0px;
    }

    a {
      color: #fff;

      &:hover {
        color: #ccc;
      }
    }

    .intro {
      border-bottom: solid 1px #333;
    }
  `
);

const DeleteButton = styled.button`
  border: none;
  font-size: 0.9em;
  background: #ff1744;
  color: white;
  padding: 6px;
  cursor: pointer;

  span {
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 6px;
  }
`;

const AddButton = styled.button`
  border: none;
  font-size: 0.9em;
  background: #2196f3;
  color: white;
  padding: 6px;
  margin: 0px 0px 0px 3px;
  cursor: pointer;

  span {
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 6px;
  }
`;

const StyledViewBuilder = styled.div`
  border-bottom: solid 1px #404040;
  padding-bottom: 12px;
  min-width: 420px;
  margin-bottom: 12px;

  select {
    min-width: 125px;
    padding: 5px;
    border: none;
    background: #303030;
    color: white;
    font-size: 1em;
  }
  input[type='text'] {
    min-width: 250px;
    background: #303030;
    color: white;
    border: 0;
    padding: 5px;
  }
  input[type='number'] {
    width: 40px;
    background: #303030;
    color: white;
    border: 0;
    padding: 5px;
  }
  table {
    margin-bottom: 10px;
  }
  thead tr:not(:only-child) {
    th {
      height: 0px;
    }
  }
  th {
    text-align: left;
    height: 40px;
  }
  h2 {
    margin-bottom: 0;
  }
`;

const ViewHeader = styled.header`
  display: flex;
  justify-content: space-between;

  h2 {
    margin-top: 0px;
  }
`;

const ViewBuilder = ({ editorConfigJSON, actions, index, viewArray, view }) => {
  const encodings = Object.keys(view.encoding);
  const title = view.title || 'Untitled';

  let mark;
  if (view.mark !== undefined) {
    if (typeof view.mark === 'string') {
      mark = view.mark;
    } else {
      if (view?.mark?.type !== undefined) {
        mark = view.mark.type;
      }
    }
  }
  const hasMark = mark !== undefined;
  const viewProps = [
    'mark',
    'encoding',
    'x',
    'y',
    'z',
    'xrotation',
    'yrotation',
    'zrotation',
    'width',
    'height',
    'depth'
  ];
  const availableChannels = [
    'x',
    'y',
    'z',
    'xoffset',
    'yoffset',
    'zoffset',
    'width',
    'height',
    'depth',
    'xrotation',
    'yrotation',
    'zrotation',
    'size',
    'color',
    'opacity',
    'length',
    'shape'
  ];
  const pos = ['x', 'y', 'z'];
  const rot = ['xrotation', 'yrotation', 'zrotation'];
  const dim = ['width', 'height', 'depth'];
  const availableTypes = ['quantitative', 'nominal', 'ordinal', 'temporal'];
  const availableMarkTypes = ['point', 'bar'];

  // Fields available in this view
  const availableFields = Object.keys(editorConfigJSON.data.values[0]);

  // Remaining channels
  const remainingChannels = availableChannels.filter(
    (el) => !Object.keys(view.encoding).includes(el)
  );

  // Add a channel to the view
  const addNewChannel = () => {
    const enc = remainingChannels[0];
    if (viewArray) {
      // Config has a views array
      editorConfigJSON.views[index].encoding = {
        ...editorConfigJSON.views[index].encoding,
        [enc]: {}
      };
    } else {
      // No view array
      editorConfigJSON.encoding = {
        ...editorConfigJSON.encoding,
        [enc]: {}
      };
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // Delete view
  const deleteView = (v, i) => {
    if (v) {
      editorConfigJSON.views.splice(i, 1);
    } else {
      viewProps.forEach((vp) => {
        if (editorConfigJSON[vp]) delete editorConfigJSON[vp];
      });
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // Delete channel
  const deleteChannel = (v, i, c) => {
    if (v) {
      delete editorConfigJSON.views[i].encoding[c];
    } else {
      delete editorConfigJSON.encoding[c];
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // View title change
  const onTitleChange = (e) => {
    e.persist();
    if (viewArray) {
      editorConfigJSON.views[index].title = e.target.value;
    } else {
      editorConfigJSON.title = e.target.value;
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // Mark type change
  const onMarkTypeChange = (e) => {
    e.persist();
    if (viewArray) {
      if (typeof view.mark === 'string') {
        editorConfigJSON.views[index].mark = e.target.value;
      } else {
        editorConfigJSON.views[index].mark = {
          ...editorConfigJSON.views[index].mark,
          type: e.target.value
        };
      }
    } else {
      if (typeof view.mark === 'string') {
        editorConfigJSON.mark = e.target.value;
      } else {
        editorConfigJSON.mark.type = e.target.value;
      }
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // Channel change
  const onChannelChange = (e, enc) => {
    e.persist();
    if (viewArray) {
      editorConfigJSON.views[index].encoding[e.target.value] =
        editorConfigJSON.views[index].encoding[enc];
      delete editorConfigJSON.views[index].encoding[enc];
    } else {
      editorConfigJSON.encoding[e.target.value] =
        editorConfigJSON.encoding[enc];
      delete editorConfigJSON.encoding[enc];
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // Field change
  const onFieldChange = (e, enc) => {
    e.persist();
    if (viewArray) {
      editorConfigJSON.views[index].encoding[enc].field = e.target.value;
    } else {
      editorConfigJSON.encoding[enc].field = e.target.value;
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // Type change
  const onTypeChange = (e, enc) => {
    e.persist();
    if (viewArray) {
      editorConfigJSON.views[index].encoding[enc].type = e.target.value;
    } else {
      editorConfigJSON.encoding[enc].type = e.target.value;
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  // Pos, Rot or Dim change
  const onPosRotDimChange = (e, v) => {
    e.persist();
    if (viewArray) {
      editorConfigJSON.views[index][v] = parseFloat(e.target.value);
    } else {
      editorConfigJSON[v] = parseFloat(e.target.value);
    }
    actions.setEditorConfig(JSON.stringify(editorConfigJSON, null, 2));
  };

  return (
    <StyledViewBuilder>
      <ViewHeader>
        <h2>View {index + 1}</h2>
        <DeleteButton onClick={() => deleteView(viewArray, index)}>
          <i className='far fa-trash-alt'></i> <span>Delete View</span>
        </DeleteButton>
      </ViewHeader>
      <table>
        <thead>
          <tr>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type='text'
                defaultValue={title}
                onChange={onTitleChange}></input>
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Mark Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <select
                name='markType'
                defaultValue={hasMark ? mark : 'Choose Mark'}
                onChange={onMarkTypeChange}>
                {!hasMark ? (
                  <option value='Choose Mark'>Choose Mark</option>
                ) : null}
                {availableMarkTypes.map((mt, i) => (
                  <option value={mt} key={`mt${i}`}>
                    {mt}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th colSpan='3'>Position</th>
            <th colSpan='3'>Rotation</th>
            <th colSpan='3'>Dimensions</th>
          </tr>
          <tr>
            <th>X</th>
            <th>Y</th>
            <th>Z</th>
            <th>X</th>
            <th>Y</th>
            <th>Z</th>
            <th>Width</th>
            <th>Height</th>
            <th>Depth</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {pos.map((p, i) => (
              <td key={`p${p}${i}`}>
                <input
                  type='number'
                  placeholder='0'
                  step='0.01'
                  defaultValue={
                    viewArray
                      ? editorConfigJSON.views[index][p] || 0
                      : editorConfigJSON[p] || 0
                  }
                  onChange={(e) => onPosRotDimChange(e, p)}></input>
              </td>
            ))}
            {rot.map((r, i) => (
              <td key={`r${r}${i}`}>
                <input
                  type='number'
                  placeholder='0'
                  step='0.01'
                  defaultValue={
                    viewArray
                      ? editorConfigJSON.views[index][r] || 0
                      : editorConfigJSON[r] || 0
                  }
                  onChange={(e) => onPosRotDimChange(e, r)}></input>
              </td>
            ))}
            {dim.map((d, i) => (
              <td key={`r${d}${i}`}>
                <input
                  type='number'
                  placeholder='0'
                  step='0.1'
                  min='0'
                  defaultValue={
                    viewArray
                      ? editorConfigJSON.views[index][d] || 0
                      : editorConfigJSON[d] || 0
                  }
                  onChange={(e) => onPosRotDimChange(e, d)}></input>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Channel</th>
            <th>Field Name</th>
            <th>Data Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {encodings.map((enc, i) => (
            <tr key={`enc${enc}${i}`}>
              <td>
                <select
                  name={`enc${i}ch`}
                  defaultValue={enc}
                  onChange={(e) => onChannelChange(e, enc)}>
                  {availableChannels.map((ch, j) => (
                    <option
                      value={ch}
                      key={`enc${i}ch${j}`}
                      disabled={!remainingChannels.includes(ch)}>
                      {ch}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  name={`enc${i}fi`}
                  defaultValue={
                    view.encoding[enc].field
                      ? view.encoding[enc].field
                      : 'Choose Field'
                  }
                  onChange={(e) => onFieldChange(e, enc)}>
                  {!view.encoding[enc].field ? (
                    <option value='Choose Field'>Choose Field</option>
                  ) : null}
                  {availableFields.map((fi, j) => (
                    <option value={fi} key={`enc${i}fi${j}${fi}`}>
                      {fi}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  name={`enc${i}ty`}
                  defaultValue={
                    view.encoding[enc].type
                      ? view.encoding[enc].type
                      : 'Choose Type'
                  }
                  onChange={(e) => onTypeChange(e, enc)}>
                  {!view.encoding[enc].type ? (
                    <option value='Choose Type'>Choose Type</option>
                  ) : null}
                  {availableTypes.map((ty, j) => (
                    <option value={ty} key={`enc${i}ty${j}${ty}`}>
                      {ty}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <DeleteButton
                  onClick={() => deleteChannel(viewArray, index, enc)}>
                  <i className='far fa-trash-alt'></i>
                </DeleteButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {remainingChannels.length !== 0 ? (
        <AddButton onClick={addNewChannel}>
          <i className='far fa-plus'></i>
          <span>Add Channel Encoding</span>
        </AddButton>
      ) : null}
    </StyledViewBuilder>
  );
};

const DropDownBuilder = ({ editorConfig, actions }) => {
  const c = JSON.parse(editorConfig);

  if (c.encoding) {
    // Single view - Has encoding
    return (
      <ViewBuilder
        editorConfigJSON={c}
        actions={actions}
        index={0}
        viewArray={false}
        view={{
          title: c.title,
          encoding: c.encoding,
          mark: c.mark
        }}
      />
    );
  } else if (c.views) {
    // Multi view - Has views array
    return c.views.map((view, i) => (
      <ViewBuilder
        key={`bv${i}`}
        editorConfigJSON={c}
        actions={actions}
        index={i}
        viewArray={true}
        view={{
          title: view.title,
          encoding: view.encoding,
          mark: view.mark
        }}
      />
    ));
  } else {
    // No encodings or views yet
    return null;
  }
};

const Builder = ({ editorConfig, actions }) => {
  const [configHasDataset, setConfigHasDataset] = useState(false);

  useEffect(() => {
    try {
      const c = JSON.parse(editorConfig);
      if (c?.data?.values?.length) {
        setConfigHasDataset(true);
      }
    } catch {}
  }, [editorConfig]);

  const viewProps = [
    'mark',
    'encoding',
    'x',
    'y',
    'z',
    'xrotation',
    'yrotation',
    'zrotation',
    'width',
    'height',
    'depth'
  ];

  // Add new view
  const addNewView = () => {
    const c = JSON.parse(editorConfig);
    const viewTemplate = { title: 'Untitled', encoding: {} };
    if (c.views) {
      // Has view array
      c.views.push(viewTemplate);
    } else if (c.encoding) {
      // Has encoding
      c.views = [{ title: c.title || 'Untitled' }];
      viewProps.forEach((v) => {
        if (c[v]) {
          c.views[0][v] = c[v];
          delete c[v];
        }
      });

      c.views.push(viewTemplate);
    } else {
      // Has neither a view array or encoding
      c.views = [viewTemplate];
    }
    actions.setEditorConfig(JSON.stringify(c, null, 2));
  };

  return (
    <StyledBuilder>
      {configHasDataset ? (
        <>
          <DropDownBuilder editorConfig={editorConfig} actions={actions} />
          <AddButton onClick={addNewView}>
            <i className='far fa-plus'></i>
            <span>Create New View</span>
          </AddButton>
        </>
      ) : (
        <div>
          <h1>VRIA Builder</h1>
          <p>
            First <Link to='/data'>load a dataset</Link>, or{' '}
            <Link to='/examples'>choose an example</Link> to begin using the
            builder.
          </p>
          <p>
            Already have a dataset loaded? Your vis-config may contain invalid
            JSON.
          </p>
          <p>
            To learn about the VRIA grammar, please refer to the{' '}
            <a href='https://docs.google.com/spreadsheets/d/1WdzG45G8_wPnhOeLuEgZEYGCOWJqBhzJeYFBL7Pbdf0'>
              VRIA Grammar Definition
            </a>
            .
          </p>
        </div>
      )}
    </StyledBuilder>
  );
};

export default Builder;
