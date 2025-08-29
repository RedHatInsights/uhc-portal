import React from 'react';
import dayjs from 'dayjs';

import {
  Alert,
  Button,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Radio,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { createServiceLogQueryObject } from '~/common/queryHelpers';
import { serviceLogService } from '~/services';
import { Cluster } from '~/types/clusters_mgmt.v1';
import { ViewOptions } from '~/types/types';

type ClusterLogsDownloadProps = {
  externalClusterID: Cluster['external_id'];
  clusterID: Cluster['id'];
  viewOptions: ViewOptions;
  logs: number;
  region?: string | undefined;
};

const ClusterLogsDownload = ({
  externalClusterID,
  clusterID,
  viewOptions,
  logs,
  region,
}: ClusterLogsDownloadProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [format, setFormat] = React.useState<'json' | 'csv'>('json');
  const [error, setError] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const close = () => {
    setIsOpen(false);
    setError(false);
  };

  const handleDownload = async () => {
    const query = createServiceLogQueryObject(
      {
        ...viewOptions,
        currentPage: 1,
        pageSize: -1,
      },
      format,
    );

    try {
      setIsDownloading(true);
      setError(false);
      let data;

      if (region) {
        const { data: regionalLogsData } = await serviceLogService.getClusterHistoryForRegion(
          externalClusterID,
          clusterID,
          query,
          region,
        );
        data = regionalLogsData;
      } else {
        const { data: logsData } = await serviceLogService.getClusterHistory(
          externalClusterID,
          clusterID,
          query,
        );
        data = logsData;
      }

      const timestamp = dayjs().format('YYYY-MM-DD HHmm');

      let formatted: any = data;
      if (format === 'json') {
        formatted = JSON.stringify(data);
      }
      const blob = new Blob([formatted], { type: 'octet/stream' });

      const link = document.createElement('a');
      link.setAttribute('href', window.URL.createObjectURL(blob));
      link.setAttribute('download', `${externalClusterID || clusterID}.${timestamp}.${format}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      close();
    } catch (err) {
      setError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        isDisabled={!logs}
        variant="primary"
        onClick={() => setIsOpen(true)}
        data-testid="download-btn"
      >
        Download history
      </Button>
      {isOpen && (
        <Modal
          id="download-cluster-history-modal"
          variant={ModalVariant.small}
          isOpen
          onClose={isDownloading ? undefined : close}
          aria-labelledby="download-cluster-history-modal"
          aria-describedby="modal-box-download-cluster-history"
        >
          <ModalHeader title="Download cluster history" labelId="download-cluster-history-modal" />
          <ModalBody>
            <Stack hasGutter>
              <StackItem>
                <FormGroup label="Choose a file type">
                  <Radio
                    id="json-format"
                    isChecked={format === 'json'}
                    name="format"
                    onChange={(_event, checked) => checked && setFormat('json')}
                    label="JSON"
                    isDisabled={isDownloading}
                  />
                  <Radio
                    id="csv-format"
                    isChecked={format === 'csv'}
                    name="format"
                    onChange={(_event, checked) => checked && setFormat('csv')}
                    label="CSV"
                    isDisabled={isDownloading}
                  />
                </FormGroup>
              </StackItem>
              {error && (
                <StackItem>
                  <Alert variant="danger" title="Unable to download records" isInline />
                </StackItem>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              data-testid="submit-btn"
              key="download"
              variant="primary"
              onClick={handleDownload}
              isDisabled={isDownloading}
              isLoading={isDownloading}
              spinnerAriaLabel="Loading cluster logs"
            >
              Download
            </Button>
            <Button key="close" variant="link" onClick={close} isDisabled={isDownloading}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default ClusterLogsDownload;
