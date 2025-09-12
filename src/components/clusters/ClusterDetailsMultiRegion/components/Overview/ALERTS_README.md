<!--
Documentation for Storybook stories
This file provides comprehensive alert documentation for the Overview component stories
The Overview stories reference this documentation to understand complex alert behavior and conditions
Used by: Overview.stories.tsx for alert state scenarios and component documentation
-->

# Cluster Details Alerts Documentation

This document describes all the alerts that can appear on the Cluster Details Overview page and their trigger conditions.

## Alert Types and Triggers

### Info Alerts (Blue)
- **Create Identity Provider**: No identity providers configured
- **Recommended Operators**: No operators installed (can be dismissed)
- **Cluster Non-Editable**: User lacks edit permissions on the cluster
- **Expiration Alert (>2 days)**: Cluster scheduled for deletion in more than 2 days

### Warning Alerts (Orange)
- **Terms and Conditions**: Terms review required for OSD/ROSA/RHMI clusters
- **Should Have Been Deleted**: Cluster past expiration date but still running
- **GCP Org Policy Alert**: GCP Organization Policy Service issues
- **OpenShift Evaluation**: Evaluation period nearing expiration
- **Installation Taking Long Time**: Installation errors without failure state
- **User Action Required**: Network validation issues (ROSA/BYO VPC)
- **Permissions Needed**: GCP shared VPC permission issues
- **Expiration Alert (1-2 days)**: Cluster scheduled for deletion in 1-2 days

### Danger Alerts (Red)
- **Limited Support**: Cluster has legitimate limited support reasons
- **Subscription Compliancy**: 60-day OpenShift evaluation expired
- **Cluster Status Monitor**: Cluster installation failed (error state)
- **Expiration Alert (<1 day)**: Cluster scheduled for deletion in less than 24 hours

## Alert Locations in Code

### ClusterDetailsTop Component
- **IdentityProvidersHint**: `showIDPMessage` condition
- **ExpirationAlert**: Multiple instances for different expiration types
- **GcpOrgPolicyAlert**: `showGcpOrgPolicyWarning` condition
- **SubscriptionCompliancy**: OCP clusters with eval/none support level
- **ClusterNonEditableAlert**: `!cluster.canEdit && isAvailableAssistedInstallCluster`
- **TermsAlert**: OSD/ROSA/RHMI clusters requiring terms review
- **RecommendedOperatorsAlert**: Dismissible alert for operator recommendations
- **LimitedSupportAlert**: Clusters with `limited_support_reason_count > 0`

### ClusterStatusMonitor Component
- **Installation Failed**: `clusterStatus.state === error`
- **Installation Taking Long**: Provision errors without error state
- **User Action Required**: Network validation failures
- **Permissions Needed**: GCP shared VPC role requirements

### Overview Component
- **Install Success Alert**: State transition from installing to ready
- **Inflight Error Fixed**: Inflight errors resolved

## Story Examples

### AlertOverload
Shows maximum alerts simultaneously:
- Terms & Conditions (OSD cluster)
- Expiration (12 hours - danger level)
- Limited Support (2 reasons)
- Subscription Compliancy (expired eval)
- Cluster Non-Editable
- Identity Providers
- Recommended Operators
- GCP Org Policy

### ROSAClassicAlerts
ROSA-specific installation alerts:
- Network validation issues
- AWS permission problems
- Installation progress

### InstallingClusterAlerts
Installation phase alerts:
- Trial expiration warning
- Recommended operators during install
- Progress indicators

### ErrorStateAlerts
Error state scenarios:
- Installation failure
- Subscription compliancy
- Critical error messaging

### ExpirationAlerts
Time-based expiration warnings:
- Trial cluster expiration
- Marketplace subscription expiration
- Different urgency levels based on time remaining

### HibernatingClusterAlerts
Hibernated cluster limitations:
- Limited functionality warnings
- Recommended operators for hibernated state

## Testing Alert Overload

The `AlertOverload` story demonstrates the worst-case scenario where multiple alerts appear simultaneously. This helps evaluate:
- Visual hierarchy and readability
- Color coding effectiveness
- Information density and user experience
- Alert prioritization and grouping

## Mock Data Requirements

Each alert type requires specific mock data:
- **Redux State**: User profile, modal state, feature gates
- **Cluster Properties**: State, subscription, timestamps, permissions
- **External Data**: Cloud providers, insights data, terms review status
- **Feature Gates**: Various feature toggles affecting alert display