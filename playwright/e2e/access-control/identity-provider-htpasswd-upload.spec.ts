import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect, test } from '../../fixtures/pages';

const {
  'rosa-hosted-public-advanced': clusterProfile,
} = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const htpasswdProfile = require('../../fixtures/access-control/identity-provider-htpasswd.json');
const clusterName = process.env.CLUSTER_NAME || clusterProfile['day1-profile'].ClusterName;
const invalidFixtures = htpasswdProfile.Htpasswd.Upload.InvalidFixtures;

// Per-run suffix prevents IDP name collisions across retries or shared clusters.
const runId = Math.random().toString(36).slice(2, 5);
const validIdpNames = [
  `HtpasswdUpload1-${runId}`,
  `HtpasswdUpload2-${runId}`,
  `HtpasswdUploadTxt-${runId}`,
];

// Bcrypt-hashed htpasswd file contents are kept here (not in JSON) to avoid
// false-positive sensitive-content scanner failures on fixture files.
// Single shared hash used across all entries — tests validate file format, not password uniqueness.
const H = '$2y$05$uDMntF9GB8MScvn2oo3NQO8j56WIGY4G2R5/qKfyVZZP1ljbI.aLa'; // notsecret

const htpasswdFileContents = {
  MainHtpasswd: {
    extension: 'htpasswd',
    content: [`example-user1:${H}`, `example-user2:${H}`].join('\n'),
  },
  TxtExtension: {
    extension: 'txt',
    content: [`example-user3:${H}`, `example-user4:${H}`, `example-user5:${H}`].join('\n'),
  },
  ModalValid: {
    extension: 'htpasswd',
    content: [`example-user6:${H}`, `example-user7:${H}`, `example-user8:${H}`].join('\n'),
  },
  ModalValidTxt: {
    extension: 'txt',
    content: [`example-user9:${H}`, `example-user10:${H}`, `example-user11:${H}`].join('\n'),
  },
  InvalidEmptyUsernames: {
    extension: 'htpasswd',
    content: `:${H}`,
  },
  InvalidEmptyPassword: {
    extension: 'htpasswd',
    content: 'example-user12:',
  },
  InvalidPlainPassword: {
    extension: 'htpasswd',
    content: 'example-user13:plaintext',
  },
  InvalidDuplicateUsernames: {
    extension: 'htpasswd',
    content: [`example-user14:${H}`, `example-user15:${H}`, `example-user14:${H}`].join('\n'),
  },
  InvalidEmptyFile: {
    extension: 'htpasswd',
    content: '',
  },
} as const;

/**
 * Writes the given content to a single shared temp file with the specified extension,
 * overwriting any previous content. Returns the file path for use with setInputFiles.
 */
