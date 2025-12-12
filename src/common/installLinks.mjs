// This module has .mjs extension to simplify importing from NodeJS scripts.

import { combineAndSortLinks } from './linkUtils.mjs';

const MIRROR_BUTANE_LATEST = 'https://mirror.openshift.com/pub/openshift-v4/clients/butane/latest';
const MIRROR_CLIENTS_STABLE_X86 =
  'https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/';
const MIRROR_CLIENTS_LATEST_X86 =
  'https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/latest/';
const MIRROR_CLIENTS_CANDIDATE_X86 =
  'https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/candidate/';
const MIRROR_CLIENTS_STABLE_IBMZ =
  'https://mirror.openshift.com/pub/openshift-v4/s390x/clients/ocp/stable/';
const MIRROR_CLIENTS_LATEST_IBMZ =
  'https://mirror.openshift.com/pub/openshift-v4/s390x/clients/ocp/latest/';
const MIRROR_CLIENTS_STABLE_PPC =
  'https://mirror.openshift.com/pub/openshift-v4/ppc64le/clients/ocp/stable/';
const MIRROR_CLIENTS_LATEST_PPC =
  'https://mirror.openshift.com/pub/openshift-v4/ppc64le/clients/ocp/latest/';
const MIRROR_CLIENTS_STABLE_ARM =
  'https://mirror.openshift.com/pub/openshift-v4/aarch64/clients/ocp/stable/';
const MIRROR_CLIENTS_LATEST_ARM =
  'https://mirror.openshift.com/pub/openshift-v4/aarch64/clients/ocp/latest/';
const MIRROR_CLIENTS_STABLE_MULTI =
  'https://mirror.openshift.com/pub/openshift-v4/multi/clients/ocp/stable/';
const MIRROR_CLIENTS_LATEST_PRE_X86 =
  'https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp-dev-preview/pre-release/';
const MIRROR_CLIENTS_LATEST_PRE_IBMZ =
  'https://mirror.openshift.com/pub/openshift-v4/s390x/clients/ocp-dev-preview/pre-release/';
const MIRROR_CLIENTS_LATEST_PRE_PPC =
  'https://mirror.openshift.com/pub/openshift-v4/ppc64le/clients/ocp-dev-preview/pre-release/';
const MIRROR_CLIENTS_LATEST_PRE_ARM =
  'https://mirror.openshift.com/pub/openshift-v4/aarch64/clients/ocp-dev-preview/pre-release/';
const MIRROR_CLIENTS_LATEST_PRE_MULTI =
  'https://mirror.openshift.com/pub/openshift-v4/multi/clients/ocp-dev-preview/pre-release/';
const MIRROR_COREOS_INSTALLER_LATEST =
  'https://mirror.openshift.com/pub/openshift-v4/clients/coreos-installer/latest';
const MIRROR_CRC_LATEST =
  'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/crc/latest';
const MIRROR_HELM_LATEST = 'https://mirror.openshift.com/pub/openshift-v4/clients/helm/latest';
const MIRROR_KN_LATEST = 'https://mirror.openshift.com/pub/openshift-v4/clients/serverless/latest';
const MIRROR_TKN_LATEST = 'https://mirror.openshift.com/pub/openshift-v4/clients/pipeline/latest';
const MIRROR_ODO_LATEST =
  'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest';
const MIRROR_OSDK_LATEST_X86 =
  'https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/operator-sdk/latest';
const MIRROR_OSDK_LATEST_IBMZ =
  'https://mirror.openshift.com/pub/openshift-v4/s390x/clients/operator-sdk/latest';
const MIRROR_OSDK_LATEST_PPC =
  'https://mirror.openshift.com/pub/openshift-v4/ppc64le/clients/operator-sdk/latest';
const MIRROR_OSDK_LATEST_ARM =
  'https://mirror.openshift.com/pub/openshift-v4/aarch64/clients/operator-sdk/latest';
const MIRROR_RHCOS_LATEST_X86 =
  'https://mirror.openshift.com/pub/openshift-v4/x86_64/dependencies/rhcos/latest';
const MIRROR_RHCOS_LATEST_IBMZ =
  'https://mirror.openshift.com/pub/openshift-v4/s390x/dependencies/rhcos/latest';
const MIRROR_RHCOS_LATEST_PPC =
  'https://mirror.openshift.com/pub/openshift-v4/ppc64le/dependencies/rhcos/latest';
const MIRROR_RHCOS_LATEST_ARM =
  'https://mirror.openshift.com/pub/openshift-v4/aarch64/dependencies/rhcos/latest';
const MIRROR_ROSA_LATEST = 'https://mirror.openshift.com/pub/cgw/rosa/latest';
const MIRROR_MIRROR_REGISTRY_LATEST = 'https://mirror.openshift.com/pub/cgw/mirror-registry/latest';

const ARGO_CD_CLI_LATEST =
  'https://developers.redhat.com/content-gateway/rest/browse/pub/openshift-v4/clients/openshift-gitops/latest/';

const SHP_CLI_LATEST =
  'https://developers.redhat.com/content-gateway/rest/browse/pub/openshift-v4/clients/openshift-builds/latest/';

const OCP_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html';
const OSD_DOCS_BASE = 'https://docs.redhat.com/en/documentation/openshift_dedicated/4/html';
const ROSA_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html';
const ROSA_CLASSIC_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws_classic_architecture/4/html';
const ROSA_CP_DOCS_BASE =
  'https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4/html';

const COSTMGMT_DOCS_BASE =
  'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html';
const OCM_DOCS_BASE =
  'https://access.redhat.com/documentation/en-us/openshift_cluster_manager/2023';

const OCP_DOC_BASE =
  'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.13';

