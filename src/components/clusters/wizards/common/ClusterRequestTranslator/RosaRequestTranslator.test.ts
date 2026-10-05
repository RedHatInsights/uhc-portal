import { RosaRequestTranslator } from './RosaRequestTranslator';

describe('RosaRequestTranslator', () => {
  const translator = new RosaRequestTranslator();

  describe('toYaml', () => {
    it('serializes an object to YAML', () => {
      const result = translator.toYaml({ name: 'test-cluster', replicas: 3 });
      expect(result).toContain('name: test-cluster');
      expect(result).toContain('replicas: 3');
    });
  });

  describe('fromYaml', () => {
    it('parses valid YAML into an object', () => {
      const result = translator.fromYaml('name: test-cluster\nreplicas: 3\n');
      expect(result).toEqual({ name: 'test-cluster', replicas: 3 });
    });

    it('returns empty object for empty string (js-yaml v5 throws on load(""))', () => {
      expect(translator.fromYaml('')).toEqual({});
    });

    it('round-trips an object through toYaml and fromYaml', () => {
      const original = { name: 'test', region: 'us-east-1', nodes: 2 };
      const yaml = translator.toYaml(original);
      expect(translator.fromYaml(yaml)).toEqual(original);
    });
  });
});
