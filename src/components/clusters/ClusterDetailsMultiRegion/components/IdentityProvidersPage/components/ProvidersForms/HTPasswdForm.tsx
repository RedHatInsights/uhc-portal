import React from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { CompoundFieldArray } from '~/components/common/FormikFormComponents/FormikFieldArray/CompoundFieldArray';

import {
  validateHTPasswdPassword,
  validateHTPasswdUsername,
  validateUniqueHTPasswdUsername,
} from '../../../../../../../common/validators';
import { FieldId } from '../../constants';

import './HTPasswdForm.scss';

const generatePassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const symbols = '0123456789\\!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';
  const passwordLength = 14;
  const all = `${lower}${upper}${symbols}`;

  const getRandomIndex = (charset: string | number[]) => {
    // A large range 2**32 gives a practically uniform distribution after modulo operation.
    const result = new Uint32Array(1);
    crypto.getRandomValues(result);
    return result[0] % charset.length;
  };

  const getRandom = (charset: string | number[]) => {
    const index = getRandomIndex(charset);
    return { index, value: charset[index] as number };
  };

  // baseline password
  const suggestion = new Array(passwordLength).fill(null).map(() => getRandom(all).value);

  // make sure at least 1 upper, 1 lower, 1 symbol/digit
  const availableIndices = suggestion.map((_, i) => i);

  // get distinct random indices for each type
  const upperIndex = getRandom(availableIndices);
  suggestion[upperIndex.value] = getRandom(upper).value;
  availableIndices.splice(upperIndex.index, 1);

  const lowerIndex = getRandom(availableIndices);
  suggestion[lowerIndex.value] = getRandom(lower).value;
  availableIndices.splice(lowerIndex.index, 1);

  const symbolIndex = getRandom(availableIndices);
  suggestion[symbolIndex.value] = getRandom(symbols).value;
  availableIndices.splice(lowerIndex.index, 1);

  return suggestion.join('');
};

type ErrName =
  | 'emptyPassword'
  | 'baseRequirements'
  | 'uppercase'
  | 'lowercase'
  | 'numbersOrSymbols';

type PasswordError = {
  emptyPassword: boolean;
  baseRequirements: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbersOrSymbols: boolean;
};

const getHelpTextItemVariant = (errName: ErrName, passwordErrors: PasswordError) => {
  const emptyPassword = passwordErrors?.emptyPassword;

  if (emptyPassword) {
    return 'default';
  }
  if (passwordErrors === undefined) {
    return 'success';
  }
  return passwordErrors[errName] ? 'error' : 'success';
};

const getHelpTextItemIcon = (errName: ErrName, passwordErrors: PasswordError) => {
  const variant = getHelpTextItemVariant(errName, passwordErrors);
  switch (variant) {
    case 'success':
      return <CheckCircleIcon />;
    case 'error':
      return <ExclamationCircleIcon />;
    default:
      return <span>•</span>;
  }
};

const HelpTextPassword = ({ passwordErrors }: { passwordErrors: PasswordError }) => {
  const helpTextItemVariant = (errName: ErrName) => getHelpTextItemVariant(errName, passwordErrors);
  const helpTextItemIcon = (errName: ErrName) => getHelpTextItemIcon(errName, passwordErrors);

  return (
    <HelperText>
      <HelperTextItem
        variant={helpTextItemVariant('baseRequirements')}
        icon={helpTextItemIcon('baseRequirements')}
      >
        At least 14 characters (ASCII-standard) without whitespaces
      </HelperTextItem>
      <HelperTextItem
        variant={helpTextItemVariant('lowercase')}
        icon={helpTextItemIcon('lowercase')}
      >
        Include lowercase letters
      </HelperTextItem>
      <HelperTextItem
        variant={helpTextItemVariant('uppercase')}
        icon={helpTextItemIcon('uppercase')}
      >
        Include uppercase letters
      </HelperTextItem>
      <HelperTextItem
        variant={helpTextItemVariant('numbersOrSymbols')}
        icon={helpTextItemIcon('numbersOrSymbols')}
      >
        Include numbers or symbols (ASCII-standard characters only)
      </HelperTextItem>
    </HelperText>
  );
};

const HTPasswdForm = ({
  isPending,
  onlySingleItem,
  isEdit,
  user,
}: {
  isPending?: boolean;
  onlySingleItem?: boolean;
  isEdit?: boolean;
  user?: any;
}) => {
  const { getFieldMeta, setFieldValue } = useFormState();
  const getAutocompleteText = (value: string) => (
    <div>
      Use suggested password:
      <br />
      <b>{`${value}`}</b>
    </div>
  );

  const onAutocomplete = (value: string, pwdField: string) => {
    setFieldValue(pwdField, value);
    setFieldValue(`${pwdField}-confirm`, value);
  };

  const getHelpText = (index: number) => {
    const { error } = getFieldMeta(`users.${index}.password`);
    return <HelpTextPassword passwordErrors={error as unknown as PasswordError} />;
  };

  const { error } = getFieldMeta(FieldId.USERS);
  const addMoreButtonDisabled = error && error?.length !== 0;

  const isEditUser = isEdit && !!user;

  const userName = {
    name: 'username',
    label: 'Username',
    type: 'text',
    helpText: isEditUser ? '' : 'Unique name of the user within the cluster.',
    isRequired: true,
    getPlaceholderText: (index: number) => `Unique username ${index + 1}`,
    validate: validateHTPasswdUsername,
  };

  const compoundFields = [
    isEditUser ? { ...userName, value: user.username, disabled: true } : userName,
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      isRequired: true,
      getHelpText,
      onAutocomplete,
      getAutocompleteValue: generatePassword,
      getAutocompleteText,
      validate: validateHTPasswdPassword,
    },
    {
      name: 'password-confirm',
      label: 'Confirm password',
      type: 'password',
      isRequired: true,
      helpText: 'Retype the password to confirm.',
    },
  ];

  return (
    <CompoundFieldArray
      fieldSpan={11}
      compoundFields={compoundFields}
      label="Users list"
      addMoreTitle="Add user"
      isRequired
      disabled={isPending}
      validate={[validateUniqueHTPasswdUsername]}
      addMoreButtonDisabled={addMoreButtonDisabled}
      minusButtonDisabledMessage="To delete the static user, add another user first."
      onlySingleItem={onlySingleItem}
    />
  );
};

export default HTPasswdForm;