const links = {
  ROSA_CP_DOCS: 'https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4',
  OSD_GOOGLE_MARKETPLACE:
    'https://console.cloud.google.com/marketplace/product/redhat-marketplace/red-hat-openshift-dedicated?inv=1&invt=Abh7pg',
  ACCESS_REQUEST_DOC_LINK: `${ROSA_CP_DOCS_BASE}/support/approved-access#approved-access`,
  DOCS_ENTRY: `${OCP_DOCS_BASE}/overview/welcome-index`,
  ROSA_TROUBLESHOOTING_INSTALLATIONS: `${ROSA_CP_DOCS_BASE}/support/troubleshooting#rosa-troubleshooting-installations`,
  ROSA_DEFINITION_DOC: `${ROSA_CP_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-service-definition`,
  WHAT_IS_OPENSHIFT: 'https://www.redhat.com/en/technologies/cloud-computing/openshift',
  WHAT_IS_ROSA: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/aws',
  WHAT_IS_OSD: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated',
  LEARN_MORE_OSD:
    'https://www.redhat.com/en/products/interactive-walkthrough/install-openshift-dedicated-google-cloud',
  ROSA_COMMUNITY_SLACK: 'https://red.ht/rosa-slack',
  ROSA_QUICKSTART: `${ROSA_CLASSIC_DOCS_BASE}/getting_started/rosa-quickstart-guide-ui`,
  OSD_QUICKSTART: 'https://www.youtube.com/watch?v=p9KBFvMDQJM&feature=youtu.be',
  OSD_INTERACTIVE_WALKTHROUGH:
    'https://www.redhat.com/en/products/interactive-walkthrough/install-openshift-dedicated-google-cloud',
  ROSA_PRICING: 'https://aws.amazon.com/rosa/pricing',
  OSD_PRICING:
    'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated?intcmp=7013a000003DQeVAAW#pricing',
  IDP_HTPASSWD: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#configuring-htpasswd-identity-provider`,
  IDP_LDAP: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-ldap-identity-provider`,
  IDP_GITHUB: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#configuring-github-identity-provider`,
  IDP_GITLAB: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-gitlab-identity-provider`,
  IDP_GOOGLE: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-google-identity-provider`,
  IDP_OPENID: `${OCP_DOCS_BASE}/authentication_and_authorization/configuring-identity-providers#identity-provider-overview_configuring-oidc-identity-provider`,
  CCO_MANUAL_MODE: `${OCP_DOCS_BASE}/authentication_and_authorization/managing-cloud-provider-credentials#cco-mode-manual`,
  UNDERSTANDING_AUTHENTICATION: `${OCP_DOCS_BASE}/authentication_and_authorization/understanding-authentication`,
  UNDERSTANDING_IDENTITY_PROVIDER: `${OCP_DOCS_BASE}/authentication_and_authorization/understanding-identity-provider`,
  ROSA_UNDERSTANDING_IDENTITY_PROVIDER: `${ROSA_DOCS_BASE}/authentication_and_authorization/sd-configuring-identity-providers`,
  APPLYING_AUTOSCALING: `${OCP_DOCS_BASE}//machine_management/applying-autoscaling`,
  APPLYING_AUTOSCALING_API_DETAIL: `${OCP_DOCS_BASE}/autoscale_apis/clusterautoscaler-autoscaling-openshift-io-v1`,
  AWS_SPOT_INSTANCES: `${OCP_DOCS_BASE}/machine_management/managing-compute-machines-with-the-machine-api#machineset-non-guaranteed-instance_creating-machineset-aws`,
  ENCRYPTING_ETCD: `${OCP_DOCS_BASE}-single/etcd/index#enabling-etcd-encryption`,
  GETTING_SUPPORT: `${OCP_DOCS_BASE}/support/getting-support`,
  TELEMETRY_INFORMATION: `${OCP_DOCS_BASE}/support/remote-health-monitoring-with-connected-clusters#about-remote-health-monitoring`,
  REMOTE_HEALTH_INSIGHTS: `${OCP_DOCS_BASE}/support/remote-health-monitoring-with-connected-clusters#insights-operator-advisor-overview_using-insights-to-identify-issues-with-your-cluster`,
  UPDATING_CLUSTER: `${OCP_DOCS_BASE}/updating_clusters/performing-a-cluster-update#updating-cluster-web-console`,
  // TODO https://issues.redhat.com/browse/HAC-5192 to change the link to a public document, not a KB article
  HIBERNATING_CLUSTER: 'https://access.redhat.com/articles/7012966',
  MIGRATING_FROM_3_TO_4: `${OCP_DOCS_BASE}/migrating_from_version_3_to_4/about-migrating-from-3-to-4`,
  SERVERLESS_ABOUT: `${OCP_DOCS_BASE}/serverless/about-serverless`,
  SERVICE_MESH_ABOUT: `${OCP_DOCS_BASE}/service_mesh/service-mesh-2-x#ossm-architecture`,
  SERVICE_MESH_OCP_DOC: `${OCP_DOC_BASE}/html/service_mesh/index`,
  VIRT_ABOUT: `${OCP_DOCS_BASE}/virtualization/about#virt-what-you-can-do-with-virt_about-virt`,

  SUBSCRIPTION_EVAL_INFORMATION: 'https://access.redhat.com/articles/4389911',
  MANAGED_INGRESS_KNOWLEDGE_BASE: 'https://access.redhat.com/articles/7028653',

  OSD_DEDICATED_ADMIN_ROLE: `${OSD_DOCS_BASE}/authentication_and_authorization/osd-admin-roles`,
  OSD_CCS_AWS: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs`,
  OSD_CCS_AWS_LIMITS: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs#aws-limits_aws-ccs`,
  OSD_CCS_AWS_SCP: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs#ccs-aws-scp_aws-ccs`,
  OSD_CCS_AWS_CUSTOMER_REQ: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs#ccs-aws-customer-requirements_aws-ccs`,
  OSD_CCS_GCP: `${OSD_DOCS_BASE}/planning_your_environment/gcp-ccs`,
  OSD_CCS_GCP_LIMITS: `${OSD_DOCS_BASE}/planning_your_environment/gcp-ccs#gcp-limits_gcp-ccs`,
  OSD_CCS_GCP_SCP: `${OSD_DOCS_BASE}/planning_your_environment/gcp-ccs#ccs-gcp-customer-procedure_gcp-ccs`,
  OSD_CCS_GCP_SHEILDED_VM: `${OSD_DOCS_BASE}/openshift_dedicated_clusters_on_google_cloud/osd-creating-a-cluster-on-gcp-with-workload-identity-federation`,
  OSD_CCS_GCP_WIF_GCLOUD_CLI: 'https://cloud.google.com/sdk/docs/install',
  OSD_CCS_GCP_WIF_GCLOUD_CREDENTIALS:
    'https://cloud.google.com/docs/authentication/provide-credentials-adc',
  OSD_CCS_GCP_WIF_CREATION_LEARN_MORE: `${OSD_DOCS_BASE}/openshift_dedicated_clusters_on_google_cloud/osd-creating-a-cluster-on-gcp-with-workload-identity-federation#workload-identity-federation-overview_osd-creating-a-cluster-on-gcp-with-workload-identity-federation`,
  OSD_LIFE_CYCLE: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#osd-life-cycle`,
  OSD_LIFE_CYCLE_DATES: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#sd-life-cycle-dates_osd-life-cycle`,
  OSD_Z_STREAM: `${OSD_DOCS_BASE}/upgrading/osd-upgrades#upgrade-auto_osd-upgrades`,
  OSD_SERVICE_DEFINITION_COMPUTE: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#instance-types_osd-service-definition`,
  ROSA_SERVICE_DEFINITION_COMPUTE: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-instance-types_rosa-service-definition`,
  OSD_ETCD_ENCRYPTION: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#etcd-encryption_osd-service-definition_dedicated/policies-and-service-definition#sdpolicy-account-management_osd-service-definition`,
  OSD_AWS_PRIVATE_CONNECTIONS: `${OSD_DOCS_BASE}/cluster_administration/configuring-private-connections#enable-aws-access`,
  OSD_PRIVATE_CLUSTER: `${OSD_DOCS_BASE}/cluster_administration/configuring-private-connections#private-cluster`,
  OSD_CLUSTER_WIDE_PROXY: `${OSD_DOCS_BASE}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  OSD_UPGRADES: `${OSD_DOCS_BASE}/upgrading/osd-upgrades`,
  OSD_LIMITED_SUPPORT_DEFINITION: `${OSD_DOCS_BASE}/introduction_to_openshift_dedicated/policies-and-service-definition#limited-support_osd-service-definition`,
  OSD_MONITORING_STACK: `${OSD_DOCS_BASE}/monitoring/configuring-user-workload-monitoring#preparing-to-configure-the-monitoring-stack-uwm`,
  OSD_CIDR_MACHINE: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#machine-cidr-description`,
  ROSA_CLASSIC_CIDR_MACHINE: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#machine-cidr-description`,
  ROSA_CIDR_MACHINE: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#machine-cidr-description`,
  OSD_CIDR_SERVICE: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#service-cidr-description`,
  ROSA_CLASSIC_CIDR_SERVICE: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#service-cidr-description`,
  ROSA_CIDR_SERVICE: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#service-cidr-description`,
  OSD_CIDR_POD: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#pod-cidr-description`,
  ROSA_CLASSIC_CIDR_POD: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#pod-cidr-description`,
  ROSA_CIDR_POD: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#pod-cidr-description`,
  OSD_CIDR_HOST: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions#host-prefix-description`,
  ROSA_CLASSIC_CIDR_HOST: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions#host-prefix-description`,
  ROSA_CIDR_HOST: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions#host-prefix-description`,
  OSD_CLUSTER_AUTOSCALING: `${OSD_DOCS_BASE}/cluster_administration/osd-cluster-autoscaling`,
  ROSA_CLUSTER_AUTOSCALING: `${ROSA_DOCS_BASE}/cluster_administration/rosa-cluster-autoscaling-hcp`,
  OSD_SECURITY_GROUPS: `${OSD_DOCS_BASE}/planning_your_environment/aws-ccs#osd-security-groups-custom_aws-ccs `,

  CLI_TOOLS_OCP_GETTING_STARTED: `${OCP_DOCS_BASE}/cli_tools/openshift-cli-oc#cli-about-cli_cli-developer-commands`,

  INSTALL_DOCS_ENTRY: `${OCP_DOCS_BASE}/installation_overview/ocp-installation-overview`,

  INSTALL_ASSISTED_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on-premise_with_assisted_installer/installing-on-prem-assisted`,
  INSTALL_AGENT_LEARN_MORE: `${OCP_DOCS_BASE}/installing_an_on-premise_cluster_with_the_agent-based_installer/preparing-to-install-with-agent-based-installer`,

  INSTALL_AWSIPI_DOCS_LANDING: `${OCP_DOCS_BASE}/installing_on_aws/installing-aws-account`,
  INSTALL_AWSIPI_DOCS_ENTRY: `${OCP_DOCS_BASE}/overview/welcome-index`,
  INSTALL_AWSIPI_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_aws/installer-provisioned-infrastructure#prerequisites`,
  INSTALL_AWSUPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_aws/user-provisioned-infrastructure#installing-aws-user-infra`,
  INSTALL_AWS_CUSTOMIZATIONS: `${OCP_DOCS_BASE}/installing_on_aws/installer-provisioned-infrastructure#installing-aws-customizations`,
  INSTALL_AWS_VPC: `${OCP_DOCS_BASE}/installing_on_aws/installer-provisioned-infrastructure#installing-aws-vpc`,
  INSTALL_AWS_CUSTOM_VPC_REQUIREMENTS: `${OCP_DOCS_BASE}/installing_on_aws/installer-provisioned-infrastructure#installation-custom-aws-vpc-requirements_installing-aws-vpc`,
  INSTALL_AWS_MULTI_ARCH: `${OCP_DOCS_BASE}/postinstallation_configuration/configuring-multi-architecture-compute-machines-on-an-openshift-cluster#creating-multi-arch-compute-nodes-aws`,

  INSTALL_AZUREUPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_azure/user-provisioned-infrastructure#installing-azure-user-infra`,
  INSTALL_AZUREIPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_azure/installer-provisioned-infrastructure#installation-launching-installer_installing-azure-default`,
  INSTALL_AZURE_CUSTOMIZATIONS: `${OCP_DOCS_BASE}/installing_on_azure/installer-provisioned-infrastructure#installing-azure-customizations`,
  INSTALL_AZURE_MULTI_ARCH: `${OCP_DOCS_BASE}/postinstallation_configuration/configuring-multi-architecture-compute-machines-on-an-openshift-cluster#creating-multi-arch-compute-nodes-azure`,

  INSTALL_ASHIPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_azure_stack_hub/installer-provisioned-infrastructure#ash-preparing-to-install-ipi`,
  INSTALL_ASHUPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_azure_stack_hub/user-provisioned-infrastructure#installing-azure-stack-hub-user-infra`,
  INSTALL_ASHUPI_RHCOS_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_azure_stack_hub/user-provisioned-infrastructure#installation-azure-user-infra-uploading-rhcos_installing-azure-stack-hub-user-infra`,
  INSTALL_ASH_CUSTOMIZATIONS: `${OCP_DOCS_BASE}/installing_on_azure_stack_hub/installer-provisioned-infrastructure#installing-azure-stack-hub-network-customizations`,
  RHCOS_ASHUPI_VHD_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-azurestack.x86_64.vhd.gz`,

  INSTALL_BAREMETAL_UPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_bare_metal/user-provisioned-infrastructure#installing-bare-metal`,
  INSTALL_BAREMETAL_IPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_bare_metal/installer-provisioned-infrastructure#installing-rhel-on-the-provisioner-node_ipi-install-installation-workflow`,
  INSTALL_BAREMETAL_IPI_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_bare_metal/installer-provisioned-infrastructure#ipi-install-overview`,
  INSTALL_BAREMETAL_RHCOS_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_bare_metal/user-provisioned-infrastructure#creating-machines-bare-metal`,
  INSTALL_BAREMETAL_CUSTOMIZATIONS: `${OCP_DOCS_BASE}/installing_on_bare_metal/user-provisioned-infrastructure#installing-bare-metal-network-customizations`,
  RHCOS_BAREMETAL_ISO_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-live-iso.x86_64.iso`,
  RHCOS_BAREMETAL_RAW_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-metal.x86_64.raw.gz`,
  INSTALL_BAREMETAL_MULTI_ARCH: `${OCP_DOCS_BASE}/postinstallation_configuration/configuring-multi-architecture-compute-machines-on-an-openshift-cluster#creating-multi-arch-compute-nodes-bare-metal`,

  OPENSHIFT_LOCAL_SUPPORT_AND_COMMUNITY_DOCS: 'https://crc.dev/docs/using/',

  INSTALL_GCPIPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_google_cloud/installing-gcp-account`,
  INSTALL_GCPIPI_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_google_cloud/installing-gcp-default`,
  INSTALL_GCPUPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_google_cloud/installing-gcp-user-infra`,
  INSTALL_GCPUPI_RHCOS_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_google_cloud/installing-gcp-user-infra#installation-gcp-project_installing-gcp-user-infra`,
  INSTALL_GCP_CUSTOMIZATIONS: `${OCP_DOCS_BASE}/installing_on_google_cloud/installing-gcp-customizations`,
  INSTALL_GCP_VPC: `${OCP_DOCS_BASE}/installing_on_google_cloud/installing-gcp-vpc`,
  INSTALL_GCP_SHARED_VPC: `${OCP_DOCS_BASE}/installing_on_google_cloud/installing-gcp-shared-vpc`,
  RHCOS_GCPUPI_TAR_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-gcp.x86_64.tar.gz`,

  INSTALL_NUTANIXIPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_nutanix/preparing-to-install-on-nutanix`,

  INSTALL_OSPIPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_openstack/installing-openstack-installer-custom`,
  INSTALL_OSPUPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_openstack/installing-openstack-user`,
  INSTALL_OSPUPI_RHCOS_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_openstack/installing-openstack-user#installation-osp-creating-image_installing-openstack-user`,
  INSTALL_OSP_CUSTOMIZATIONS: `${OCP_DOCS_BASE}/installing_on_openstack/installing-openstack-installer-custom`,
  RHCOS_OSPUPI_QCOW_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-openstack.x86_64.qcow2.gz`,
  RHCOS_OSPUPI_QCOW_PPC: `${MIRROR_RHCOS_LATEST_PPC}/rhcos-openstack.ppc64le.qcow2.gz`,

  INSTALL_VSPHEREUPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_vmware_vsphere/user-provisioned-infrastructure#installing-vsphere`,
  INSTALL_VSPHEREIPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_vmware_vsphere/installer-provisioned-infrastructure#installing-vsphere-installer-provisioned`,
  INSTALL_VSPHERE_RHCOS_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_vmware_vsphere/user-provisioned-infrastructure#installation-vsphere-machines_installing-vsphere`,
  INSTALL_VSPHERE_CUSTOMIZATIONS: `${OCP_DOCS_BASE}/installing_on_vmware_vsphere/installer-provisioned-infrastructure#installing-vsphere-installer-provisioned-customizations`,
  RHCOS_VSPHERE_OVA_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-vmware.x86_64.ova`,

  INSTALL_IBM_CLOUD_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_ibm_cloud/preparing-to-install-on-ibm-cloud`,
  INSTALL_IBMZ_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_ibm_z_and_ibm_linuxone/user-provisioned-infrastructure#installing-ibm-z-reqs`,
  INSTALL_IBMZ_RHCOS_LEARN_MORE_RHEL_KVM: `${OCP_DOCS_BASE}/installing_on_ibm_z_and_ibm_linuxone/user-provisioned-infrastructure#installation-user-infra-machines-iso-ibm-z_kvm_installing-ibm-z-kvm`,
  INSTALL_IBMZ_LEARN_MORE_ZVM: `${OCP_DOCS_BASE}/installing_on_ibm_z_and_ibm_linuxone/user-provisioned-infrastructure#installation-user-infra-machines-iso-ibm-z_installing-ibm-z`,
  INSTALL_IBMZ_UPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_ibm_z_and_ibm_linuxone/user-provisioned-infrastructure#installing-ibm-z-reqs`,
  INSTALL_IBMZ_AGENTS_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_an_on-premise_cluster_with_the_agent-based_installer/prepare-pxe-assets-agent#installing-ocp-agent-ibm-z_prepare-pxe-assets-agent`,
  INSTALL_IBMPOWERVS_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_ibm_power_virtual_server/preparing-to-install-on-ibm-power-vs`,
  INSTALL_IBMPOWERVS_PREREQUISITES: `${OCP_DOCS_BASE}/installing_on_ibm_power_virtual_server/preparing-to-install-on-ibm-power-vs`,
  RHCOS_IBMZ_ISO: `${MIRROR_RHCOS_LATEST_IBMZ}/rhcos-live-iso.s390x.iso`,
  RHCOS_IBMZ_INITRAMFS: `${MIRROR_RHCOS_LATEST_IBMZ}/rhcos-live-initramfs.s390x.img`,
  RHCOS_IBMZ_KERNEL: `${MIRROR_RHCOS_LATEST_IBMZ}/rhcos-live-kernel.s390x`,
  RHCOS_IBMZ_ROOTFS: `${MIRROR_RHCOS_LATEST_IBMZ}/rhcos-live-rootfs.s390x.img`,
  RHCOS_IBMZ_QCOW: `${MIRROR_RHCOS_LATEST_IBMZ}/rhcos-qemu.s390x.qcow2.gz`,

  INSTALL_GENERIC_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_any_platform/installing-platform-agnostic`,
  INSTALL_GENERIC_NON_TESTED_PLATFORMS: 'https://access.redhat.com/articles/4207611',
  INSTALL_GENERIC_RHCOS_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_any_platform/installing-platform-agnostic`,
  RHCOS_GENERIC_ISO_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-live-iso.x86_64.iso`,
  RHCOS_GENERIC_KERNEL_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-live-kernel.x86_64`,
  RHCOS_GENERIC_INITRAMFS_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-live-initramfs.x86_64.img`,
  RHCOS_GENERIC_ROOTFS_X86: `${MIRROR_RHCOS_LATEST_X86}/rhcos-live-rootfs.x86_64.img`,

  INSTALL_PRE_RELEASE_INSTALLER_DOC: 'https://github.com/openshift/installer/tree/master/docs/user',
  INSTALL_PRE_RELEASE_FEEDBACK: 'https://issues.redhat.com/projects/OCPBUGS/issues',
  INSTALL_PRE_RELEASE_SUPPORT_KCS: 'https://access.redhat.com/support/offerings/devpreview',
  TECH_PREVIEW_KCS: 'https://access.redhat.com/support/offerings/techpreview',
  COOPERATIVE_COMMUNITY_SUPPORT_KCS: 'https://access.redhat.com/solutions/5893251',

  INSTALL_POWER_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_ibm_power/installing-ibm-power`,
  INSTALL_POWER_RHCOS_LEARN_MORE: `${OCP_DOCS_BASE}/installing_on_ibm_power/installing-ibm-power`,
  INSTALL_POWER_UPI_GETTING_STARTED: `${OCP_DOCS_BASE}/installing_on_ibm_power/installing-ibm-power`,
  RHCOS_POWER_ISO: `${MIRROR_RHCOS_LATEST_PPC}/rhcos-live-iso.ppc64le.iso`,
  RHCOS_POWER_INITRAMFS: `${MIRROR_RHCOS_LATEST_PPC}/rhcos-live-initramfs.ppc64le.img`,
  RHCOS_POWER_KERNEL: `${MIRROR_RHCOS_LATEST_PPC}/rhcos-live-kernel.ppc64le`,
  RHCOS_POWER_ROOTFS: `${MIRROR_RHCOS_LATEST_PPC}/rhcos-live-rootfs.ppc64le.img`,

  RHCOS_ARM_ISO: `${MIRROR_RHCOS_LATEST_ARM}/rhcos-live-iso.aarch64.iso`,
  RHCOS_ARM_INITRAMFS: `${MIRROR_RHCOS_LATEST_ARM}/rhcos-live-initramfs.aarch64.img`,
  RHCOS_ARM_KERNEL: `${MIRROR_RHCOS_LATEST_ARM}/rhcos-live-kernel.aarch64`,
  RHCOS_ARM_ROOTFS: `${MIRROR_RHCOS_LATEST_ARM}/rhcos-live-rootfs.aarch64.img`,
  RHCOS_ARM_RAW: `${MIRROR_RHCOS_LATEST_ARM}/rhcos-metal.aarch64.raw.gz`,

  OCM_CLI_DOCS: 'https://access.redhat.com/articles/6114701',
  OCM_CLI_RELEASES_LATEST:
    'https://developers.redhat.com/content-gateway/rest/browse/pub/cgw/ocm/latest',

  RHOAS_CLI_DOCS:
    'https://github.com/redhat-developer/app-services-guides/blob/main/docs/kafka/rhoas-cli-getting-started-kafka/README.adoc',
  RHOAS_CLI_RELEASES_LATEST: 'https://github.com/redhat-developer/app-services-cli/releases/latest',

  HELM_DOCS: `${OCP_DOCS_BASE}/building_applications/working-with-helm-charts#understanding-helm`,

  KN_DOCS: `${OCP_DOCS_BASE}/cli_tools/kn-cli-tools`,

  TKN_DOCS: `${OCP_DOCS_BASE}/cli_tools/pipelines-cli-tkn#installing-tkn`,

  ODO_DOCS: 'https://odo.dev/docs/introduction',

  OPM_DOCS: `${OCP_DOCS_BASE}/cli_tools/opm-cli#olm-about-opm_cli-opm-install`,

  OSDK_REMOVAL_DOCS_4_19: `https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/release_notes/ocp-4-19-release-notes#ocp-4-19-removed-osdk_release-notes`,

  BUTANE_DOCS: `${OCP_DOCS_BASE}/installation_configuration/installing-customizing`,

  COREOS_INSTALLER_DOCS: `${OCP_DOCS_BASE}/installing_on_any_platform/installing-platform-agnostic`,

  ARGO_CD_DOCS: `https://docs.redhat.com/en/documentation/red_hat_openshift_gitops/1.13/html/installing_gitops/installing-argocd-gitops-cli`,

  SHP_CLI_DOCS: `https://docs.redhat.com/en/documentation/builds_for_red_hat_openshift/1.1/html-single/work_with_builds/index`,

  INSTALL_MIRROR_REGISTRY_LEARN_MORE: `${OCP_DOCS_BASE}/disconnected_environments/installing-mirroring-installation-images#installation-about-mirror-registry_installing-mirroring-installation-images`,
  INSTALL_OC_MIRROR_PLUGIN_LEARN_MORE: `${OCP_DOCS_BASE}/disconnected_environments/installing-mirroring-installation-images`,

  OPENSHIFT_DEDICATED_LEARN_MORE:
    'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated',

  AWS_OPENSHIFT_LEARN_MORE: 'https://cloud.redhat.com/products/amazon-openshift',

  AZURE_OPENSHIFT_GET_STARTED: 'https://azure.microsoft.com/en-us/products/openshift/',

  ROSA_GET_STARTED: `https://cloud.redhat.com/learn/getting-started-red-hat-openshift-service-aws-rosa`,
  ROSA_DOCS_ENTRY: `${ROSA_DOCS_BASE}/about/welcome-index`,
  ROSA_CLASSIC_MONITORING: `${ROSA_CLASSIC_DOCS_BASE}-single/monitoring/index#preparing-to-configure-the-monitoring-stack-uwm`,
  ROSA_AUTOSCALING: `${ROSA_DOCS_BASE}/cluster_administration/manage-nodes-using-machine-pools#rosa-nodes-about-autoscaling-nodes`,
  ROSA_SECURITY_GROUPS: `${ROSA_DOCS_BASE}/prepare_your_environment/rosa-hcp-prereqs#rosa-security-groups_rosa-hcp-prereqs`,
  ROSA_CLASSIC_SECURITY_GROUPS: `${ROSA_CLASSIC_DOCS_BASE}/prepare_your_environment/rosa-sts-aws-prereqs#rosa-security-groups_rosa-sts-aws-prereqs`,
  ROSA_CLI_DOCS: `${ROSA_CP_DOCS_BASE}/rosa_cli/rosa-get-started-cli`,
  ROSA_LIFE_CYCLE: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#life-cycle-overview_rosa-life-cycle`,
  ROSA_LIFE_CYCLE_DATES: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#sd-life-cycle-dates_rosa-hcp-life-cycle`,
  ROSA_Z_STREAM: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-patch-versions_rosa-hcp-life-cycle`,
  ROSA_RESPONSIBILITY_MATRIX: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-policy-responsibility-matrix`,
  ROSA_SERVICE_DEFINITION: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-account-management_rosa-service-definition`,
  ROSA_WORKER_NODE_COUNT: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-compute_rosa-service-definition`,
  ROSA_SERVICE_ETCD_ENCRYPTION: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-sdpolicy-etcd-encryption_rosa-service-definition`,
  ROSA_CLASSIC_CLUSTER_WIDE_PROXY: `${ROSA_CLASSIC_DOCS_BASE}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  ROSA_CLUSTER_WIDE_PROXY: `${ROSA_DOCS_BASE}/ovn-kubernetes_network_plugin/configuring-a-cluster-wide-proxy`,
  ROSA_CLASSIC_UPGRADES: `${ROSA_CLASSIC_DOCS_BASE}/upgrading/rosa-upgrading-sts`,
  ROSA_UPGRADES: `${ROSA_DOCS_BASE}/upgrading/rosa-hcp-upgrading`,
  ROSA_LIMITED_SUPPORT_DEFINITION: `${ROSA_DOCS_BASE}/introduction_to_rosa/policies-and-service-definition#rosa-limited-support_rosa-service-definition`,
  ROSA_SHARED_VPC: `${ROSA_DOCS_BASE}/install_clusters/rosa-hcp-shared-vpc-config`,
  ROSA_PRIVATE_CONNECTIONS: `${ROSA_DOCS_BASE}/cluster_administration/configuring-private-connections#rosa-configuring-private-connections`,

  ROSA_AWS_CLASSIC_ACCOUNT_ASSOCIATION: `${ROSA_CLASSIC_DOCS_BASE}/prepare_your_environment/rosa-cloud-expert-prereq-checklist`,
  ROSA_AWS_ACCOUNT_ASSOCIATION: `${ROSA_DOCS_BASE}/prepare_your_environment/rosa-cloud-expert-prereq-checklist`,
  ROSA_AWS_SERVICE_QUOTAS: `${ROSA_CP_DOCS_BASE}/prepare_your_environment/rosa-sts-required-aws-service-quotas#rosa-required-aws-service-quotas_rosa-sts-required-aws-service-quotas`,
  ROSA_AWS_CLASSIC_LIMITS_SCALE: `${ROSA_CLASSIC_DOCS_BASE}/prepare_your_environment/rosa-planning-environment`,
  ROSA_AWS_CLASSIC_IAM_RESOURCES: `${ROSA_CLASSIC_DOCS_BASE}/introduction_to_rosa/rosa-sts-about-iam-resources`,
  ROSA_AWS_IAM_RESOURCES: `${ROSA_DOCS_BASE}/introduction_to_rosa/rosa-hcp-about-iam-resources`,
  ROSA_AWS_CLASSIC_IAM_OPERATOR_ROLES: `${ROSA_CLASSIC_DOCS_BASE}/introduction_to_rosa/rosa-sts-about-iam-resources#rosa-sts-operator-roles_rosa-sts-about-iam-resources`,
  ROSA_AWS_IAM_OPERATOR_ROLES: `${ROSA_DOCS_BASE}/introduction_to_rosa/rosa-hcp-about-iam-resources#rosa-sts-operator-roles_rosa-sts-about-iam-resources`,
  ROSA_HCP_EXT_AUTH: `${ROSA_CP_DOCS_BASE}/install_rosa_with_hcp_clusters/rosa-hcp-sts-creating-a-cluster-ext-auth`,
  ROSA_HCP_BREAK_GLASS: `${ROSA_CP_DOCS_BASE}/install_rosa_with_hcp_clusters/rosa-hcp-sts-creating-a-cluster-ext-auth#rosa-hcp-sts-accessing-a-break-glass-cred-cli_rosa-hcp-sts-creating-a-cluster-ext-auth`,

  AWS_CONSOLE_ROSA_HOME: 'https://console.aws.amazon.com/rosa/home',
  AWS_CONSOLE_ROSA_HOME_GET_STARTED: 'https://console.aws.amazon.com/rosa/home#/get-started',
  AWS_CONSOLE_HOSTED_ZONES: 'https://console.aws.amazon.com/route53/v2/hostedzones',
  AWS_CONSOLE_SECURITY_GROUPS: 'https://console.aws.amazon.com/ec2/home#SecurityGroups',
  AWS_CLI: 'https://aws.amazon.com/cli/',
  AWS_CLI_CONFIGURATION_INSTRUCTIONS:
    'https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html',
  AWS_CLI_INSTRUCTIONS:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-auto.html',
  AWS_CLI_GETTING_STARTED_MANUAL:
    'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html',
  AWS_ROSA_GET_STARTED: 'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started.html',
  AWS_FINDING_KEY_ARN: 'https://docs.aws.amazon.com/kms/latest/developerguide/find-cmk-id-arn.html',
  AWS_IMDS:
    'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-options.html',
  AWS_LOAD_BALANCER_FEATURES:
    'https://aws.amazon.com/elasticloadbalancing/features/#Product_comparisons',
  AWS_SHARED_VPC: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-sharing.html',
  AWS_CAPACITY_RESERVATION:
    'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/capacity-reservation-overview.html',

  GCP_CONSOLE_OSD_HOME:
    'https://console.cloud.google.com/marketplace/agreements/redhat-marketplace/red-hat-openshift-dedicated',

  OCM_DOCS_MANAGING_CLUSTERS: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-managing-clusters`,
  OCM_DOCS_PULL_SECRETS: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-managing-clusters#downloading_and_updating_pull_secrets`,
  OCM_DOCS_ROLES_AND_ACCESS: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-user-management-ocm`,
  OCM_DOCS_SUBSCRIPTIONS: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-cluster-subscriptions`,
  OCM_DOCS_UPGRADING_OSD_TRIAL: `${OCM_DOCS_BASE}/html/managing_clusters/assembly-cluster-subscriptions#upgrading-osd-trial-cluster_assembly-cluster-subscriptions`,

  COSTMGMT_ADDING_OCP: `${COSTMGMT_DOCS_BASE}/integrating_openshift_container_platform_data_into_cost_management/index`,

  FINDING_AWS_ACCOUNT_IDENTIFIERS:
    'https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-identifiers.html',
  CIDR_RANGE_DEFINITIONS_ROSA_CLASSIC: `${ROSA_CLASSIC_DOCS_BASE}/networking_overview/cidr-range-definitions`,
  CIDR_RANGE_DEFINITIONS_ROSA: `${ROSA_DOCS_BASE}/networking_overview/cidr-range-definitions`,
  CIDR_RANGE_DEFINITIONS_OSD: `${OSD_DOCS_BASE}/networking_overview/cidr-range-definitions`,
  CONFIGURE_PROXY_URL: `${OSD_DOCS_BASE}/networking_overview/index`,
  VIRTUAL_PRIVATE_CLOUD_URL: `${ROSA_DOCS_BASE}/install_clusters/rosa-hcp-quickstart-guide#rosa-hcp-quickstart-creating-vpc`,
  AWS_CONTROL_PLANE_URL: `${OCP_DOCS_BASE}/architecture/control-plane#control-plane`,

  ROSA_AWS_FEDRAMP: `${ROSA_DOCS_BASE}/getting_started_with_rosa_govcloud/index`,
  FEDRAMP_ACCESS_REQUEST_FORM: 'https://console.redhat.com/openshift/create/rosa/govcloud',
  TERRAFORM_ROSA_HCP_URL: `${ROSA_DOCS_BASE}/install_clusters/creating-a-rosa-cluster-using-terraform`,
  TERRAFORM_REGISTRY_ROSA_HCP:
    'https://registry.terraform.io/providers/terraform-redhat/rhcs/latest/docs/guides/hosted-control-planes',
  ROSA_HCP_CLI_URL: `${ROSA_DOCS_BASE}/install_clusters/rosa-hcp-sts-creating-a-cluster-quickly`,
  ROSA_CREATE_NETWORK: `https://access.redhat.com/articles/7096266`,
  CREATE_VPC_WAYS: `https://docs.aws.amazon.com/rosa/latest/userguide/getting-started-hcp.html#create-vpc-hcp`,
  LEARN_MORE_SSO:
    'https://docs.redhat.com/en/documentation/openshift_cluster_manager/1-latest/html-single/managing_clusters/index#con-ocm-with-rhsso_downloading-and-updating-pull-secrets',
  LEARN_MORE_SSO_ROSA: `${ROSA_DOCS_BASE}/cli_tools/rosa-cli#rosa-login-sso_rosa-getting-started-cli`,
  TRANSFER_CLUSTER_OWNERSHIP:
    'https://docs.redhat.com/en/documentation/openshift_cluster_manager/1-latest/html-single/managing_clusters/index#transferring-cluster-ownership_downloading-and-updating-pull-secrets',

  WINDOWS_LICENSE_INCLUDED_AWS_DOCS: 'https://aws.amazon.com/windows/resources/licensing/',
  WINDOWS_LICENSE_INCLUDED_REDHAT_DOCS: 'https://access.redhat.com/articles/7096903',
};

