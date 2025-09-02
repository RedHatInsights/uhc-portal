import React from 'react';

import { Alert, Skeleton, Spinner } from '@patternfly/react-core';

import InstructionCommand from '../common/InstructionCommand';

import RevokeTokensInstructions from './RevokeTokensInstructions';

type Props = {
  token?: string;
  command?: string;
  showCommandOnError?: boolean;
  showInstructionsOnError?: boolean;
} & Partial<React.ComponentProps<typeof InstructionCommand>>;

const InvalidGrant = 'invalid_grant';

/**
 * Generates a box for containing the value of a token.
 */
const TokenBox = ({
  token,
  command = '{{TOKEN}}',
  showCommandOnError = false,
  showInstructionsOnError = true,
  textAriaLabel = 'Copyable token',
  className = '',
  ...props
}: Props) => {
  if (!token) {
    return (
      <div className="pf-v6-u-mt-md">
        <div className="pf-v6-u-mb-xs">
          <Spinner size="lg" aria-label="Loading..." />
          <span>Loading token, this might take a minute</span>
        </div>
        <Skeleton fontSize="md" screenreaderText="Loading..." />
      </div>
    );
  }
  const instructionCommand = (
    <InstructionCommand
      className={className}
      textAriaLabel={textAriaLabel}
      outerClassName="pf-v6-u-mt-md"
      {...props}
    >
      {command.replace('{{TOKEN}}', token === InvalidGrant ? '' : token)}
    </InstructionCommand>
  );
  if (token === InvalidGrant) {
    return (
      <>
        {showCommandOnError && instructionCommand}
        {showInstructionsOnError && (
          <Alert
            variant="warning"
            isInline
            className="pf-v6-u-mt-md"
            id="invalid_grant-message"
            title="Could not grant an offline token"
          >
            <RevokeTokensInstructions reason="You might have exceeded the maximum number of offline sessions." />
          </Alert>
        )}
      </>
    );
  }
  return instructionCommand;
};

export default TokenBox;
