import React from 'react';
import PropTypes from 'prop-types';

import { FileUpload, FormGroup } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';

import PopoverHint from '../PopoverHint';

const ReduxFileUpload = ({
  helpText = '',
  extendedHelpTitle,
  extendedHelpText,
  input,
  meta: { error, dirty, touched },
  isRequired = false,
  label,
  placeholder,
  dropzoneProps,
}) => {
  const [filename, setFilename] = React.useState(null);

  const onTextAreaBlur = (event) => {
    input.onBlur(event);
  };

  React.useEffect(() => {
    document.getElementById(input.name).addEventListener('blur', onTextAreaBlur);
    if (placeholder) {
      document.getElementById(input.name).setAttribute('placeholder', placeholder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (_e, file) => {
    setFilename(file.name);
    input.onChange(file);
  };

  const handleFileContentChange = (_e, value) => {
    input.onChange(value);
  };

  const handleFileRejected = (rejectedFiles, event) => {
    // makes the input touched so that the validation error message is displayed
    input.onBlur();
    if (dropzoneProps && dropzoneProps.onDropRejected) {
      dropzoneProps.onDropRejected(rejectedFiles, event);
    }
  };

  const handleClear = () => {
    input.onChange('');
    setFilename('');
  };

  return (
    <FormGroup
      fieldId={input.name}
      label={label}
      labelHelp={
        extendedHelpText && <PopoverHint title={extendedHelpTitle} hint={extendedHelpText} />
      }
      isRequired={isRequired}
    >
      <FileUpload
        allowEditingUploadedText
        isDragActive
        id={input.name}
        name={input.name}
        type="text"
        value={input.value}
        filename={filename}
        validated={(dirty || touched) && error ? 'error' : 'default'}
        onFileInputChange={handleFileChange}
        onDataChange={handleFileContentChange}
        onTextChange={handleFileContentChange}
        onClearClick={handleClear}
        dropzoneProps={{
          ...dropzoneProps,
          onDropRejected: handleFileRejected,
        }}
      />

      <FormGroupHelperText touched={dirty || touched} error={error}>
        {helpText}
      </FormGroupHelperText>
    </FormGroup>
  );
};

ReduxFileUpload.propTypes = {
  name: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  extendedHelpTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  extendedHelpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  isRequired: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  dropzoneProps: PropTypes.object,
};

export default ReduxFileUpload;
