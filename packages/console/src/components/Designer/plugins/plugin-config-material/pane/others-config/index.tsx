import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import { Store } from 'antd/es/form/interface';
import React, { useState } from 'react';

export interface OthersConfigProps {
  initialValues: Store;
  onChange?: (values: Store) => void;
}

const OthersConfig: React.FC<OthersConfigProps> = ({ initialValues, onChange }) => {
  const [editorValue, setEditorValue] = useState(JSON.stringify(initialValues, null, 2));

  const onCodeChange = (code: string) => {
    try {
      const newValues = JSON.parse(code);
      setEditorValue(code);
      onChange?.(newValues);
    } catch {
      //
    }
  };

  return (
    <MonacoEditor
      height="calc(100vh - 235px)"
      language="json"
      onChange={onCodeChange}
      supportFullScreen={true}
      value={editorValue}
    />
  );
};

export default OthersConfig;
