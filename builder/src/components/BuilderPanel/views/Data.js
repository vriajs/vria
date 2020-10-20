import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

import View from './View';

const StyledData = styled(View)(
  ({ theme }) => css`
    color: white;
    padding: 0px 15px;

    .intro {
      border-bottom: solid 1px #333;
      padding-bottom: 20px;
    }

    a {
      color: #fff;

      &:hover {
        color: #ccc;
      }
    }
  `
);

const InfoContainsDataset = styled.p`
  border: solid 1px;
  border-radius: 4px;
  padding: 10px;
`;

const CodeSnippet1 = styled.pre`
  margin-left: 15px;
`;

const getColor = (props) => {
  if (props.isDragAccept) {
    return '#00e676';
  }
  if (props.isDragReject) {
    return '#ff1744';
  }
  if (props.isDragActive) {
    return '#2196f3';
  }
  return '#eeeeee';
};

const DropArea = styled.div(
  (props) => css`
    border: dashed 2px ${getColor(props)};
    text-align: center;
    color: ${getColor(props)};
    cursor: pointer;
  `
);

const isJSON = (str) => {
  let out;
  try {
    out = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return Array.isArray(out);
};

function FileUploader(props) {
  const { editorConfig, actions } = props;
  const [currentFile, setCurrentFile] = useState(null);
  const [readError, setReadError] = useState(null);
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => setReadError('File read was aborted');
      reader.onerror = () => setReadError('File read has failed');
      reader.onload = () => setCurrentFile(reader.result);
      reader.readAsText(file);
    });
  }, []);
  const history = useHistory();

  const {
    acceptedFiles,
    fileRejections,
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop,
    accept: 'text/csv, application/json',
    multiple: false
  });

  const importDataset = () => {
    console.log('editorConfig', editorConfig);

    try {
      let c = JSON.parse(editorConfig);
      console.log(c);

      if (currentFile !== null) {
        if (isJSON(currentFile)) {
          // File is JSON
          c.data = {
            values: JSON.parse(currentFile)
          };
        } else {
          // File is CSV
          c.data = {
            values: Papa.parse(currentFile, {
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true
            }).data
          };
        }
        actions.setEditorConfig(JSON.stringify(c, null, 2));
        history.push('/editor');
      }
    } catch {
      setReadError('Cannot import dataset: Vis-config contains invalid JSON');
    }
  };

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {(file.size / 1000).toFixed(2)} KB -{' '}
      <button onClick={importDataset}>Use Dataset</button>
    </li>
  ));

  return (
    <section className='container'>
      <DropArea {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
        <input {...getInputProps()} />
        <p>Drag a CSV or JSON file here or click to upload.</p>
      </DropArea>
      {files.length !== 0 ? (
        <aside>
          <h3>Uploaded file:</h3>
          <ul>{files}</ul>
        </aside>
      ) : null}
      {fileRejections.length !== 0 ? (
        <aside>
          <p>{fileRejections[0].errors[0].message}</p>
        </aside>
      ) : null}
      <div>{readError}</div>
    </section>
  );
}

const Data = ({ editorConfig, actions }) => {
  const [configHasDataset, setConfigHasDataset] = useState(false);

  useEffect(() => {
    try {
      const c = JSON.parse(editorConfig);
      if (c?.data?.values?.length) {
        setConfigHasDataset(true);
      }
    } catch {}
  }, [editorConfig]);

  return (
    <StyledData>
      <h1>Load Dataset</h1>
      <section className='intro'>
        <p>
          VRIA accepts tabular data (
          <a href='https://en.wikipedia.org/wiki/Tidy_data'>tidy data</a>)
          formatted as CSV or JSON.
        </p>
        {configHasDataset ? (
          <InfoContainsDataset>
            <i className='far fa-info-circle'></i> Your vis-config already
            contains a dataset, are you sure you want to update it?
          </InfoContainsDataset>
        ) : (
          <p>
            Your vis-config does not yet contain a dataset. Upload a new
            dataset:
          </p>
        )}
        <FileUploader editorConfig={editorConfig} actions={actions} />
      </section>
      <h2>Add dataset by hand</h2>
      <p>
        Alternatively you can add data by hand. In the VRIA Builder, datasets
        should be included inline inside the values array:
      </p>
      <CodeSnippet1>{`{\n  "data": {\n    "values": []\n  }\n}`}</CodeSnippet1>
    </StyledData>
  );
};

export default Data;