// Tool identifiers are public — e.g. for linking to specific tool in DownloadsPage.
// For consistency, they should be the CLI binary name, where possible.
// See also per-tool data in DownloadButton.jsx.
const tools = {
  OC: 'oc',
  BUTANE: 'butane',
  CCOCTL: 'ccoctl',
  COREOS_INSTALLER: 'coreos-installer',
  CRC: 'crc',
  HELM: 'helm',
  X86INSTALLER: 'x86_64-openshift-install',
  IBMZINSTALLER: 's390x-openshift-install',
  PPCINSTALLER: 'ppc64le-openshift-install',
  ARMINSTALLER: 'aarch64-openshift-install',
  MULTIINSTALLER: 'multi-openshift-install',
  KN: 'kn',
  OCM: 'ocm',
  ODO: 'odo',
  OPM: 'opm',
  OPERATOR_SDK: 'operator-sdk',
  RHCOS: 'rhcos',
  RHOAS: 'rhoas',
  ROSA: 'rosa',
  MIRROR_REGISTRY: 'mirror-registry',
  OC_MIRROR_PLUGIN: 'oc-mirror-plugin',
  TKN: 'tkn',
  COPY_PULLREQUEST: 'copy-pull-secret',
  ARGO_CD: 'argo-cd',
  SHP_CLI: 'shp-cli',
};