function writeFixtureFile(content: string, extension = 'htpasswd'): string {
  const filePath = path.join(os.tmpdir(), `htpasswd-test-fixture.${extension}`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

test.describe.serial(
  'ROSA Hosted Public Cluster - Htpasswd IDP upload file validation(OCP-42373)',
  { tag: ['@day2', '@access-control', '@rosa-hosted', '@hcp', '@idp', '@htpasswd'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test.afterAll(
      async ({
        navigateTo,
        clusterListPage,
        clusterRolesAndAccessPage,
        clusterIdentityProviderPage,
      }) => {
        await navigateTo('cluster-list');
        await clusterListPage.waitForDataReady();
        await clusterListPage.filterTxtField().fill(clusterName);
        await clusterListPage.waitForDataReady();
        await clusterListPage.openClusterDefinition(clusterName);
        await clusterRolesAndAccessPage.goToAccessControlTab();
        await clusterIdentityProviderPage.goToIdentityProvidersTab();

        for (const idpName of validIdpNames) {
          await clusterIdentityProviderPage.deleteHtpasswdIDP(idpName).catch(() => {});
          await clusterIdentityProviderPage.waitForDeleteIdpDialogToClose().catch(() => {});
        }
      },
    );

    test(`Navigate to the ROSA Hosted Access Control tab for ${clusterName} cluster`, async ({
      clusterListPage,
      clusterRolesAndAccessPage,
      clusterIdentityProviderPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterRolesAndAccessPage.goToAccessControlTab();
      await clusterIdentityProviderPage.goToIdentityProvidersTab();
    });

    test(`Validate htpasswd IDP upload form displays correct radio option and file input for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await expect(clusterIdentityProviderPage.uploadHtpasswdRadio()).toBeVisible();

      await clusterIdentityProviderPage.selectUploadMode();

      await expect(clusterIdentityProviderPage.browseButton()).toBeVisible();
      await expect(clusterIdentityProviderPage.htpasswdFileInput()).toBeAttached();

      await clusterIdentityProviderPage.cancelLink().click();
    });

    test(`Validate htpasswd IDP upload form field errors for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await expect(
        clusterIdentityProviderPage.getByText(
          htpasswdProfile.Htpasswd.Common.IDPName.DefaultNameInformation,
        ),
      ).toBeVisible();
      await clusterIdentityProviderPage.selectUploadMode();
      await expect(clusterIdentityProviderPage.idpFormSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.cancelLink().click();
    });

    test(`Reject htpasswd file with empty usernames for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[0]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(htpasswdFileContents.InvalidEmptyUsernames.content),
      );

      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.EmptyUsernames.ExpectedError),
      ).toBeVisible();
      await expect(clusterIdentityProviderPage.idpFormSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.cancelLink().click();
    });

    test(`Reject htpasswd file with empty passwords for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[0]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(htpasswdFileContents.InvalidEmptyPassword.content),
      );

      await expect(clusterIdentityProviderPage.idpFormSubmitButton()).toBeDisabled();
      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.EmptyPassword.ExpectedError),
      ).toBeVisible();

      await clusterIdentityProviderPage.cancelLink().click();
    });

    test(`Reject htpasswd file with non-hashed plaintext passwords for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[0]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(htpasswdFileContents.InvalidPlainPassword.content),
      );

      await expect(clusterIdentityProviderPage.idpFormSubmitButton()).toBeDisabled();
      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.PlainPassword.ExpectedError),
      ).toBeVisible();

      await clusterIdentityProviderPage.cancelLink().click();
    });

    test(`Reject htpasswd file with duplicate usernames for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[0]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(htpasswdFileContents.InvalidDuplicateUsernames.content),
      );

      await expect(clusterIdentityProviderPage.idpFormSubmitButton()).toBeDisabled();
      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.DuplicateUsernames.ExpectedError),
      ).toBeVisible();

      await clusterIdentityProviderPage.cancelLink().click();
    });

    test(`Reject empty htpasswd file with no users or passwords for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[0]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(htpasswdFileContents.InvalidEmptyFile.content),
      );

      await expect(clusterIdentityProviderPage.idpFormSubmitButton()).toBeDisabled();
      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.EmptyFile.ExpectedError),
      ).toBeVisible();

      await clusterIdentityProviderPage.cancelLink().click();
    });

    test(`Create htpasswd IDP using a .txt file upload for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[2]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(
          htpasswdFileContents.TxtExtension.content,
          htpasswdFileContents.TxtExtension.extension,
        ),
      );

      await expect(clusterIdentityProviderPage.clearFileButton()).toBeVisible();

      await clusterIdentityProviderPage.idpFormSubmitButton().click();
      await clusterIdentityProviderPage.waitForIdpToAppearInTable(validIdpNames[2]);
    });

    test(`Create htpasswd IDP using upload mode for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[0]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(
          htpasswdFileContents.MainHtpasswd.content,
          htpasswdFileContents.MainHtpasswd.extension,
        ),
      );

      await expect(clusterIdentityProviderPage.clearFileButton()).toBeVisible();

      await clusterIdentityProviderPage.idpFormSubmitButton().click();
      await clusterIdentityProviderPage.waitForIdpToAppearInTable(validIdpNames[0]);
    });

    test(`Verify uploaded htpasswd IDP appears in the identity providers table`, async ({
      clusterIdentityProviderPage,
    }) => {
      await expect(clusterIdentityProviderPage.identityProviderRow(validIdpNames[0])).toBeVisible();
    });

    test(`Clear uploaded file and re-upload for htpasswd IDP for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openHtpasswdForm();

      await clusterIdentityProviderPage.htpasswdNameInput().fill(validIdpNames[1]);
      await clusterIdentityProviderPage.selectUploadMode();
      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(
          htpasswdFileContents.MainHtpasswd.content,
          htpasswdFileContents.MainHtpasswd.extension,
        ),
      );

      await expect(clusterIdentityProviderPage.clearFileButton()).toBeVisible();
      await clusterIdentityProviderPage.clearFileButton().click();

      await expect(clusterIdentityProviderPage.browseButton()).toBeVisible();
      await expect(clusterIdentityProviderPage.clearFileButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadHtpasswdFile(
        writeFixtureFile(
          htpasswdFileContents.MainHtpasswd.content,
          htpasswdFileContents.MainHtpasswd.extension,
        ),
      );

      await clusterIdentityProviderPage.idpFormSubmitButton().click();
      await clusterIdentityProviderPage.waitForIdpToAppearInTable(validIdpNames[1]);
    });

    // ==================== Edit IDP - Upload htpasswd file modal ====================

    test(`Open edit page for an IDP and verify upload htpasswd file button is visible`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.editHtpasswdIDP(validIdpNames[0]);

      await expect(clusterIdentityProviderPage.editIdpPageTitle()).toBeVisible();
      await expect(clusterIdentityProviderPage.uploadHtpasswdFileToolbarButton()).toBeVisible();
    });

    test(`Verify upload modal opens and submit is disabled when no file is selected for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();

      await expect(clusterIdentityProviderPage.uploadFileModalBrowseButton()).toBeVisible();
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Reject upload modal file with empty usernames for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(htpasswdFileContents.InvalidEmptyUsernames.content),
      );

      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.EmptyUsernames.ExpectedError),
      ).toBeVisible();
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Reject upload modal file with empty passwords for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(htpasswdFileContents.InvalidEmptyPassword.content),
      );

      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.EmptyPassword.ExpectedError),
      ).toBeVisible();
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Reject upload modal file with non-hashed plaintext passwords for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(htpasswdFileContents.InvalidPlainPassword.content),
      );

      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.PlainPassword.ExpectedError),
      ).toBeVisible();
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Reject upload modal file with duplicate usernames for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(htpasswdFileContents.InvalidDuplicateUsernames.content),
      );

      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.DuplicateUsernames.ExpectedError),
      ).toBeVisible();
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Reject empty htpasswd file in upload modal for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(htpasswdFileContents.InvalidEmptyFile.content),
      );

      await expect(
        clusterIdentityProviderPage.getByText(invalidFixtures.EmptyFile.ExpectedError),
      ).toBeVisible();
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Clear and re-upload file in the upload modal for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(
          htpasswdFileContents.MainHtpasswd.content,
          htpasswdFileContents.MainHtpasswd.extension,
        ),
      );

      await expect(clusterIdentityProviderPage.uploadFileModalClearButton()).toBeVisible();
      await clusterIdentityProviderPage.uploadFileModalClearButton().click();
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeDisabled();

      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(
          htpasswdFileContents.MainHtpasswd.content,
          htpasswdFileContents.MainHtpasswd.extension,
        ),
      );
      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeEnabled();

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Verify backend error when uploading a file with usernames that already exist in the IDP for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(
          htpasswdFileContents.MainHtpasswd.content,
          htpasswdFileContents.MainHtpasswd.extension,
        ),
      );

      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeEnabled();
      await clusterIdentityProviderPage.uploadFileModalSubmitButton().click();

      await expect(clusterIdentityProviderPage.uploadModalErrorAlert()).toBeVisible({
        timeout: 15000,
      });
      await expect(clusterIdentityProviderPage.uploadModalErrorAlert()).toContainText(
        htpasswdProfile.Htpasswd.Upload.DuplicateUsernameErrorPattern,
      );

      await clusterIdentityProviderPage.uploadFileModalCancelButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Successfully upload a valid htpasswd file with new users via the upload modal for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(
          htpasswdFileContents.ModalValid.content,
          htpasswdFileContents.ModalValid.extension,
        ),
      );

      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeEnabled();
      await clusterIdentityProviderPage.uploadFileModalSubmitButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });

    test(`Successfully upload a .txt htpasswd file with new users via the upload modal for ${clusterName}`, async ({
      clusterIdentityProviderPage,
    }) => {
      await clusterIdentityProviderPage.openUploadFileModal();
      await clusterIdentityProviderPage.uploadFileInModal(
        writeFixtureFile(
          htpasswdFileContents.ModalValidTxt.content,
          htpasswdFileContents.ModalValidTxt.extension,
        ),
      );

      await expect(clusterIdentityProviderPage.uploadFileModalSubmitButton()).toBeEnabled();
      await clusterIdentityProviderPage.uploadFileModalSubmitButton().click();
      await clusterIdentityProviderPage.waitForUploadFileModalToClose();
    });
  },
);
