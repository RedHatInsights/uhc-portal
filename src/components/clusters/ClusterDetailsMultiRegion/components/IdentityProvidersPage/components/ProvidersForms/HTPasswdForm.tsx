import React from 'react';

import {
  Content,
  ContentVariants,
  Flex,
  HelperText,
  HelperTextItem,
  Radio,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import docLinks from '~/common/docLinks.mjs';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CompoundFieldArray } from '~/components/common/FormikFormComponents/FormikFieldArray/CompoundFieldArray';
import { HTPASSWD_IMPORT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import {
  validateHTPasswdPassword,
  validateHTPasswdUsername,
  validateUniqueHTPasswdUsername,
} from '../../../../../../../common/validators';
import { CREATION_MODE_MANUAL, CREATION_MODE_UPLOAD, CreationMode, FieldId } from '../../constants';

import HTPasswdFileUpload from './HTPasswdFileUpload';

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
  const { getFieldMeta, setFieldValue, values } = useFormState();
  const isImportEnabled = useFeatureGate(HTPASSWD_IMPORT);
  const creationMode: CreationMode = isImportEnabled
    ? values[FieldId.CREATION_MODE]
    : CREATION_MODE_MANUAL;

  const handleModeChange = (mode: CreationMode) => {
    setFieldValue(FieldId.CREATION_MODE, mode);
    setFieldValue(
      FieldId.USERS,
      mode === CREATION_MODE_UPLOAD ? [] : [{ username: '', password: '', 'password-confirm': '' }],
    );
  };

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

  const showModeSelection = isImportEnabled && !isEditUser && !onlySingleItem;

  return (
    <>
      {showModeSelection && (
        <>
          <Title headingLevel="h4" size="md" id="htpasswd-creation-mode-label">
            Create users
          </Title>
          <Flex role="radiogroup" aria-labelledby="htpasswd-creation-mode-label">
            <Radio
              isChecked={creationMode === CREATION_MODE_MANUAL}
              name="htpasswd-creation-mode"
              onChange={() => handleModeChange(CREATION_MODE_MANUAL)}
              label="Add users manually"
              id="htpasswd-mode-manual"
            />
            <Radio
              isChecked={creationMode === CREATION_MODE_UPLOAD}
              name="htpasswd-creation-mode"
              onChange={() => handleModeChange(CREATION_MODE_UPLOAD)}
              label="Upload an htpasswd file"
              id="htpasswd-mode-upload"
            />
          </Flex>
          {creationMode === CREATION_MODE_MANUAL ? (
            <Content component={ContentVariants.p} className="pf-v6-u-mb-0">
              To create the htpasswd identity provider, you must create at least 1 user. You can add
              additional users later.
              <br />
              Add a username and password for each user.
            </Content>
          ) : (
            <Content component={ContentVariants.p} className="pf-v6-u-mb-0">
              Upload a valid htpasswd file to import users into this identity provider. Generally,
              this file is prepared using the{' '}
              <a href={docLinks.IDP_HTPASSWD_UTILITY} target="_blank" rel="noreferrer">
                htpasswd
              </a>{' '}
              tool. Each line must contain a username and a hashed password. If any user fails to be
              created for any reason, the entire import is cancelled — no users will be added. You
              can add additional users later.
            </Content>
          )}
        </>
      )}
      {creationMode === CREATION_MODE_MANUAL || isEditUser || onlySingleItem ? (
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
      ) : (
        <HTPasswdFileUpload isDisabled={isPending} />
      )}
    </>
  );
};

export default HTPasswdForm;
