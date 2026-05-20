import { fireEvent, userEvent } from '~/testUtils';

export const uploadFile = async (content: string, filename = 'users.htpasswd') => {
  const file = new File([content], filename, { type: 'text/plain' });
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(fileInput, file);
};

export const dropFile = (content: string, filename: string, mimeType: string) => {
  const file = new File([content], filename, { type: mimeType });
  const dropzone = document.querySelector('.pf-v6-c-file-upload') as HTMLElement;
  fireEvent.drop(dropzone, {
    dataTransfer: { files: [file], types: ['Files'] },
  });
};
