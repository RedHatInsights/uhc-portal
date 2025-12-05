import React from 'react';

import {
  Alert,
  AlertVariant,
  ButtonVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { AppPage } from '~/components/App/AppPage';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import ExternalLink from '~/components/common/ExternalLink';
import Instruction from '~/components/common/Instruction';
import Instructions from '~/components/common/Instructions';
import PageTitle from '~/components/common/PageTitle';

import StepCreateNetwork from './StepCreateAWSAccountRoles/StepCreateNetwork';
import StepCreateAWSAccountRoles from './StepCreateAWSAccountRoles';
import StepDownloadROSACli from './StepDownloadROSACli';
import WithCLICard from './WithCLICard';
import WithTerraformCard from './WithTerraformCard';
import WithWizardCard from './WithWizardCard';

import '../createROSAWizard.scss';

export const productName = 'Red Hat OpenShift Service on AWS';
const title = (productName: string = '') => `Set up ${productName} (ROSA)`;

const breadcrumbs = (
  <Breadcrumbs
    path={[
      { label: 'Cluster List' },
      { label: 'Cluster Type', path: '/create' },
      { label: 'Set up ROSA' },
    ]}
  />
);

const CreateRosaGetStarted = () => (
  <AppPage>
    <PageTitle breadcrumbs={breadcrumbs} title={title(productName)}>
      <Content>
        <Content component={ContentVariants.p}>
          Deploy fully operational and managed Red Hat OpenShift clusters while leveraging the full
          breadth and depth of AWS using ROSA.
        </Content>
        <Content component={ContentVariants.p}>
          Learn more about <ExternalLink href={links.WHAT_IS_ROSA}>ROSA</ExternalLink> or{' '}
          <ExternalLink href={links.ROSA_COMMUNITY_SLACK}>Slack us</ExternalLink>
        </Content>
      </Content>
      <Alert
        variant={AlertVariant.info}
        isInline
        id="env-override-message"
        component="h2"
        title={
          <>
            Red Hat OpenShift Service on AWS (ROSA) with hosted control planes in AWS GovCloud
            achieves FedRAMP High Authorization
          </>
        }
      >
        <ExternalLink data-testid="rosa-aws-fedramp" href={links.ROSA_AWS_FEDRAMP}>
          Learn more about ROSA with hosted control planes in AWS GovCloud
        </ExternalLink>
        or start the onboarding process with the{' '}
        <ExternalLink
          data-testid="fedramp-access-request-form"
          href={links.FEDRAMP_ACCESS_REQUEST_FORM}
        >
          FedRAMP access request form
        </ExternalLink>
      </Alert>
    </PageTitle>
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        {/* ************ Start of AWS prerequisites section ***************** */}
        <StackItem>
          <Card>
            <CardTitle>
              <Title headingLevel="h2">Complete AWS prerequisites</Title>
            </CardTitle>
            <CardBody>
              <Title headingLevel="h3">Have you prepared your AWS account?</Title>
              <Content component={ContentVariants.p}>
                Make sure your AWS account is set up for ROSA deployment. If you&apos;ve already set
                it up, you can continue to the ROSA prerequisites.
              </Content>

              <Grid hasGutter span={10}>
                <GridItem span={4}>
                  <Content component="ul">
                    <Content component="li">Enable AWS</Content>
                    <Content component="li">Configure Elastic Load Balancer (ELB)</Content>
                  </Content>
                </GridItem>

                <GridItem span={6}>
                  <Content component="ul">
                    <Content component="li">
                      Set up a VPC for ROSA hosted control plane architecture (HCP) clusters
                      (optional for ROSA classic architecture clusters)
                    </Content>
                    <Content component="li">Verify your quotas on AWS console</Content>
                  </Content>
                </GridItem>
              </Grid>

              <ExternalLink
                className="pf-v6-u-mt-md"
                href={links.AWS_CONSOLE_ROSA_HOME_GET_STARTED}
                isButton
                variant={ButtonVariant.secondary}
              >
                Open AWS Console
              </ExternalLink>
            </CardBody>
          </Card>
        </StackItem>
        <StackItem>
          <Card>
            <CardBody>
              <Split className="pf-v6-u-mb-lg">
                <SplitItem isFilled>
                  <Title headingLevel="h2">Complete ROSA prerequisites</Title>
                </SplitItem>
                <SplitItem>
                  <ExternalLink href={links.AWS_ROSA_GET_STARTED}>
                    More information on ROSA setup
                  </ExternalLink>
                </SplitItem>
              </Split>

              {/* ************* START OF PREREQ STEPS ******************* */}
              <Instructions wide>
                <Instruction simple>
                  <StepDownloadROSACli />
                </Instruction>

                <Instruction simple>
                  <StepCreateAWSAccountRoles />
                </Instruction>

                <Instruction simple>
                  <StepCreateNetwork />
                </Instruction>
              </Instructions>
            </CardBody>
          </Card>
        </StackItem>
        {/* ************ Start of Deploy the cluster and setup access cards ***************** */}
        <StackItem>
          <Card>
            <CardHeader className="rosa-get-started">
              <CardTitle>
                <Title headingLevel="h2" size="xl">
                  Deploy the cluster and set up access
                </Title>
                <Content component={ContentVariants.p} className="pf-v6-u-font-weight-normal">
                  Select a deployment method
                </Content>
              </CardTitle>
            </CardHeader>

            <CardBody>
              <Grid hasGutter>
                <GridItem span={4}>
                  <WithCLICard />
                </GridItem>
                <GridItem span={4}>
                  <WithWizardCard />
                </GridItem>
                <GridItem span={4}>
                  <WithTerraformCard />
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </StackItem>
      </Stack>
    </PageSection>
  </AppPage>
);

export default CreateRosaGetStarted;
