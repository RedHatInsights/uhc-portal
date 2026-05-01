# OCMUI Cursor AI Token Setup (Windows PowerShell)
#
# This script helps you set up environment variables for Cursor AI integration.
#
# WHERE TO GET TOKENS:
# - GitHub: https://github.com/settings/tokens (or use `gh auth login`)
# - Jira Cloud (Atlassian): https://id.atlassian.com/manage-profile/security/api-tokens
#
# INSTRUCTIONS:
# 1. Copy this file somewhere OUTSIDE the repo (e.g., C:\Users\YOU\ocmui-tokens.ps1)
# 2. Fill in your actual token values below
# 3. Run this script once to set persistent user environment variables
# 4. Restart your terminal/Cursor IDE
#
# WARNING: Never commit this file with real tokens!

# ============================================================
# FILL IN YOUR VALUES BELOW
# ============================================================

$tokens = @{
    # Your Red Hat email
    JIRA_EMAIL = "<your-email>@redhat.com"
    
    # GitHub token (optional if you use `gh auth login` - the CLI stores creds in keyring)
    # Only needed for raw curl API calls. Get at: https://github.com/settings/tokens
    GITHUB_TOKEN = "<your-github-token>"
    
    # Jira API token (Atlassian Cloud)
    # Get one at: https://id.atlassian.com/manage-profile/security/api-tokens
    JIRA_TOKEN = "<your-jira-token>"
}

# ============================================================
# SET ENVIRONMENT VARIABLES
# ============================================================

Write-Host "OCMUI Token Setup - Windows" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

foreach ($key in $tokens.Keys) {
    $value = $tokens[$key]
    
    if ($value -like "<*") {
        Write-Host "  SKIP $key : Still a placeholder" -ForegroundColor Yellow
    } else {
        [Environment]::SetEnvironmentVariable($key, $value, [EnvironmentVariableTarget]::User)
        Write-Host "  SET  $key : ($($value.Length) chars)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Environment variables have been set for your user account." -ForegroundColor Cyan
Write-Host "Please restart your terminal and Cursor IDE for changes to take effect." -ForegroundColor Cyan
Write-Host ""

# Verification
Write-Host "Verification (current session):" -ForegroundColor Cyan
foreach ($key in $tokens.Keys) {
    $current = [Environment]::GetEnvironmentVariable($key, [EnvironmentVariableTarget]::User)
    if ($current) {
        Write-Host "  OK   $key" -ForegroundColor Green
    } else {
        Write-Host "  MISS $key" -ForegroundColor Red
    }
}
