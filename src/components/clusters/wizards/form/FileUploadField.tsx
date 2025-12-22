import React from 'react';
import { Field, FieldConfig, FieldProps, FieldValidator } from 'formik';

import {
  DropEvent,
  FileUpload,
  FileUploadProps,
  FormGroup,
  FormGroupProps,
} from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';

interface FileUploadFieldProps {
  name: string;
  label?: string;
  validate?: FieldValidator;
  isDisabled?: boolean;
  isPassword?: boolean;
  helperText?: React.ReactNode;
  tooltip?: React.ReactNode;
  field?: FieldConfig;
  formGroup?: FormGroupProps;
  input?: Partial<FileUploadProps>;
}

const isHtmlInputElement = (element: EventTarget): element is HTMLInputElement =>
  (element as HTMLInputElement).files !== undefined;

export const FileUploadField = ({
  name,
  label,
  validate,
  isDisabled,
  helperText,
  tooltip,
  field,
  formGroup,
  input,
}: FileUploadFieldProps) => {
  const { setFieldValue } = useFormState();
  const [filename, setFilename] = React.useState('');

  const onDataChange = (_event: DropEvent, data: string) => setFieldValue(name, data);

  const onTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>, text: string) => {
    if (isHtmlInputElement(event.target) && event.target.files) {
      const [file] = event.target.files;
      const reader = new FileReader();

      reader.onload = () => {
        setFilename(file.name);
        setFieldValue(name, reader.result);
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      setFieldValue(name, text);
    }
  };

  const onClearClick = () => {
    setFilename('');
    setFieldValue(name, '');
  };

  return (
    <Field name={name} validate={validate} {...field}>
      {({ field, meta }: FieldProps) => {
        const isTouchedWithError = meta.touched && meta.error;

        return (
          <FormGroup
            fieldId={field.name}
            label={label}
            {...(tooltip && { labelHelp: <PopoverHint hint={tooltip} /> })}
            {...(validate && { isRequired: true })}
            {...formGroup}
          >
            <FileUpload
              allowEditingUploadedText
              isDisabled={isDisabled}
              id={field.name}
              name={field.name}
              type="text"
              value={field.value}
              filename={filename}
              onDataChange={onDataChange}
              onTextChange={onTextChange}
              onClearClick={onClearClick}
              onTextAreaBlur={(event) => field.onBlur(event)}
              onFileInputChange={(_, file) => setFilename(file.name)}
              validated={isTouchedWithError ? 'error' : 'default'}
              {...input}
            />

            <FormGroupHelperText touched={meta.touched} error={meta.error}>
              {helperText}
            </FormGroupHelperText>
          </FormGroup>
        );
      }}
    </Field>
  );
};
