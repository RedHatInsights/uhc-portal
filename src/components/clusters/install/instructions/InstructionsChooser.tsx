import React from 'react';

import { Label } from '@patternfly/react-core';
import StarIcon from '@patternfly/react-icons/dist/esm/icons/star-icon';

import { InstructionsChooserCard } from './InstructionsChooserCard';

import './InstructionsChooser.scss';

interface InstructionsChooserProps {
  aiPageLink?: string;
  aiLearnMoreLink?: string;
  agentBasedPageLink?: string;
  agentBasedLearnMoreLink?: string;
  hideIPI?: boolean;
  hideUPI?: boolean;
  ipiPageLink?: string;
  ipiLearnMoreLink?: string;
  upiPageLink?: string;
  upiLearnMoreLink?: string;
  recommend?: 'ai' | 'ipi';
  providerSpecificFeatures?: {
    ai?: React.ReactNode[];
    abi?: React.ReactNode[];
    ipi?: React.ReactNode[];
    upi?: React.ReactNode[];
  };
  name?: string;
}

export const InstructionsChooser = ({
  aiPageLink,
  aiLearnMoreLink,
  agentBasedPageLink,
  agentBasedLearnMoreLink,
  hideIPI = false,
  ipiPageLink,
  ipiLearnMoreLink,
  hideUPI = false,
  recommend = 'ai',
  upiPageLink,
  upiLearnMoreLink,
  providerSpecificFeatures = {},
  name,
}: InstructionsChooserProps) => (
  <div
    className="pf-v6-c-content ocm-page instructions-chooser"
    data-ouia-component-id={`${name}-instructions-chooser`}
  >
    {aiPageLink && (
      <InstructionsChooserCard
        id="select-interactive"
        href={aiPageLink}
        title="Interactive"
        labels={
          <>
            {recommend === 'ai' && (
              <Label color="blue" icon={<StarIcon />}>
                Recommended
              </Label>
            )}
            <Label color="purple">Web-based</Label>
          </>
        }
        body="Runs Assisted Installer with standard configuration settings to create your cluster."
        featureListItems={[
          'Preflight validations',
          'Smart defaults',
          'For connected networks',
          ...(providerSpecificFeatures.ai || []),
        ]}
        footerLinkHref={aiLearnMoreLink}
        footerLinkText="Learn more about interactive"
      />
    )}
    {agentBasedPageLink && (
      <InstructionsChooserCard
        id="select-agent-based"
        href={agentBasedPageLink}
        title="Local Agent-based"
        labels={<Label color="purple">CLI-based</Label>}
        body="Runs Assisted Installer securely and locally to create your cluster."
        featureListItems={[
          name === 'Ibmz' ? 'Installable PXE artifacts' : 'Installable ISO',
          'Preflight validations',
          ...(providerSpecificFeatures.abi || []),
        ]}
        footerLinkHref={agentBasedLearnMoreLink}
        footerLinkText="Learn more about local agent-based"
      />
    )}
    {!hideIPI && ipiPageLink && (
      <InstructionsChooserCard
        id="select-automated"
        href={ipiPageLink}
        title="Automated"
        labels={
          <>
            {recommend === 'ipi' && (
              <Label color="blue" icon={<StarIcon />}>
                Recommended
              </Label>
            )}
            <Label color="purple">CLI-based</Label>
          </>
        }
        body="Auto-provision your infrastructure with minimal configuration to create your cluster."
        featureListItems={[
          'Installer Provisioned Infrastructure',
          ...(providerSpecificFeatures.ipi || []),
        ]}
        footerLinkHref={ipiLearnMoreLink}
        footerLinkText="Learn more about automated"
      />
    )}
    {!hideUPI && upiPageLink && (
      <InstructionsChooserCard
        id="select-full-control"
        href={upiPageLink}
        title="Full control"
        labels={<Label color="purple">CLI-based</Label>}
        body="Make all of the decisions when you create your cluster."
        featureListItems={[
          'User Provisioned Infrastructure',
          'Highly customizable',
          ...(providerSpecificFeatures.upi || []),
        ]}
        footerLinkHref={upiLearnMoreLink}
        footerLinkText="Learn more about full control"
      />
    )}
  </div>
);
