/*
Copyright (c) 2020 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// This component shows to the user the OpenID refresh token, so that
// they can copy it and use it with the rosa command line utitility.

import React from 'react';

import links, { tools } from '../../common/installLinks.mjs';
import ExternalLink from '../common/ExternalLink';

import Tokens from './Instructions';

type Props = Omit<
  React.ComponentProps<typeof Tokens>,
  'commandName' | 'commandTool' | 'leadingInfo' | 'docsLink'
>;

const InstructionsROSA = (props: Props) => (
  <Tokens
    {...props}
    commandName="rosa"
    commandTool={tools.ROSA}
    docsLink={
      <ExternalLink href={links.ROSA_CLI_DOCS} noIcon>
        read more about setting up the rosa CLI
      </ExternalLink>
    }
  />
);

export default InstructionsROSA;
