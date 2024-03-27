import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface CodeBlockProps {
  language?: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'javascript', code }) => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: '4px' }}
      language={language}
      style={vscDarkPlus}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