const channels = {
  PRE_RELEASE: 'preRelease',
  CANDIDATE: 'candidate',
  STABLE: 'stable',
};

const architectures = {
  arm: 'arm',
  x86: 'x86',
  ppc: 'ppc',
  s390x: 's390x',
};

const architectureOptions = [
  { value: architectures.x86, label: 'x86_64', path: 'x86_64' }, // aka amd64
  { value: architectures.arm, label: 'aarch64', path: 'aarch64' }, // aka arm64
  { value: architectures.ppc, label: 'ppc64le', path: 'ppc64le' }, // aka Power
  { value: architectures.s390x, label: 's390x', path: 's390x' }, // aka IBM Z
];

const operatingSystems = {
  linux: 'linux',
  rhel9: 'rhel-9',
  rhel9_fips: 'rhel-9-fips',
  rhel8: 'rhel-8',
  mac: 'mac',
  windows: 'windows',
};

const operatingSystemOptions = [
  { value: operatingSystems.linux, label: 'Linux' },
  { value: operatingSystems.rhel9, label: 'Linux - RHEL 9' },
  { value: operatingSystems.rhel9_fips, label: 'RHEL 9 (FIPS)' },
  { value: operatingSystems.rhel8, label: 'Linux - RHEL 8' },
  { value: operatingSystems.mac, label: 'MacOS' },
  { value: operatingSystems.windows, label: 'Windows' },
];

