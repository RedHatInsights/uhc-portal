import { type MonacoEditor } from 'monaco-types';

import { ISyncEditorLoader } from './ISyncEditorLoader';

class DefaultSyncEditorLoader implements ISyncEditorLoader {
  configure(monaco: MonacoEditor, options?: any): () => void {
    throw new Error('Method not implemented.');
  }
}

export { DefaultSyncEditorLoader };
