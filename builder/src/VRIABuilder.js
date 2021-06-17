import React, { useReducer } from 'react';
import { ThemeProvider } from 'styled-components';
import { HashRouter as Router } from 'react-router-dom';
import { reducer, initialState, DispatchContext } from './reducer';

import themes from './themes';
import { BuilderPanel, GlobalStyle } from './components';
import { Wrapper, Header, Main } from './ui';

const VRIABuilder = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <DispatchContext.Provider value={dispatch}>
      <ThemeProvider theme={themes[state.theme]}>
        <GlobalStyle />
        <Wrapper>
          <Router>
            <Header version={state.version} />
            <Main>
              <BuilderPanel
                config={state.editorConfig}
                compiledConfig={state.compiledConfig}
                sceneActive={state.sceneActive}
                builderStatus={state.builderStatus}
                options={state.options}
                environment={state.environment}
                backgroundColor={state.backgroundColor}
              />
            </Main>
          </Router>
        </Wrapper>
      </ThemeProvider>
    </DispatchContext.Provider>
  );
};

export default VRIABuilder;
