import React from 'react';
import axios from 'axios';

import {
  Alert,
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';

import validators from '~/common/validators';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { formatOcmApiErrorMessage } from '~/queries/helpers';
import clusterService from '~/services/clusterService';
import { GcpFirewallRule } from '~/types/clusters_mgmt.v1';

const DEFAULT_MACHINE_CIDR = '10.0.0.0/16';

type CreateFirewallRulesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  network: string;
  projectId?: string;
  wifConfigId?: string;
  profile: string;
  createFirewallRulesCommand: string;
};

const getCreateErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const { code, reason } = err.response?.data ?? {};
    const formatted = formatOcmApiErrorMessage(code, reason, err.response?.status);
    if (formatted) {
      return formatted;
    }
    return err.message || 'Failed to create firewall rules';
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Failed to create firewall rules';
};

export const CreateFirewallRulesModal = ({
  isOpen,
  onClose,
  onSuccess,
  network,
  projectId,
  wifConfigId,
  profile,
  createFirewallRulesCommand,
}: CreateFirewallRulesModalProps) => {
  const [name, setName] = React.useState('');
  const [machineCidr, setMachineCidr] = React.useState(DEFAULT_MACHINE_CIDR);
  const [nameError, setNameError] = React.useState<string | undefined>();
  const [cidrError, setCidrError] = React.useState<string | undefined>();
  const [submitError, setSubmitError] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setMachineCidr(DEFAULT_MACHINE_CIDR);
      setNameError(undefined);
      setCidrError(undefined);
      setSubmitError(undefined);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const nextNameError = validators.required(name);
    const nextCidrError = validators.required(machineCidr) || validators.cidr(machineCidr);
    setNameError(nextNameError);
    setCidrError(nextCidrError);
    return !nextNameError && !nextCidrError;
  };

  const handleSubmit = async () => {
    setSubmitError(undefined);
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: GcpFirewallRule = {
        name: name.trim(),
        profile,
        wif_config: { id: wifConfigId },
        gcp_network: {
          project_id: projectId,
          vpc_name: network,
          machine_cidr: machineCidr.trim(),
        },
        template: {
          version: 'v1',
          href: `/api/clusters_mgmt/v1/gcp/firewall_rule_templates/v1/profiles/${profile}`,
        },
      };
      await clusterService.createGcpFirewallRule(payload);
      await onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(getCreateErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={isSubmitting ? undefined : onClose}
      aria-labelledby="create-firewall-rules-modal-title"
      aria-describedby="create-firewall-rules-modal-body"
    >
      <ModalHeader
        title={`Add firewall rule for vpc ${network}`}
        labelId="create-firewall-rules-modal-title"
      />
      <ModalBody id="create-firewall-rules-modal-body">
        <Form>
          {submitError ? (
            <Alert
              variant="danger"
              isInline
              title="Unable to create firewall rules"
              className="pf-v6-u-mb-md"
            >
              {submitError}
            </Alert>
          ) : null}
          <FormGroup label="Firewall rule name" isRequired fieldId="firewall-rule-name">
            <TextInput
              id="firewall-rule-name"
              value={name}
              onChange={(_event, value) => {
                setName(value);
                setNameError(undefined);
              }}
              isDisabled={isSubmitting}
              validated={nameError ? 'error' : 'default'}
            />
            <FormGroupHelperText touched error={nameError} validateOnSubmit />
          </FormGroup>
          <FormGroup label="Machine CIDR" isRequired fieldId="firewall-rule-machine-cidr">
            <TextInput
              id="firewall-rule-machine-cidr"
              value={machineCidr}
              onChange={(_event, value) => {
                setMachineCidr(value);
                setCidrError(undefined);
              }}
              isDisabled={isSubmitting}
              validated={cidrError ? 'error' : 'default'}
            />
            <FormGroupHelperText touched error={cidrError} validateOnSubmit />
          </FormGroup>
          <FormGroup label="CLI reference" fieldId="firewall-rule-cli-reference">
            <ClipboardCopy
              id="firewall-rule-cli-reference"
              textAriaLabel="Copyable create firewall rules command"
              variant={ClipboardCopyVariant.inline}
              isReadOnly
              hoverTip="Copy"
              clickTip="Copied"
            >
              {createFirewallRulesCommand}
            </ClipboardCopy>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="create"
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          Create
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
