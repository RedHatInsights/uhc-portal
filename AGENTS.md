# OCM UI (uhc-portal)

UI for OpenShift Cluster Manager — a React/TypeScript single-page application running on console.redhat.com under the `/openshift` route. Built on PatternFly (design system and component library), React Query (server state). Jest handles unit testing and  Playwright handles E2E against staging.

Some parts of the application are legacy code, using JavaScript and Redux for global state management and data fetching.

## Documents index

All documents are located inside `/docs`. **Read the relevant file BEFORE writing or reviewing code.**

```text
root: docs/

UI-components:              code-guide.md
contributing:               contributing.md
unit-testing:               unit-testing.md
e2e-testing:                Playwright-e2e-test-automation-guidelines.md
e2e-testing FAQ:            Playwright-e2e-test-automation-faq.md
```

For information about the generation of TS models from OpenAPI specs, check the `/openapi/README.md` doc.

## Project structure

```text
src/
  bootstrap.ts          # App entry point
  chrome-main.tsx       # Module federation root
  common/               # Shared utilities, UI components, and link definitions (docLinks, supportLinks, installLinks)
  components/           # Feature components organized by domain
  config/               # Environment and app configuration
  hoc/                  # Higher-order components
  hooks/                # Shared custom hooks
  queries/              # TanStack Query hooks organized by feature/domain
  redux/                # Legacy Redux store, reducers, actions
  services/             # API request layer and service functions
  styles/               # Global styles
  types/                # OpenAPI-generated TypeScript types
```

Other relevant top-level directories:

```text
docs/           # Project documentation and coding guidelines
openapi/        # OpenAPI specs and type generation
playwright/     # Playwright E2E tests
cypress/        # Cypress E2E tests (legacy)
.storybook/     # Storybook configuration
mockdata/       # Mock API data for local development
__mocks__/      # Jest module mocks
```

## AI Skills

Procedural skills live in `docs/ai/skills/`. Each skill is a `SKILL.md` that defines a multi-step workflow an AI agent can follow.

**Available skills:**

| Skill | Trigger phrases |
| :--- | :--- |
| `code-review` | "review PR", "code review", "check this PR" |

**Using skills:** When the user mentions a trigger phrase, read the corresponding `docs/ai/skills/<name>/SKILL.md` and follow its instructions.

**Auto-detection (Cursor):** Cursor auto-detects skills from `~/.cursor/skills/`. Developers who want auto-detection can symlink:

```bash
ln -sf /path/to/uhc-portal/docs/ai/skills/code-review ~/.cursor/skills/code-review
```

## Templates

Reusable document templates live in `docs/ai/templates/`:

```text
docs/ai/templates/
  ddr-template.md                    # DDR (Design Decision Record) for feature refinement
  jira/
    epic-description.md              # Jira epic description structure
    story-description.md             # Implementation story format
    task-description.md              # Technical task format
    bug-description.md               # Bug ticket format
```

Skills reference these templates via relative paths. Read the relevant template before creating or updating Jira issues.

## MCP Integrations (optional per developer)

Model Context Protocol servers extend AI agents with access to external services. These are configured per-developer in `~/.cursor/mcp.json`.

### Jira MCP (`mcp-atlassian`)

Provides full CRUD access to Jira Cloud (`redhat.atlassian.net`). Useful for fetching tickets, creating stories, and updating epics from AI workflows.

**Setup:**

1. Install `uv` (provides `uvx`): `brew install uv`
2. Generate a Jira API token at: https://id.atlassian.com/manage-profile/security/api-tokens
3. Create a wrapper script (e.g., `~/.local/share/mcp-atlassian/run-mcp-atlassian.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Source your credentials (however you manage secrets locally)
export JIRA_URL="https://redhat.atlassian.net"
export JIRA_USERNAME="you@redhat.com"
export JIRA_API_TOKEN="<your-token>"

exec uvx mcp-atlassian
```

4. Register in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mcp-atlassian": {
      "command": "/Users/you/.local/share/mcp-atlassian/run-mcp-atlassian.sh",
      "args": []
    }
  }
}
```

5. Verify: restart Cursor, open a new chat, and ask "Fetch Jira ticket OCMUI-4891"

### Slack MCP (`redhat-community-ai-tools/slack-mcp`)

Search messages, post comments, and browse channels in Red Hat Slack. Uses session tokens (no admin approval required).

**Setup:**

1. Run the setup script: `python3 <(curl -fsSL https://raw.githubusercontent.com/redhat-community-ai-tools/slack-mcp/main/scripts/setup-slack-mcp.py)`
2. Follow the prompts to log in and extract session tokens
3. Register in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "slack-mcp": {
      "command": "/path/to/run-slack-mcp.sh",
      "args": []
    }
  }
}
```

Requires `podman` installed locally.

### PatternFly MCP

Built-in Cursor plugin (`plugin-pf-mcp-patternfly`). Provides `searchPatternFlyDocs` and `usePatternFlyDocs` for searching PatternFly component documentation. No setup required — enabled by default.

## PR and Commit Conventions

When opening a pull request, follow the PR template in [`.github/pull_request_template.md`](.github/pull_request_template.md).

## PR Reviews

When reviewing a pull request, follow the process in [`docs/pull-request-process.md`](docs/pull-request-process.md) and verify the code adheres to [`docs/code-guide.md`](docs/code-guide.md) and [`docs/unit-testing.md`](docs/unit-testing.md).

