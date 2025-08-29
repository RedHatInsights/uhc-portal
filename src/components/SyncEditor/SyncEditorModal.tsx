import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SchemasSettings } from 'monaco-yaml';

import { Language } from '@patternfly/react-code-editor';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Panel,
  PanelMain,
  PanelMainBody,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Tab,
  Tabs,
  TabTitleText,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons/dist/esm/icons/download-icon';

import { ConfirmationDialog } from '~/common/modals/ConfirmationDialog';

import { SyncEditor } from './SyncEditor';
import { SyncEditorSchema } from './SyncEditorSchema';
import { SyncEditorToolbar } from './SyncEditorToolbar';

import './SyncEditorModal.scss';

type SyncEditorModalProps = {
  isOpen: boolean;
  closeCallback: () => void;
  content: string;
  schema: SchemasSettings;
  submitButtonLabel: string;
  downloadFileName: string;
  onSubmit: (values: object | string) => void;
  translatorToObject?: (content: string) => object;
  isRequestPending?: boolean;
  isRequestFulfilled?: boolean;
  requestErrorMessage?: string;
  requestPendingMessage?: string;
  closeWarningMessage?: string;
  readOnlyMessage?: string;
};

const SyncEditorModal = ({
  isOpen,
  closeCallback,
  content,
  schema,
  submitButtonLabel,
  downloadFileName,
  onSubmit,
  translatorToObject,
  isRequestPending,
  isRequestFulfilled,
  requestErrorMessage,
  requestPendingMessage,
  closeWarningMessage,
  readOnlyMessage = 'Cannot edit on read-only.',
}: SyncEditorModalProps) => {
  const [isContentValid, setIsContentValid] = useState(true);
  const [editorContent, setEditorContent] = useState(content);
  const [isSideBarVisible, setIsSideBarVisible] = useState(true);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const contentHasChanged = useMemo(() => content !== editorContent, [editorContent, content]);

  const download = useCallback(() => {
    if (editorContent) {
      const element = document.createElement('a');
      const file = new Blob([editorContent], { type: 'text' });
      element.href = URL.createObjectURL(file);
      element.download = downloadFileName;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }
  }, [downloadFileName, editorContent]);

  const handleClose = useCallback(() => {
    if (!contentHasChanged) {
      closeCallback();
    } else {
      setIsConfirmationDialogOpen(true);
    }
  }, [closeCallback, contentHasChanged]);

  const handleSubmit = useCallback(() => {
    if (editorContent) {
      onSubmit(translatorToObject ? translatorToObject(editorContent) : editorContent);
    }
  }, [editorContent, onSubmit, translatorToObject]);

  const onEscapePress = useCallback(
    (_event: KeyboardEvent) => {
      if (!isRequestPending) {
        handleClose();
      }
    },
    [handleClose, isRequestPending],
  );

  useEffect(() => {
    if (isRequestFulfilled) {
      closeCallback();
    }
  }, [closeCallback, isRequestFulfilled]);

  const toggleSideBar = useCallback(
    () => setIsSideBarVisible(!isSideBarVisible),
    [isSideBarVisible],
  );

  return (
    <Modal
      isOpen={isOpen}
      variant={ModalVariant.large}
      onClose={handleClose}
      onEscapePress={onEscapePress}
      aria-labelledby="sync-editor-modal"
      aria-describedby="modal-sync-yaml-editor"
    >
      <ModalHeader title="Edit YAML" />
      <ModalBody>
        <>
          <Sidebar hasBorder isPanelRight>
            <SidebarContent>
              <SyncEditorToolbar
                {...{
                  isRequestPending,
                  requestPendingMessage,
                  requestErrorMessage,
                  isContentValid,
                }}
                isSideBarVisible={isSideBarVisible}
                toggleSideBar={toggleSideBar}
              />
            </SidebarContent>

            {isSideBarVisible ? (
              <SidebarPanel width={{ default: 'width_25' }} variant="sticky">
                <Title headingLevel="h2" className="pf-v6-u-pl-sm">
                  ROSA cluster creation
                </Title>
              </SidebarPanel>
            ) : null}
          </Sidebar>
          <Sidebar style={{ overflow: 'auto' }} tabIndex={0} hasBorder isPanelRight>
            <SidebarContent style={{ height: '600px' }}>
              <SyncEditor
                content={editorContent}
                onChange={setEditorContent}
                isReadOnly={isRequestPending}
                readOnlyMessage={{ value: readOnlyMessage }}
                schemas={[schema]}
                isSideBarVisible={isSideBarVisible}
                isDarkTheme
                language={Language.yaml}
                setValidationErrors={(validationErrors) =>
                  setIsContentValid(validationErrors.length === 0)
                }
              />
            </SidebarContent>
            {isSideBarVisible ? (
              <SidebarPanel width={{ default: 'width_25' }} variant="sticky">
                <Tabs activeKey={0}>
                  <Tab eventKey={0} title={<TabTitleText>Schema</TabTitleText>}>
                    <Panel>
                      <PanelMain>
                        <PanelMainBody>
                          <SyncEditorSchema schema={JSON.stringify(schema)} />
                        </PanelMainBody>
                      </PanelMain>
                    </Panel>
                  </Tab>
                </Tabs>
              </SidebarPanel>
            ) : null}
          </Sidebar>
          <ConfirmationDialog
            title="Close editor without saving?"
            content="All changes will be lost."
            primaryActionLabel="Close"
            primaryAction={closeCallback}
            secondaryActionLabel="Cancel"
            isOpen={isConfirmationDialogOpen}
            closeCallback={() => setIsConfirmationDialogOpen(false)}
          />
        </>
      </ModalBody>
      <ModalFooter>
        <Flex>
          <FlexItem>
            <Tooltip
              trigger={isContentValid ? 'manual' : 'mouseenter'}
              content="There are validation errors. Please fix them before submitting the cluster
                  creation request"
            >
              <Button
                isAriaDisabled={isRequestPending || !isContentValid}
                onClick={handleSubmit}
                className="pf-v6-u-mr-md"
                data-testid="submit-btn"
                isLoading={isRequestPending}
              >
                {submitButtonLabel}
              </Button>
            </Tooltip>
            {!isRequestPending && (
              <Button variant="secondary" onClick={handleClose} isDisabled={isRequestPending}>
                Cancel
              </Button>
            )}
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            {closeWarningMessage ? (
              <Alert variant="warning" isInline isPlain title={closeWarningMessage} />
            ) : null}
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            <Button
              variant="primary"
              isDisabled={!editorContent}
              icon={<DownloadIcon />}
              onClick={download}
            >
              Download
            </Button>
          </FlexItem>
        </Flex>
      </ModalFooter>
    </Modal>
  );
};

export { SyncEditorModal, SyncEditorModalProps };
