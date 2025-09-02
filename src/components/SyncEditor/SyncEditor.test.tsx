import React from 'react';

import { Language } from '@patternfly/react-code-editor';

import { render } from '~/testUtils';

import { SyncEditor } from './SyncEditor';

/*
TODO: This component was hard to test because the react-monaco-editor did not render inside the tests so it was mocked

*/

const MockMonacoEditor = jest.fn();

MockMonacoEditor.mockImplementation((props) => (
  <textarea onChange={props.onChange} value={JSON.stringify(props)} />
));

jest.mock('react-monaco-editor', () => ({
  __esModule: true,
  ...jest.requireActual('react-monaco-editor'),
  default: (props: any) => {
    MockMonacoEditor(props);
    return <MockMonacoEditor />;
  },
}));

describe('SyncEditor', () => {
  const mockOnChange = jest.fn();
  const mockSchemas = [{ id: 'json', filename: 'json' }];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the editor with default props', () => {
    render(
      <SyncEditor
        onChange={mockOnChange}
        schemas={mockSchemas}
        language={Language.yaml}
        isSideBarVisible={false}
      />,
    );

    const initialProps = {
      width: '100%',
      height: '100%',
      language: 'yaml',
      theme: 'vs-light',
      options: {
        automaticLayout: true,
        fixedOverflowWidgets: true,
        minimap: {
          enabled: true,
        },
        quickSuggestions: {
          comments: true,
          other: true,
          strings: true,
        },
        readOnly: undefined,
        readOnlyMessage: undefined,
        selectOnLineNumbers: true,
      },
      value: undefined,
      editorDidMount: expect.anything(),
      onChange: expect.anything(),
    };
    expect(MockMonacoEditor).toHaveBeenNthCalledWith(1, initialProps);
  });

  it('passes on props to monaco editor', () => {
    render(
      <SyncEditor
        content="my content"
        isReadOnly
        readOnlyMessage={'my read only message' as any}
        onChange={mockOnChange}
        schemas={mockSchemas}
        language={Language.javascript}
        isDarkTheme
        isSideBarVisible={false}
      />,
    );

    const initialProps = {
      width: '100%',
      height: '100%',
      language: 'javascript',
      theme: 'vs-dark',
      options: {
        automaticLayout: true,
        fixedOverflowWidgets: true,
        minimap: {
          enabled: true,
        },
        quickSuggestions: {
          comments: true,
          other: true,
          strings: true,
        },
        readOnly: true,
        readOnlyMessage: 'my read only message',
        selectOnLineNumbers: true,
      },
      value: 'my content',
      editorDidMount: expect.any(Function),
      onChange: expect.any(Function),
    };
    expect(MockMonacoEditor).toHaveBeenNthCalledWith(1, initialProps);
  });
});
