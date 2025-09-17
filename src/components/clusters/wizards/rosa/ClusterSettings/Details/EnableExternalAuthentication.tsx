import React from 'react';

import { GridItem } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { CheckboxField } from '~/components/clusters/wizards/form';
import { CheckboxDescription } from '~/components/common/CheckboxDescription';
import ExternalLink from '~/components/common/ExternalLink';

export const EnableExternalAuthentication = () => (
  <GridItem md={6}>
    <CheckboxField
      name={FieldId.EnableExteranlAuthentication}
      label="External authentication"
      hint={
        <ExternalLink href={links.ROSA_HCP_EXT_AUTH}>
          Learn more about external authentication
        </ExternalLink>
      }
      formGroup={{ label: 'Enable external authentication' }}
    />
    <CheckboxDescription>
      Allow authentication to be handled by an external provider.
    </CheckboxDescription>
  </GridItem>
);
