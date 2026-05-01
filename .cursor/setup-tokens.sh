#!/bin/bash
# OCMUI Cursor AI Token Setup
# 
# This script helps you set up environment variables for Cursor AI integration.
# It works on macOS and Linux. For Windows, see setup-tokens.ps1.
#
# WHERE TO GET TOKENS:
# - GitHub: https://github.com/settings/tokens (or use `gh auth login`)
# - Jira Cloud (Atlassian): https://id.atlassian.com/manage-profile/security/api-tokens
#
# INSTRUCTIONS:
# 1. Copy this file somewhere OUTSIDE the repo (e.g., ~/ocmui-tokens.sh)
# 2. Fill in your actual token values below
# 3. Add "source ~/ocmui-tokens.sh" to your ~/.bashrc or ~/.zshrc
# 4. Restart your terminal or run: source ~/.bashrc
#
# WARNING: Never commit this file with real tokens!

# ============================================================
# FILL IN YOUR VALUES BELOW
# ============================================================

# Your Red Hat email
export JIRA_EMAIL="<your-email>@redhat.com"

# GitHub token (optional if you use `gh auth login` - the CLI stores creds in keyring)
# Only needed for raw curl API calls. Get at: https://github.com/settings/tokens
export GITHUB_TOKEN="<your-github-token>"

# Jira API token (Atlassian Cloud)
# Get one at: https://id.atlassian.com/manage-profile/security/api-tokens
export JIRA_TOKEN="<your-jira-token>"

# ============================================================
# VERIFICATION (run this script to test)
# ============================================================
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "OCMUI Token Setup - Verification"
    echo "================================="
    echo ""
    echo "Checking environment variables..."
    echo ""
    
    check_var() {
        local var_name=$1
        local var_value="${!var_name}"
        if [[ -z "$var_value" || "$var_value" == "<"* ]]; then
            echo "  ❌ $var_name: NOT SET (or still placeholder)"
        else
            echo "  ✅ $var_name: Set (${#var_value} chars)"
        fi
    }
    
    check_var "JIRA_EMAIL"
    check_var "GITHUB_TOKEN"
    check_var "JIRA_TOKEN"
    
    echo ""
    echo "To use these tokens, add this to your ~/.bashrc or ~/.zshrc:"
    echo "  source /path/to/your/ocmui-tokens.sh"
    echo ""
fi
