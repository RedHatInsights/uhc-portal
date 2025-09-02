import AdvancedClusterManagementLogo from '~/styles/images/ACMLogo.svg';
import AdvancedClusterSecurityForKubernetesLogo from '~/styles/images/AdvancedClusterSecurityForKubernetesLogo.svg';
import RedHatOpenShiftAILogo from '~/styles/images/RedHatOpenShiftAILogo.svg';
import RedHatOpenShiftGitOpsLogo from '~/styles/images/RedHatOpenShiftGitOpsLogo.svg';
import RedHatOpenShiftPipelinesLogo from '~/styles/images/RedHatOpenShiftPipelinesLogo.svg';
import RedHatOpenShiftServiceMeshLogo from '~/styles/images/RedHatOpenShiftServiceMeshLogo.svg';
import RedHatOpenShiftVirtualization from '~/styles/images/RedHatOpenShiftVirtualizationLogo.svg';

const PRODUCT_CARD_LOGOS = {
  gitops: {
    title: 'Red Hat OpenShift GitOps',
    logo: RedHatOpenShiftGitOpsLogo,
  },
  pipelines: {
    title: 'Red Hat OpenShift Pipelines',
    logo: RedHatOpenShiftPipelinesLogo,
  },
  serviceMesh: {
    title: 'Red Hat OpenShift Service Mesh',
    logo: RedHatOpenShiftServiceMeshLogo,
  },
  advancedClusterSecurity: {
    title: 'Advanced Cluster Security for Kubernetes',
    logo: AdvancedClusterSecurityForKubernetesLogo,
  },
  openshiftAi: {
    title: 'Red Hat OpenShift AI',
    logo: RedHatOpenShiftAILogo,
  },
  openshiftVirtualization: {
    title: 'OpenShift Virtualization',
    logo: RedHatOpenShiftVirtualization,
  },
  advancedClusterManagement: {
    title: 'Red Hat Advanced Cluster Management for Kubernetes',
    logo: AdvancedClusterManagementLogo,
  },
};

export default PRODUCT_CARD_LOGOS;
