import { FieldInputProps, FieldMetaProps } from 'formik';

type LabelKeyValueProps = {
  index: number;
  input: FieldInputProps<string | number | undefined>;
  meta: FieldMetaProps<string | number | undefined>;
  keyInputAriaLabel?: string;
  valueAriaLabel?: string;
};

export default LabelKeyValueProps;
