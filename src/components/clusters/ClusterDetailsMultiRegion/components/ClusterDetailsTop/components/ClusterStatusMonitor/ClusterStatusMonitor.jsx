// Component has to be from lowercase otherwise throws
// can't access lexical declaration '__WEBPACK_DEFAULT_EXPORT__' before initialization
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import PropTypes from 'prop-types';

import { Alert, Button, ButtonVariant, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import MinusCircleIcon from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import installLinks from '~/common/installLinks.mjs';
import { HAD_INFLIGHT_ERROR_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';
import { emailRegex } from '~/common/regularExpressions';
import supportLinks from '~/common/supportLinks.mjs';
import clusterStates, {
  hasInflightEgressErrors,
  isOSDGCPWaitingForRolesOnHostProject,
} from '~/components/clusters/common/clusterStates';
import ClusterStatusErrorDisplay from '~/components/clusters/common/ClusterStatusErrorDisplay';
import ErrorModal from '~/components/common/ErrorModal';
import ExternalLink from '~/components/common/ExternalLink';
import {
  useFetchClusterStatus,
  useInvalidateFetchClusterStatus,
} from '~/queries/ClusterDetailsQueries/ClusterStatusMonitor/useFetchClusterStatus';
import {
  useFetchInflightChecks,
  useFetchRerunInflightChecks,
  useInvalidateFetchInflightChecks,
  useInvalidateFetchRerunInflightChecks,
  useMutateRerunInflightChecks,
} from '~/queries/ClusterDetailsQueries/useFetchInflightChecks';
import { InflightCheckState } from '~/types/clusters_mgmt.v1/enums';

// TODO: Part of the installation story
const ClusterStatusMonitor = (props) => {
  const { cluster, refresh, region, setHasStatusMonitorAlert } = props;

  const [refetchInterval, setRefetchInterval] = React.useState(false);

  const {
    data: clusterStatus,
    isLoading: isClusterStatusLoading,
    isError: isClusterStatusError,
  } = useFetchClusterStatus(cluster.id, region, refetchInterval);

  const isClusterStatusMonitor = true;
  const { data: inflightChecks, isLoading: isInflightChecksLoading } = useFetchInflightChecks(
    cluster.id,
    cluster.subscription,
    region,
    refetchInterval,
    isClusterStatusMonitor,
  );

  const { data: rerunInflightChecksData, isLoading: isRerunInflightChecksLoading } =
    useFetchRerunInflightChecks(cluster?.aws?.subnet_ids, region, refetchInterval);

  const {
    data: rerunInflightChecksMutationData,
    isPending: isRerunInflightChecksMutationPending,
    isError: isRerunInflightChecksMutationError,
    error: rerunInflightChecksMutationError,
    mutateAsync,
    reset,
  } = useMutateRerunInflightChecks(cluster.id, region);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isErrorOpen, setIsErrorOpen] = React.useState(false);
  const [wasRunClicked, setWasRunClicked] = React.useState(false);
  const [isValidatorRunning, setIsValidatorRunning] = React.useState(false);

  const toggleExpanded = (isExpanded) => {
    setIsExpanded(isExpanded);
  };

  React.useEffect(() => {
    useInvalidateFetchClusterStatus();
    useInvalidateFetchInflightChecks();

    if (cluster?.aws?.subnet_ids) {
      useInvalidateFetchRerunInflightChecks();
    }
    return () => {
      setRefetchInterval(false);
    };
    // Should run once on mount and once on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isClusterStatusLoading && !isInflightChecksLoading && clusterStatus && inflightChecks) {
      // final state is READY
      const isClusterInstalling = (state) =>
        [
          clusterStates.installing,
          clusterStates.pending,
          clusterStates.validating,
          clusterStates.waiting,
        ].includes(state);
      setRefetchInterval(false);
      // if not running any checks final state is success
      const shouldUpdateInflightChecks = () =>
        inflightChecks?.data?.items?.some(
          (check) =>
            check.state === InflightCheckState.running || check.state === InflightCheckState.failed,
        );

      if (!isClusterStatusLoading && !isInflightChecksLoading) {
        const clusterState = clusterStatus.state;
        // refresh main detail page if cluster state changed or if still running inflight checks
        if (clusterStatus.state !== cluster.state || shouldUpdateInflightChecks()) {
          // (also updates the ProgressList)
          refresh(); // state transition -> refresh main view
        }
        // if still installing/uninstalling or running inflight checks, check again in 5s
        if (
          isClusterInstalling(clusterState) ||
          clusterState === clusterStates.uninstalling ||
          shouldUpdateInflightChecks()
        ) {
          setRefetchInterval(true);
        }
      } else if (isClusterStatusError) {
        if (isClusterInstalling(cluster.state)) {
          // if we failed to get the /status endpoint (and we weren't uninstalling)
          // all we can do is look at the state in cluster object and hope for the best
          setRefetchInterval(true);
        }
      }
    }
    // Minified React error #185 if added all dependencies based on linter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchInterval, clusterStatus]);

  React.useEffect(() => {
    if (!isRerunInflightChecksMutationPending) {
      // rerun button was clicked but error occurred trying  to start the validator
      if (isRerunInflightChecksMutationError) {
        setIsErrorOpen(true);
        setWasRunClicked(true);
      }
      // we use wasRunClicked state to make sure the spinner next to the rerun button keeps spinning
      // until the validator starts running and we can use that to see if the validator is still
      // running. once clicked, it might take a bit for the validator starts up-- so rather then
      // have the spinner disappear we give it 10 seconds to start up
      if (rerunInflightChecksMutationData) {
        setTimeout(() => {
          setWasRunClicked(false);
        }, 10000);
      }
    }

    // user might navigate away from this page so the button click state might be lost
    // so we use this to determine if the validator is running irregardless of when/where the button was clicked
    if (!isRerunInflightChecksLoading && rerunInflightChecksData) {
      const isValidatorRunning = rerunInflightChecksData.data.items.some(
        (check) =>
          check.state === InflightCheckState.running || check.state === InflightCheckState.pending,
      );
      setIsValidatorRunning(isValidatorRunning);
    }
    // Update should not be in the dependency list
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [
    isRerunInflightChecksLoading,
    isRerunInflightChecksMutationPending,
    rerunInflightChecksMutationData,
    rerunInflightChecksData,
  ]);

  const showMissingURLList = () => {
    const isClusterValidating =
      cluster.state === clusterStates.validating || cluster.state === clusterStates.pending;
    if (!isClusterValidating) {
      const inflightError = inflightChecks?.data?.items?.find(
        (check) => check.state === InflightCheckState.failed,
      );
      if (hasInflightEgressErrors(cluster) && inflightError) {
        let documentLink;
        let subnets = [];
        let inflightTable;
        let rerunValidator;
        const hadInflightErrorKey = `${HAD_INFLIGHT_ERROR_LOCALSTORAGE_KEY}_${cluster.id}`;
        localStorage.setItem(hadInflightErrorKey, !!inflightError);
        const reason =
          'To allow this cluster to be fully-managed, add these URLs to the allowlist of these subnet firewalls. For more information review the egress requirements or contact Red Hat support.';
        const { details } = inflightError;
        Object.keys(details).forEach((dkey) => {
          if (dkey === 'documentation_link') {
            documentLink = details[dkey];
          } else if (dkey.startsWith('subnet')) {
            const egressErrors = [];
            subnets.push({ name: dkey, egressErrors });
            Object.keys(details[dkey]).forEach((skey) => {
              // ex. skey = 'egress_url_errors-0'
              if (skey.startsWith('egress_url_errors')) {
                const urlPattern = /(https?:\/\/[^\s)]+)/;
                // ex. str = 'egressURL error: https://registry.redhat.io:443 (Proxy CONNECT aborted)'
                const str = details[dkey][skey];
                const result = str.match(urlPattern);
                // ex. result = [https://registry.redhat.io:443]
                if (result) {
                  egressErrors.push(result[0]);
                }
              }
            });
            egressErrors.sort((a, b) => {
              const aArr = a.split(':');
              const bArr = b.split(':');
              const ret = aArr[1]?.localeCompare(bArr[1]);
              return ret === 0 ? aArr[0]?.localeCompare(bArr[0]) : ret;
            });
          }
        });
        if (subnets.length) {
          const hasMore = subnets.length > 1;
          if (hasMore && !isExpanded) subnets = subnets.slice(0, 1);
          const columns = [{ title: 'Subnet' }, { title: 'URLs' }];
          const subnetRow = ({ name, egressErrors }) => (
            <Tbody key={name}>
              <Tr>
                <Td modifier="nowrap">{name}</Td>
                <Td style={{ whiteSpace: 'break-spaces' }}>{egressErrors.join(',   ')}</Td>
              </Tr>
            </Tbody>
          );
          inflightTable = (
            <>
              <Table
                aria-label="Missing allowlist URLs"
                variant={TableVariant.compact}
                style={{ backgroundColor: 'unset' }}
              >
                <Thead>
                  <Tr>
                    {columns.map((column) => (
                      <Th key={column.title}>{column.title}</Th>
                    ))}
                  </Tr>
                </Thead>
                {subnets.map((subnet) => subnetRow(subnet))}
              </Table>
              {hasMore && (
                <Button
                  variant="link"
                  icon={isExpanded ? <MinusCircleIcon /> : <PlusCircleIcon />}
                  onClick={() => toggleExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </>
          );
          rerunValidator = () => {
            setWasRunClicked(true);
            mutateAsync(cluster.id);
          };
        }
        // show spinner on rerun button
        const runningInflightCheck = wasRunClicked || isValidatorRunning;
        return (
          <Alert
            variant="warning"
            isInline
            title="User action required"
            className="pf-v6-u-mt-md"
            key="missing-urls-list"
          >
            <Flex direction={{ default: 'column' }}>
              <FlexItem>{`${reason}`}</FlexItem>
              {inflightTable && <FlexItem>{inflightTable}</FlexItem>}
              <FlexItem>
                <Flex direction={{ default: 'row' }}>
                  {documentLink && (
                    <FlexItem>
                      <ExternalLink noIcon href={documentLink}>
                        Review egress requirements
                      </ExternalLink>
                    </FlexItem>
                  )}
                  <FlexItem>
                    <ExternalLink noIcon href={supportLinks.SUPPORT_CASE_NEW}>
                      Contact support
                    </ExternalLink>
                  </FlexItem>
                  <FlexItem>
                    {runningInflightCheck && (
                      <span className="pf-v6-u-mr-sm">
                        <Spinner size="sm" aria-label="Loading..." />
                      </span>
                    )}
                    <Button
                      variant={ButtonVariant.link}
                      isInline
                      isDisabled={runningInflightCheck}
                      onClick={rerunValidator}
                    >
                      {isValidatorRunning
                        ? 'Network validation in progress'
                        : 'Rerun network validation'}
                    </Button>

                    {isErrorOpen && (
                      <ErrorModal
                        title="Error Rerunning Validator "
                        errorResponse={rerunInflightChecksMutationError?.error}
                        resetResponse={() => {
                          // An error happened when trying to request a network validation
                          setIsErrorOpen(false);
                          reset(); // clears out error from mutation so the modal isn't automatically re-opened
                          setWasRunClicked(false); // Checks were not run due to an error
                        }}
                      />
                    )}
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </Alert>
        );
      }
    }
    return null;
  };

  const showRequiredGCPRoles = () => {
    if (isOSDGCPWaitingForRolesOnHostProject(cluster)) {
      const hostProjectId = cluster?.gcp_network?.vpc_project_id;
      const serviceAccountsStrings = cluster?.status?.description?.match(emailRegex);
      const serviceAccountsLength = serviceAccountsStrings ? serviceAccountsStrings.length : 0;
      const serviceAccounts = serviceAccountsStrings ? (
        <>
          {serviceAccountsStrings.map((account, index) => (
            <React.Fragment key={account}>
              <strong>{account}</strong>
              {index < serviceAccountsStrings.length - 1 && ', '}
            </React.Fragment>
          ))}
        </>
      ) : (
        <strong>unknown</strong>
      );

      const reason = (
        <>
          To continue cluster installation, contact the VPC owner of the{' '}
          <strong>{hostProjectId}</strong> host project, who must grant the {serviceAccounts}{' '}
          service account{serviceAccountsLength > 1 ? 's' : ''} the following roles:{' '}
          <strong>
            Compute Network Administrator, Compute Security Administrator, DNS Administrator.
          </strong>
        </>
      );
      return (
        <Alert
          variant="warning"
          isInline
          title="Permissions needed:"
          className="pf-v6-u-mt-md"
          key="show-required-GCP-roles"
        >
          <Flex direction={{ default: 'column' }}>
            <FlexItem>{reason}</FlexItem>
            <FlexItem>
              <ExternalLink href={installLinks.GCP_VPC_PROVISIONING}>
                Learn more about permissions
              </ExternalLink>
            </FlexItem>
          </Flex>
        </Alert>
      );
    }
    return null;
  };

  if (!isClusterStatusLoading && clusterStatus) {
    if (clusterStatus.id === cluster.id) {
      const errorCode = clusterStatus.provision_error_code || '';
      const alerts = [];

      // Cluster install failure
      if (clusterStatus.state === clusterStates.error) {
        alerts.push(
          <Alert
            variant="danger"
            isInline
            title={`${errorCode} An error occured during cluster install or uninstall process.`}
            className="pf-v6-u-mt-md"
            key="cluster-install-failed"
          >
            <p>
              This cluster cannot be recovered, however you can use the logs and network validation
              to diagnose the problem:
            </p>
            <ClusterStatusErrorDisplay clusterStatus={clusterStatus} showDescription />
          </Alert>,
        );
      }

      // Rosa inflight error check found urls missing from byo vpc firewall
      alerts.push(showMissingURLList());

      // OSD GCP is waiting on roles to be added to dynamically generated service account for a shared vpc project
      alerts.push(showRequiredGCPRoles());

      // Cluster is taking a lot of time to create
      if (
        clusterStatus.state !== clusterStates.error &&
        (clusterStatus.provision_error_code || clusterStatus.provision_error_message)
      ) {
        alerts.push(
          <Alert
            variant="warning"
            isInline
            title={`${errorCode} Installation is taking longer than expected`}
            data-testid="alert-long-install"
            key="alert-long-install"
          >
            <ClusterStatusErrorDisplay clusterStatus={clusterStatus} />
          </Alert>,
        );
      }

      const filteredAlerts = alerts.filter((value) => value !== null);
      if (filteredAlerts.length > 0 && setHasStatusMonitorAlert) {
        setHasStatusMonitorAlert(true);
      }
      return <>{alerts.filter((n) => n)}</>;
    }
  }

  return null;
};

ClusterStatusMonitor.propTypes = {
  region: PropTypes.string,
  cluster: PropTypes.shape({
    id: PropTypes.string,
    subscription: PropTypes.object,
    state: PropTypes.string,
    status: PropTypes.shape({
      description: PropTypes.string,
    }),
    aws: PropTypes.shape({
      subnet_ids: PropTypes.array,
    }),
    gcp_network: PropTypes.shape({
      vpc_project_id: PropTypes.string,
    }),
  }),
  refresh: PropTypes.func,
  setHasStatusMonitorAlert: PropTypes.func,
};

export default ClusterStatusMonitor;