/**
 * Static subset of urls, see `urlsSelector` for complete data.
 * {tool: {channel: {arch: {os: url}}}}
 */
const urls = {
  [tools.OC]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.windows]: `${MIRROR_CLIENTS_STABLE_X86}openshift-client-windows.zip`,
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_X86}openshift-client-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_X86}openshift-client-linux-amd64-rhel8.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_X86}openshift-client-linux-amd64-rhel9.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_X86}openshift-client-mac.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-client-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-client-linux-s390x-rhel8.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-client-linux-s390x-rhel9.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-client-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-client-linux-ppc64le-rhel8.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-client-linux-ppc64le-rhel9.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-client-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-client-linux-arm64-rhel8.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-client-linux-arm64-rhel9.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-client-mac-arm64.tar.gz`,
      },
    },
    [channels.CANDIDATE]: {
      [architectures.x86]: {
        [operatingSystems.windows]: `${MIRROR_CLIENTS_CANDIDATE_X86}openshift-client-windows.zip`,
        [operatingSystems.linux]: `${MIRROR_CLIENTS_CANDIDATE_X86}openshift-client-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_CANDIDATE_X86}openshift-client-mac.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-client-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-client-mac-arm64.tar.gz`,
      },
    },
    [channels.PRE_RELEASE]: {
      [architectures.x86]: {
        [operatingSystems.windows]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-client-windows.zip`,
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-client-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-client-mac.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_IBMZ}openshift-client-linux.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_PPC}openshift-client-linux.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_ARM}openshift-client-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_ARM}openshift-client-mac-arm64.tar.gz`,
      },
    },
  },
  [tools.OCM]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${links.OCM_CLI_RELEASES_LATEST}/ocm_linux_amd64.zip`,
        [operatingSystems.mac]: `${links.OCM_CLI_RELEASES_LATEST}/ocm_darwin_amd64.zip`,
        [operatingSystems.windows]: `${links.OCM_CLI_RELEASES_LATEST}/ocm_windows_amd64.zip`,
      },
    },
  },

  [tools.BUTANE]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_BUTANE_LATEST}/butane-amd64`,
        [operatingSystems.mac]: `${MIRROR_BUTANE_LATEST}/butane-darwin-amd64`,
        [operatingSystems.windows]: `${MIRROR_BUTANE_LATEST}/butane-windows-amd64.exe`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_BUTANE_LATEST}/butane-s390x`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_BUTANE_LATEST}/butane-ppc64le`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_BUTANE_LATEST}/butane-aarch64`,
      },
    },
  },

  [tools.CCOCTL]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_X86}ccoctl-linux.tar.gz`,
        /*
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_X86}ccoctl-mac.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_CLIENTS_STABLE_X86}ccoctl-windows.tar.gz`,
        */
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_IBMZ}ccoctl-linux.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_PPC}ccoctl-linux.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_ARM}ccoctl-linux.tar.gz`,
        /*
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_ARM}ccoctl-mac.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_CLIENTS_STABLE_ARM}ccoctl-windows.tar.gz`,
        */
      },
    },
  },
  [tools.COREOS_INSTALLER]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_COREOS_INSTALLER_LATEST}/coreos-installer_amd64`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_COREOS_INSTALLER_LATEST}/coreos-installer_s390x`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_COREOS_INSTALLER_LATEST}/coreos-installer_ppc64le`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_COREOS_INSTALLER_LATEST}/coreos-installer_arm64`,
      },
    },
  },

  [tools.CRC]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.windows]: `${MIRROR_CRC_LATEST}/crc-windows-installer.zip`,
        [operatingSystems.mac]: `${MIRROR_CRC_LATEST}/crc-macos-installer.pkg`,
        [operatingSystems.linux]: `${MIRROR_CRC_LATEST}/crc-linux-amd64.tar.xz`,
      },
      [architectures.arm]: {
        [operatingSystems.mac]: `${MIRROR_CRC_LATEST}/crc-macos-installer.pkg`,
        [operatingSystems.linux]: `${MIRROR_CRC_LATEST}/crc-linux-arm64.tar.xz`,
      },
    },
  },

  [tools.HELM]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_HELM_LATEST}/helm-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_HELM_LATEST}/helm-darwin-amd64.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_HELM_LATEST}/helm-windows-amd64.exe.zip`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_HELM_LATEST}/helm-linux-s390x.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_HELM_LATEST}/helm-linux-ppc64le.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_HELM_LATEST}/helm-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_HELM_LATEST}/helm-darwin-arm64.tar.gz`,
      },
    },
  },

  [tools.X86INSTALLER]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_X86}openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_X86}openshift-install-mac.tar.gz`,
        [operatingSystems.rhel9_fips]: `${MIRROR_CLIENTS_STABLE_X86}openshift-install-rhel9-amd64.tar.gz`,
      },
      [architectures.arm]: {
        /* 4.13
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_X86}openshift-install-linux-arm64.tar.gz`,
        */
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_X86}openshift-install-mac-arm64.tar.gz`,
      },
    },
    [channels.CANDIDATE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_CANDIDATE_X86}openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_CANDIDATE_X86}openshift-install-mac.tar.gz`,
      },
      [architectures.arm]: {
        /* 4.13
        [operatingSystems.linux]: `${MIRROR_CLIENTS_CANDIDATE_X86}openshift-install-linux-arm64.tar.gz`,
        */
        [operatingSystems.mac]: `${MIRROR_CLIENTS_CANDIDATE_X86}openshift-install-mac-arm64.tar.gz`,
      },
    },
    [channels.PRE_RELEASE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-install-linux.tar.gz`,
        [operatingSystems.rhel9_fips]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-install-rhel9-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-install-mac.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-install-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_X86}openshift-install-mac-arm64.tar.gz`,
      },
    },
  },

  [tools.IBMZINSTALLER]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-install-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-install-mac.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-install-linux.tar.gz`,
        [operatingSystems.rhel9_fips]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-install-rhel9-s390x.tar.gz`,
      },
      [architectures.arm]: {
        /* 4.13
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-install-linux-arm64.tar.gz`,
        */
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_IBMZ}openshift-install-mac-arm64.tar.gz`,
      },
    },
    [channels.PRE_RELEASE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_IBMZ}openshift-install-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_IBMZ}openshift-install-mac.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_IBMZ}openshift-install-linux.tar.gz`,
        [operatingSystems.rhel9_fips]: `${MIRROR_CLIENTS_LATEST_PRE_IBMZ}openshift-install-rhel9-s390x.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_IBMZ}openshift-install-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_IBMZ}openshift-install-mac-arm64.tar.gz`,
      },
    },
  },
  [tools.PPCINSTALLER]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-install-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-install-mac.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-install-linux.tar.gz`,
        [operatingSystems.rhel9_fips]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-install-rhel9-ppc64le.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-install-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_PPC}openshift-install-mac-arm64.tar.gz`,
      },
    },
    [channels.PRE_RELEASE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_PPC}openshift-install-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_PPC}openshift-install-mac.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_PPC}openshift-install-linux.tar.gz`,
        [operatingSystems.rhel9_fips]: `${MIRROR_CLIENTS_LATEST_PRE_PPC}openshift-install-rhel9-ppc64le.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_PPC}openshift-install-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_PPC}openshift-install-mac-arm64.tar.gz`,
      },
    },
  },
  [tools.ARMINSTALLER]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-install-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-install-mac.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_ARM}openshift-install-mac-arm64.tar.gz`,
      },
    },
    [channels.PRE_RELEASE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_ARM}openshift-install-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_ARM}openshift-install-mac.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_ARM}openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_ARM}openshift-install-mac-arm64.tar.gz`,
      },
    },
  },
  [tools.MULTIINSTALLER]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_MULTI}amd64/openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_MULTI}amd64/openshift-install-mac.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_MULTI}arm64/openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_MULTI}arm64/openshift-install-mac-arm64.tar.gz`,
      },
      /*
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_TP_MULTI}ppc64le/openshift-install-linux.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_TP_MULTI}s390x/openshift-install-linux.tar.gz`,
      },
      */
    },
    [channels.PRE_RELEASE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_MULTI}amd64/openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_MULTI}amd64/openshift-install-mac.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_MULTI}arm64/openshift-install-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_LATEST_PRE_MULTI}arm64/openshift-install-mac-arm64.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_MULTI}ppc64le/openshift-install-linux.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_LATEST_PRE_MULTI}s390x/openshift-install-linux.tar.gz`,
      },
    },
  },

  [tools.KN]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_KN_LATEST}/kn-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_KN_LATEST}/kn-darwin-amd64.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_KN_LATEST}/kn-windows-amd64.zip`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_KN_LATEST}/kn-linux-s390x.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_KN_LATEST}/kn-linux-ppc64le.tar.gz`,
      },
    },
  },

  [tools.TKN]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_TKN_LATEST}/tkn-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_TKN_LATEST}/tkn-macos-amd64.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_TKN_LATEST}/tkn-windows-amd64.zip`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_TKN_LATEST}/tkn-linux-s390x.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_TKN_LATEST}/tkn-linux-ppc64le.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_TKN_LATEST}/tkn-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_TKN_LATEST}/tkn-macos-arm64.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_TKN_LATEST}/tkn-windows-arm64.zip`,
      },
    },
  },

  [tools.ODO]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_ODO_LATEST}/odo-linux-amd64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_ODO_LATEST}/odo-darwin-amd64.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_ODO_LATEST}/odo-windows-amd64.exe.zip`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_ODO_LATEST}/odo-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_ODO_LATEST}/odo-darwin-arm64.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_ODO_LATEST}/odo-linux-s390x.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_ODO_LATEST}/odo-linux-ppc64le.tar.gz`,
      },
    },
  },

  [tools.ROSA]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_ROSA_LATEST}/rosa-linux.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_ROSA_LATEST}/rosa-macosx.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_ROSA_LATEST}/rosa-windows.zip`,
      },
    },
  },

  [tools.OPM]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_X86}opm-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_X86}opm-linux.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_X86}opm-linux-rhel9.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_CLIENTS_STABLE_X86}opm-mac.tar.gz`,
        [operatingSystems.windows]: `${MIRROR_CLIENTS_STABLE_X86}opm-windows.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_IBMZ}opm-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_IBMZ}opm-linux.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_IBMZ}opm-linux-rhel9.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_PPC}opm-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_PPC}opm-linux.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_PPC}opm-linux-rhel9.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_CLIENTS_STABLE_ARM}opm-linux.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_STABLE_ARM}opm-linux.tar.gz`,
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_STABLE_ARM}opm-linux-rhel9.tar.gz`,
      },
    },
  },

  [tools.OPERATOR_SDK]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_OSDK_LATEST_X86}/operator-sdk-linux-x86_64.tar.gz`,
        [operatingSystems.mac]: `${MIRROR_OSDK_LATEST_X86}/operator-sdk-darwin-x86_64.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${MIRROR_OSDK_LATEST_ARM}/operator-sdk-linux-aarch64.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_OSDK_LATEST_IBMZ}/operator-sdk-linux-s390x.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_OSDK_LATEST_PPC}/operator-sdk-linux-ppc64le.tar.gz`,
      },
    },
  },

  [tools.MIRROR_REGISTRY]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${MIRROR_MIRROR_REGISTRY_LATEST}/mirror-registry-amd64.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${MIRROR_MIRROR_REGISTRY_LATEST}/mirror-registry-ppc64le.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${MIRROR_MIRROR_REGISTRY_LATEST}/mirror-registry-s390x.tar.gz`,
      },
    },
  },
  [tools.OC_MIRROR_PLUGIN]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_LATEST_X86}oc-mirror.rhel9.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_LATEST_X86}oc-mirror.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_LATEST_ARM}oc-mirror.rhel9.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_LATEST_ARM}oc-mirror.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_LATEST_IBMZ}oc-mirror.rhel9.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_LATEST_IBMZ}oc-mirror.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.rhel9]: `${MIRROR_CLIENTS_LATEST_PPC}oc-mirror.rhel9.tar.gz`,
        [operatingSystems.rhel8]: `${MIRROR_CLIENTS_LATEST_PPC}oc-mirror.tar.gz`,
      },
    },
  },

  [tools.ARGO_CD]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${ARGO_CD_CLI_LATEST}argocd-linux-amd64.tar.gz`,
        [operatingSystems.windows]: `${ARGO_CD_CLI_LATEST}argocd-windows-amd64.zip`,
        [operatingSystems.mac]: `${ARGO_CD_CLI_LATEST}argocd-macos-amd64.tar.gz`,
      },
      [architectures.s390x]: {
        [operatingSystems.linux]: `${ARGO_CD_CLI_LATEST}argocd-linux-s390x.tar.gz`,
      },
      [architectures.ppc]: {
        [operatingSystems.linux]: `${ARGO_CD_CLI_LATEST}argocd-linux-ppc64le.tar.gz`,
      },
      [architectures.arm]: {
        [operatingSystems.linux]: `${ARGO_CD_CLI_LATEST}argocd-linux-arm64.tar.gz`,
        [operatingSystems.mac]: `${ARGO_CD_CLI_LATEST}argocd-macos-arm64.tar.gz`,
      },
    },
  },

  [tools.SHP_CLI]: {
    [channels.STABLE]: {
      [architectures.x86]: {
        [operatingSystems.linux]: `${SHP_CLI_LATEST}shp-linux-amd64.tar.gz`,
        [operatingSystems.windows]: `${SHP_CLI_LATEST}shp-windows-amd64.zip`,
        [operatingSystems.mac]: `${SHP_CLI_LATEST}shp-darwin-amd64.tar.gz`,
      },
    },
  },
};

const githubReleasesToFetch = ['redhat-developer/app-services-cli'];

/**
 * Computes full urls data.
 * @param state.githubReleases.
 * @return {tool: {
 *   channel: {
 *     arch: {os: url}},
 *     fallbackNavigateURL: '...' // Optional, used when arch/os data missing. Open in new tab.
 *   },
 * }
 */
const urlsSelector = (githubReleases) => {
  const result = {
    ...urls,
    [tools.RHOAS]: {
      [channels.STABLE]: {
        fallbackNavigateURL: links.RHOAS_CLI_RELEASES_LATEST,
      },
    },
  };

  const rhoasRelease = githubReleases['redhat-developer/app-services-cli'];
  if (rhoasRelease?.fulfilled) {
    const tag = rhoasRelease.data.tag_name; // v0.25.0
    const version = tag.replace(/^v/, ''); // 0.25.0
    const base = `https://github.com/redhat-developer/app-services-cli/releases/download/${tag}`;
    result[tools.RHOAS] = {
      [channels.STABLE]: {
        [architectures.x86]: {
          [operatingSystems.linux]: `${base}/rhoas_${version}_linux_amd64.tar.gz`,
          [operatingSystems.mac]: `${base}/rhoas_${version}_macOS_amd64.tar.gz`,
          [operatingSystems.windows]: `${base}/rhoas_${version}_windows_amd64.zip`,
        },
        [architectures.arm]: {
          [operatingSystems.linux]: `${base}/rhoas_${version}_linux_arm64.tar.gz`,
          [operatingSystems.mac]: `${base}/rhoas_${version}_macOS_arm64.tar.gz`,
        },
      },
    };
  }

  return result;
};

/** Returns all installation and binary external links. */
const getLinks = async () => {
  const linkUrls = Object.values(links);
  // nestedUrls: 4-level structure (Tool → Channel → Architecture → OS → URL) for download binaries
  const nestedUrls = Object.values(urls)
    .map((level1) =>
      Object.values(level1).map((level2) =>
        Object.values(level2).map((level3) => Object.values(level3)),
      ),
    )
    .flat(3);

  return combineAndSortLinks(linkUrls, nestedUrls);
};

export {
  architectures,
  architectureOptions,
  channels,
  operatingSystems,
  operatingSystemOptions,
  tools,
  urls,
  githubReleasesToFetch,
  urlsSelector,
  getLinks,
};
export default links;
