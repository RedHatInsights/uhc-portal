import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import ReduxFileUpload from '../ReduxFileUpload';

const baseProps = {
  input: {
    name: 'wat',
    onBlur: jest.fn(),
    onChange: jest.fn(),
  },
  meta: {},
};
const helpText = 'help! i need somebody';
const extendedHelpTitle = 'help! help!';
const extendedHelpText = 'help! not just anybody';

describe('ReduxFileUpload', () => {
  it('is accessible', async () => {
    const { container } = render(<ReduxFileUpload {...baseProps} />);
    await checkAccessibility(container);
  });

  describe('rendering', () => {
    it('shows help text', () => {
      render(<ReduxFileUpload {...baseProps} helpText={helpText} />);
      expect(screen.getByText(helpText)).toBeVisible();
    });

    it('shows extended help text when label is provided', async () => {
      render(<ReduxFileUpload {...baseProps} label="foo" extendedHelpText={extendedHelpText} />);
      const popoverButton = screen.getByRole('button', { name: 'More information' });
      await userEvent.click(popoverButton);
      expect(screen.getByText(extendedHelpText)).toBeVisible();
    });

    it('shows extended help title when label and extended help text are provided', async () => {
      render(
        <ReduxFileUpload
          {...baseProps}
          label="foo"
          extendedHelpText={extendedHelpText}
          extendedHelpTitle={extendedHelpTitle}
        />,
      );
      const popoverButton = screen.getByRole('button', { name: 'More information' });
      await userEvent.click(popoverButton);
      expect(screen.getByText(extendedHelpTitle)).toBeVisible();
    });

    it('does not render popover icon when label is not provided', () => {
      render(<ReduxFileUpload {...baseProps} extendedHelpText={extendedHelpText} />);
      const popoverButton = screen.queryByRole('button', { name: 'More information' });
      expect(popoverButton).not.toBeInTheDocument();
    });

    it('renders & shows placeholder', () => {
      render(
        <ReduxFileUpload
          {...baseProps}
          placeholder={`-----BEGIN CERTIFICATE-----
<MY_TRUSTED_CA_CERT>
-----END CERTIFICATE-----`}
        />,
      );
      const placeholderTextBox = screen.getByPlaceholderText(/^-----BEGIN CERTIFICATE-----/);
      expect(placeholderTextBox).toBeInTheDocument();
      expect(placeholderTextBox).toBeVisible();
    });

    it('renders & shows "required" indication when label is provided', () => {
      render(<ReduxFileUpload {...baseProps} label="foo" isRequired />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toBeVisible();
    });
  });

  describe('user interaction', () => {
    let user;

    beforeEach(() => {
      user = userEvent.setup();
    });

    afterEach(() => {
      baseProps.input.onBlur.mockReset();
      baseProps.input.onChange.mockReset();
    });

    it('calls input on-change upon text updates', async () => {
      render(<ReduxFileUpload {...baseProps} />);
      const fileTextbox = screen.getByRole('textbox', { name: 'File upload' });
      expect(baseProps.input.onChange).toHaveBeenCalledTimes(0);
      await user.type(fileTextbox, 'abc');
      expect(baseProps.input.onChange).toHaveBeenCalledTimes(3);
      await user.paste('my-trusted-ca-cert');
      expect(baseProps.input.onChange).toHaveBeenCalledTimes(4);
      await user.paste('some-more-text-i-forgot-to-paste-earlier');
      expect(baseProps.input.onChange).toHaveBeenCalledTimes(5);
    });

    it('calls input on-change upon clicking "clear"', async () => {
      render(
        <ReduxFileUpload
          {...baseProps}
          input={{
            ...baseProps.input,
            value: 'lol',
          }}
        />,
      );
      expect(baseProps.input.onChange).not.toHaveBeenCalled();
      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);
      expect(baseProps.input.onChange).toHaveBeenCalledWith('');
    });

    it('calls input on-change upon file-upload', async () => {
      render(<ReduxFileUpload {...baseProps} />);
      const file = new File(['hello'], 'hello.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]');
      expect(baseProps.input.onChange).not.toHaveBeenCalled();
      await user.upload(fileInput, file);
      expect(baseProps.input.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ path: './hello.png' }),
      );
      expect(baseProps.input.onChange).toHaveBeenCalledWith('hello');
    });

    it('calls input on-blur upon textbox blur', async () => {
      render(<ReduxFileUpload {...baseProps} />);
      const fileTextbox = screen.getByRole('textbox', { name: 'File upload' });
      await user.click(fileTextbox);
      expect(baseProps.input.onBlur).toHaveBeenCalledTimes(0);
      await user.tab();
      expect(baseProps.input.onBlur).toHaveBeenCalledTimes(1);
    });
  });
});
