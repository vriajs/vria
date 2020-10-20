import React, { useState, useEffect, useContext } from 'react';
import styled, { css } from 'styled-components';
import { Switch, Route, Redirect } from 'react-router-dom';

import { AFrameScene } from '../../components';
import { DispatchContext } from '../../reducer';
import { actionTypes } from '../../actions';
import { SplitPane } from '../../ui';

import View, {
  Docs,
  Editor,
  Builder,
  Data,
  Settings,
  Examples,
  Download
} from './views';
import BuilderMenu from './BuilderMenu';
import BuilderStatus from './BuilderStatus';

const StyledBuilderPanel = styled.div(
  ({ theme }) => css`
    background-color: ${theme.builder.backgroundColor};
    height: 100%;
  `
);

const BuilderPanel = ({
  config,
  compiledConfig,
  sceneActive,
  builderStatus,
  options,
  environment,
  backgroundColor
}) => {
  const [editorConfig, setEditorConfig] = useState(config);
  const [title, setTitle] = useState('Untitled');
  const dispatch = useContext(DispatchContext);

  useEffect(() => {
    if (builderStatus?.type === 0) {
      setTitle(JSON.parse(config).title);
    }
  }, [builderStatus, config]);

  // A new config has been received, update editor
  useEffect(() => {
    setEditorConfig(config);
  }, [config]);

  // Editor change callback
  const onEditorChange = (code) => {
    setEditorConfig(code);
  };

  // Run the config in the editor
  const runEditorConfig = (config = editorConfig) => {
    dispatch({
      type: actionTypes.RUN_EDITOR_CONFIG,
      payload: config
    });
  };

  // Clear builder status
  const clearBuilderStatus = () => {
    dispatch({
      type: actionTypes.CLEAR_BUILDER_STATUS
    });
  };

  return (
    <>
      <BuilderMenu
        running={sceneActive}
        title={title}
        actions={{
          runEditorConfig
        }}
      />
      <SplitPane
        minSize='0%'
        maxSize='100%'
        onDragFinished={() => window.dispatchEvent(new Event('resize'))}
        split='vertical'
        defaultSize='50%'>
        <StyledBuilderPanel>
          <View>
            <Switch>
              <Route
                exact
                path='/'
                component={() => <Redirect to='/builder' />}
              />
              <Route exact path='/docs'>
                <Docs />
              </Route>
              <Route exact path='/editor'>
                <Editor code={editorConfig} actions={{ onEditorChange }} />
              </Route>
              <Route exact path='/builder'>
                <Builder
                  editorConfig={editorConfig}
                  actions={{ setEditorConfig }}
                />
              </Route>
              <Route exact path='/data'>
                <Data
                  editorConfig={editorConfig}
                  actions={{ setEditorConfig }}
                />
              </Route>
              <Route exact path='/settings'>
                <Settings
                  settings={{ options, environment, backgroundColor }}
                />
              </Route>
              <Route exact path='/examples'>
                <Examples actions={{ runEditorConfig }} />
              </Route>
              <Route exact path='/download'>
                <Download
                  editorConfig={editorConfig}
                  compiledConfig={compiledConfig}
                />
              </Route>
            </Switch>
          </View>
          <BuilderStatus
            status={builderStatus}
            actions={{
              clearBuilderStatus
            }}
          />
        </StyledBuilderPanel>
        <AFrameScene
          config={config}
          options={options}
          sceneActive={sceneActive}
          environment={environment}
          backgroundColor={backgroundColor}
        />
      </SplitPane>
    </>
  );
};

export default BuilderPanel;
