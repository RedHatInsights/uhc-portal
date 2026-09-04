import { dump, load } from 'js-yaml';

import { IClusterRequestTranslator } from './IClusterRequestTranslator';

class RosaRequestTranslator implements IClusterRequestTranslator {
  // TODO: to be implemented
  toYaml(request: object): string {
    return dump(request);
  }

  // TODO: to be implemented
  fromYaml(yaml: string): object {
    return load(yaml) as object;
  }
}

export { RosaRequestTranslator };
