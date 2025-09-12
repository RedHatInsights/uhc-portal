<!--
Documentation for Storybook stories
This file provides technical analysis of alert lifecycles for the Overview component stories
The Overview stories use this documentation to understand when alerts appear/disappear during cluster states
Used by: Overview.stories.tsx for modeling realistic alert behavior across cluster lifecycle phases
-->

# Alert Lifecycle Analysis

This document analyzes when different alerts appear in the cluster lifecycle.

## Installation-Only Alerts (cluster.state !== ready)

These alerts **only** appear during cluster installation and are hidden once the cluster reaches `ready` state:

### 1. GCP Organization Policy Service Alert
- **Component**: `GcpOrgPolicyAlert`
- **Condition**: `gcpOrgPolicyWarning && !isDeprovisioned && cluster.state !== ready && cluster.state !== uninstalling`
- **Code Location**: `ClusterDetailsTop.jsx:261-265`
- **Message**: "Your installation might be affected by the GCP Organization Policy Service"

### 2. ClusterStatusMonitor Alerts
- **Component**: `ClusterStatusMonitor`
- **Condition**: `shouldShowStatusMonitor` (includes installing, pending, validating, waiting, error, uninstalling states)
- **Alerts Include**:
  - "User action required" (network validation failed)
  - "Installation is taking longer than expected"
  - "Permissions needed" (GCP roles)
  - "Cluster installation failed"

### 3. "Your cluster is being created" Message
- **Component**: `RecommendedOperatorsAlert`
- **Condition**: Shows different message based on `clusterState` prop
- **Message**: Changes from "Your cluster is being created" to standard operators message

## Ready-Only Alerts (cluster.state === ready)

These alerts **only** appear when the cluster is operational:

### 1. Create Identity Provider Alert
- **Component**: `IdentityProvidersHint`
- **Condition**: `cluster.managed && cluster.idpActions?.create && cluster.state === ready && !hasIdentityProviders`
- **Code Location**: `ClusterDetailsTop.jsx:151-157`
- **Message**: "Create an identity provider to access cluster"

## General Alerts (Any Stage)

These alerts can appear at **any stage** of the cluster lifecycle based on cluster properties, not state:

### 1. Terms & Conditions Alert
- **Component**: `TermsAlert`
- **Condition**: Based on subscription type (OSD/ROSA/RHMI) and terms review status
- **Message**: "You must accept the Terms and Conditions"

### 2. Cluster Expiration Alerts
- **Component**: `ExpirationAlert`
- **Condition**: Based on `cluster.expiration_timestamp`, not cluster state
- **Messages**: 
  - "This cluster will be deleted in X hours/days"
  - "Cluster failed to delete" (if past expiration)

### 3. Limited Support Alert
- **Component**: `LimitedSupportAlert`
- **Condition**: Based on `cluster.limitedSupportReasons`, not cluster state
- **Message**: "This cluster has limited support due to multiple reasons"

### 4. Subscription Compliancy Alerts
- **Component**: `SubscriptionCompliancy`
- **Condition**: Based on subscription support level, not cluster state
- **Messages**:
  - "Your 60-day OpenShift evaluation has expired" (support_level === None)
  - "OpenShift evaluation expiration date" (support_level === Eval)

### 5. Recommended Operators Alert
- **Component**: `RecommendedOperatorsAlert`
- **Condition**: Not dismissed in localStorage and cluster not archived/deprovisioned
- **Message**: "Optimize your cluster with operators" (content varies by cluster state)

### 6. Cluster Non-Editable Alert
- **Component**: `ClusterNonEditableAlert`
- **Condition**: `!cluster.canEdit && isAvailableAssistedInstallCluster(cluster)`
- **Message**: "You cannot edit the cluster"

### 7. Transfer Cluster Ownership Alert
- **Component**: `TransferClusterOwnershipInfo`
- **Condition**: Based on subscription.released status for OCP/ARO clusters
- **Message**: "Cluster ownership transfer initiated"

## Story Organization

### InstallingAlerts Story
- Shows **ONLY the 3 installation-specific** alerts
- Uses `cluster.state = installing`
- Excludes all general alerts to clearly demonstrate installation-only behavior

### ReadyAlerts Story  
- Shows **the 1 ready-specific** alert + **all general alerts**
- Uses `cluster.state = ready`
- Demonstrates that most alerts can appear at any lifecycle stage
- Excludes GCP Org Policy Alert (installation-only)

### Key Insight
Most alerts (Terms & Conditions, Expiration, Limited Support, Subscription Compliancy) are **general alerts** that can appear at any cluster lifecycle stage. Only 4 alerts total are truly stage-specific:
- **3 Installation-only alerts**
- **1 Ready-only alert**
- **10+ General alerts** (can appear anytime)