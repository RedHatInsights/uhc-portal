import React from 'react';

import { Label } from '@patternfly/react-core';

import { isMac } from '~/common/navigator';

import { shortcut } from './model/shortcut';

type ShortcutProps = {
  shortcut: shortcut;
};
const Shortcut = ({ shortcut }: ShortcutProps) =>
  shortcut[isMac ? 'Mac' : 'PC']
    .map((key) => (
      <Label variant="outline" key={key}>
        {key}
      </Label>
    ))
    .reduce((prev, curr) => (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>{[prev, ' + ', curr]}</>
    ));

export { Shortcut };
