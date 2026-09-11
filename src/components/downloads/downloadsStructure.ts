import { isRestrictedEnv } from '~/restrictedEnv';

import { tools } from '../../common/installLinks.mjs';

export type Categories = {
  key: string;
  title: string;
  tools: string[];
};

/** Used to track row collapsed/expanded state, and also for URLs linking to specific row. */
export const expandKeys: { [index: string]: string } = {
  ...tools,
  // the rest should be distinct from `tools` keys.
  PULL_SECRET: 'pull-secret',
  TOKEN_OCM: 'ocm-api-token',
};

/**
 * Represents the sections and entries of downloads page.
 */
const categories: Categories[] = [
  // 'ALL' will be inserted here, see below.
  {
    key: 'CLI',
    title: 'Command-line interface (CLI) tools',
    tools: [tools.OC, tools.OCM, tools.ROSA, tools.KN, tools.TKN, tools.ARGO_CD, tools.SHP_CLI],
  },
  {
    key: 'DEV',
    title: 'Developer tools',
    tools: [tools.ODO, tools.HELM3, tools.HELM, tools.OPM, tools.OPERATOR_SDK, tools.RHOAS],
  },
  {
    key: 'INSTALLATION',
    title: 'OpenShift installation',
    tools: [
      tools.X86INSTALLER,
      tools.IBMZINSTALLER,
      tools.PPCINSTALLER,
      tools.ARMINSTALLER,
      tools.MULTIINSTALLER,
      tools.CRC,
    ],
  },
  {
    key: 'DISCONNECTED_INSTALLATION',
    title: 'OpenShift disconnected installation tools',
    tools: [tools.MIRROR_REGISTRY, tools.OC_MIRROR_PLUGIN],
  },
  {
    key: 'CUSTOM_INSTALLATION',
    title: 'OpenShift installation customization tools',
    tools: [tools.BUTANE, tools.COREOS_INSTALLER, tools.CCOCTL],
  },
  {
    key: 'TOKENS',
    title: 'Tokens',
    tools: [expandKeys.PULL_SECRET, expandKeys.TOKEN_OCM],
  },
];
const restrictedCategories: Categories[] = [
  {
    key: 'CLI',
    title: 'Command-line interface (CLI) tools',
    tools: [tools.OC, tools.ROSA],
  },
  {
    key: 'TOKENS',
    title: 'Tokens',
    tools: [expandKeys.PULL_SECRET, expandKeys.TOKEN_OCM],
  },
];

export const allCategories: Categories[] = categories.concat(restrictedCategories);

export const downloadsCategories: () => Categories[] = () =>
  [
    {
      key: 'ALL',
      title: 'All categories',
      tools: (isRestrictedEnv() ? restrictedCategories : categories).reduce(
        (acc: string[], curr) => acc.concat(curr.tools),
        [],
      ),
    },
  ].concat(isRestrictedEnv() ? restrictedCategories : categories);
