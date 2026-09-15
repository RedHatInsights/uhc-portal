import { IClusterRequestTranslator } from './IClusterRequestTranslator';

class NotDefinedRequestTranslator implements IClusterRequestTranslator {
  toYaml(request: object): string {
    throw new Error('Method not implemented.');
  }

  fromYaml(yaml: string): object {
    throw new Error('Method not implemented.');
  }
}

export { NotDefinedRequestTranslator };
