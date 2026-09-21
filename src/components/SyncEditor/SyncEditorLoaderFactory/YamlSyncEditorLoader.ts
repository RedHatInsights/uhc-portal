import { type MonacoEditor } from 'monaco-types';
import { configureMonacoYaml } from 'monaco-yaml';

import { ISyncEditorLoader } from './ISyncEditorLoader';

class YamlSyncEditorLoader implements ISyncEditorLoader {
  configure(monaco: MonacoEditor, options?: any): () => void {
    const { dispose } = configureMonacoYaml(monaco, {
      enableSchemaRequest: true,
      validate: true,
      format: true,
      hover: true,
      completion: true,
      ...options,
    });
    return dispose;
  }
}

export { YamlSyncEditorLoader };
