import userEvent from '@testing-library/user-event';

export const uploadFile = async (content: string, filename = 'users.htpasswd') => {
  const file = new File([content], filename, { type: 'text/plain' });
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(fileInput, file);
};
