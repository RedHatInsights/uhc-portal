import * as React from 'react';
import { AxiosError } from 'axios';

import {
  Alert,
  Brand,
  Bullseye,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Checkbox,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  FormGroup,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';

import config from '~/config';
import { PLATFORM_LIGHTSPEED_REBRAND } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import fedrampService from '~/services/fedrampService';

import redhatLogoImg from '../../../styles/images/Logo-RedHat-Hat-Color-RGB.png';

const GovCloudForm = ({
  title,
  onSubmitSuccess,
  hasGovEmail,
}: {
  title: string;
  onSubmitSuccess: () => void;
  hasGovEmail: boolean;
}) => {
  const [isUSPerson, setIsUSPerson] = React.useState(false);
  const [govContract, setGovContract] = React.useState(false);
  const [authPerson, setAuthPerson] = React.useState(false);
  const [contractID, setContractID] = React.useState<string>();
  const [rulesOfBehavior, setRulesOfBehavior] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>();

  const formReady = isUSPerson && govContract && authPerson && rulesOfBehavior;

  const allowPlatformLightspeedRebrand = useFeatureGate(PLATFORM_LIGHTSPEED_REBRAND);

  return (
    <Card style={{ maxWidth: '80rem', borderTopColor: '#e00', borderTopStyle: 'solid' }}>
      <CardTitle>
        <Flex
          alignContent={{ default: 'alignContentCenter' }}
          direction={{ default: 'column' }}
          justifyContent={{ default: 'justifyContentCenter' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem style={{ width: '5rem' }}>
            <Brand src={redhatLogoImg} alt="Red Hat Logo" />
          </FlexItem>
          <FlexItem>
            <Content>
              <Content component={ContentVariants.h1}>{title}</Content>
            </Content>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Content>
              <Content component={ContentVariants.p}>
                Red Hat OpenShift Service on AWS (ROSA) and Red Hat{' '}
                {allowPlatformLightspeedRebrand ? 'Lightspeed' : 'Insights'} in the GovCloud Region
                have been authorized (agency) under the Federal Risk Assessment and Management
                Program (FedRAMP) High and DoD Cloud Computing Security Requirements Guide (SRG).
              </Content>
              <Content component={ContentVariants.p}>
                Federal and government agencies can be granted access to the FedRAMP environment
                without further verification. However, commercial organizations and FISMA R&D
                universities will need to provide documentation to show that they are supporting a
                government contract/grant or in the process of bidding on a government
                contract/grant (RFP, RFI, pre-bid stage), confirmation of U.S. Person only access at
                the root level and agreement to the FedRAMP Rules of Behavior.
              </Content>
              <Content component={ContentVariants.p}>
                Upon submission, this form will be processed by Red Hat. If further information is
                required you will receive a follow up email, or you will receive instructions on how
                to access the service. By checking the boxes below you confirm that:
              </Content>
            </Content>
          </StackItem>
          <StackItem>
            <Checkbox
              label="Requestor is U.S. Person as defined by the International Traffic in Arms Regulations, 22 CFR 120.62."
              isChecked={isUSPerson}
              onChange={(_event, value) => setIsUSPerson(value)}
              id="citizen-checkbox"
            />
            <Checkbox
              label="Requestor will use the service to support a U.S. government contract and/or grant."
              isChecked={govContract}
              onChange={(_event, value) => setGovContract(value)}
              id="check-checkbox"
            />
            <Checkbox
              label="Requestor will only authorize U.S. Persons to manage and access root account keys to the service."
              isChecked={authPerson}
              onChange={(_event, value) => setAuthPerson(value)}
              id="training-checkbox"
            />
            <Checkbox
              label={
                <div>
                  Requestor will abide by the{' '}
                  <Button variant="link" isInline>
                    <a
                      href={`${config.configData.fedrampS3}/fedramp-rules-of-behavior.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      FedRAMP Rules of Behavior.
                    </a>
                  </Button>
                </div>
              }
              isChecked={rulesOfBehavior}
              onChange={(_event, value) => setRulesOfBehavior(value)}
              id="rulesOfBehavior-checkbox"
            />
          </StackItem>
          {!hasGovEmail && (
            <StackItem>
              <FormGroup
                label={
                  <>
                    Contract ID, Award ID or RFP Number from the{' '}
                    <a
                      href="https://www.usaspending.gov/search"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      U.S. Spending government
                    </a>{' '}
                    website . If the contract is not numbered, specify ‘N/A’.
                  </>
                }
              >
                <TextInput
                  value={contractID}
                  onChange={(_, value) => setContractID(value)}
                  isRequired
                />
              </FormGroup>
            </StackItem>
          )}
        </Stack>
      </CardBody>
      <CardFooter>
        <Stack hasGutter>
          {!!submitError && (
            <StackItem>
              <Alert isInline variant="danger" title="An error occured.">
                {submitError}
              </Alert>
            </StackItem>
          )}
          <StackItem>
            <Bullseye>
              <Button
                variant="primary"
                isDisabled={!formReady || isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await fedrampService.createIncident(
                      {
                        isUSPerson,
                        authPerson,
                        govContract,
                        rulesOfBehavior,
                      },
                      contractID,
                    );
                    onSubmitSuccess();
                  } catch (err) {
                    const axiosErr = err as any as AxiosError;
                    setSubmitError(`${axiosErr.code}: ${axiosErr.message}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Submitting' : 'Submit'}
              </Button>
            </Bullseye>
          </StackItem>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default GovCloudForm;
