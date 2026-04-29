import React from 'react';

import {
  DropEvent,
  FileUpload,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';

import { FieldId } from '../../constants';

import { parseHTPasswdFile } from './htpasswdFileParser';

const HTPasswdFileUpload = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { setFieldValue } = useFormState();
  const [filename, setFilename] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);

  const processContent = (content: string) => {
    const result = parseHTPasswdFile(content);
    setErrors(result.errors);

    if (result.errors.length === 0 && result.users.length > 0) {
      const formUsers = result.users.map((user) => ({
        username: user.username,
        password: user.password,
      }));
      setFieldValue(FieldId.USERS, formUsers);
    } else {
      setFieldValue(FieldId.USERS, []);
    }
  };

  const onFileInputChange = (_event: DropEvent, file: File) => {
    setFilename(file.name);
  };

  const onDataChange = (_event: DropEvent, content: string) => {
    processContent(content);
  };

  const onClearClick = () => {
    setFilename('');
    setErrors([]);
    setFieldValue(FieldId.USERS, []);
  };

  return (
    <FormGroup label="htpasswd file" fieldId="htpasswd-file-upload">
      <FileUpload
        id="htpasswd-file-upload"
        type="text"
        filename={filename}
        onDataChange={onDataChange}
        onFileInputChange={onFileInputChange}
        onClearClick={onClearClick}
        isDisabled={isDisabled}
        hideDefaultPreview
        browseButtonText="Browse"
        validated={errors.length > 0 ? 'error' : 'default'}
        filenamePlaceholder="Upload an htpasswd file or drag and drop"
        dropzoneProps={{
          accept: { 'text/plain': ['.htpasswd'] },
          onDropRejected: () => {
            setErrors(['File type is not supported. Upload an htpasswd or plain text file.']);
          },
        }}
      />

      {errors.length > 0 && (
        <FormHelperText>
          <HelperText>
            {errors.map((error) => (
              <HelperTextItem key={error} variant="error">
                {error}
              </HelperTextItem>
            ))}
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default HTPasswdFileUpload;
