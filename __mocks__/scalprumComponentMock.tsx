import React from 'react';

const plainFnMock = () => 1;

type ScalprumComponentProps = {
  scope: string;
  module: string;
};

export const ScalprumComponent = ({ scope, module }: ScalprumComponentProps) => {
     <div>Fake {scope} UI {module} component</div>
};


export const useScalprum = plainFnMock;

export const useModule = () => undefined;
