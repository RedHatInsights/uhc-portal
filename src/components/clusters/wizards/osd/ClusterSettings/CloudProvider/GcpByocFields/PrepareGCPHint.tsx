import React from 'react';

import { Hint, HintBody, HintFooter, HintTitle } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

interface PrepareGCPHintProps {
  title: string;
  text: string;
  linkHref: string;
  linkText: string;
}

export const PrepareGCPHint = ({ title, text, linkHref, linkText }: PrepareGCPHintProps) => (
  <Hint className="pf-v6-u-mb-md pf-v6-u-mt-sm">
    <HintTitle>
      <strong>{title}</strong>
    </HintTitle>
    <HintBody>{text}</HintBody>
    <HintFooter>
      <ExternalLink href={linkHref}>{linkText}</ExternalLink>
    </HintFooter>
  </Hint>
);
