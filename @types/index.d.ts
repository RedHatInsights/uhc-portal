interface Insights {
  ocm?: {
    on: (event: string, callback: () => void) => () => void;
  };
  chrome: import('@redhat-cloud-services/types').ChromeAPI & {
    enable: {
      // missing debug function types
      segmentDev: () => void;
    };
  };
}

declare const insights: Insights;

interface Window {
  insights: Insights;
}

// See webpack config DefinePlugin
declare const APP_DEVMODE: boolean;
declare const APP_DEV_SERVER: boolean;
declare const BASE_PATH: string;
declare const APP_SENTRY_RELEASE_VERSION: string;

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.svg' {
  const value: any;
  export = value;
}

// polyfilled
interface ObjectConstructor {
  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   */
  fromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>): { [k: string]: T };

  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   */
  fromEntries(entries: Iterable<readonly any[]>): any;
}

declare module 'object.fromentries' {
  function shim(): void;
}
