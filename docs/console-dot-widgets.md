# Hybrid Cloud Console home-page widgets

`OpenShiftWidget` and `OpenShiftAiWidget` are the "Red Hat OpenShift" and "Red Hat OpenShift AI" tiles on the HCC home-page widget grid (`console.redhat.com/`). Chrome loads them at runtime via Module Federation. The OCM UI app does not import them.

## What we own

**Body content only** — description text plus a link. Title, icon, kebab menu, and drag handle come from `widgetRegistry` metadata in `deploy/frontend.yaml`, rendered by the dashboard. Do not wrap in a PatternFly `Card`.

Both tiles share a `SimpleServiceWidget` base component that handles layout and link rendering. Use PatternFly `Stack`/`StackItem` for layout. Use PatternFly `Button` with `component="a"` for links, not `~/common/routing/Link` (tiles run outside our app). External links must include screen-reader text (`(opens new tab)`) and `rel="noopener noreferrer"`.

| Tile | Link |
|---|---|
| OpenShift | `/openshift` (same-tab) |
| OpenShift AI | `https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai/trial` (new tab) |

Default exports are required for Module Federation.

## Module Federation

Expose keys in `fec.config.js`:

- `./OpenShiftWidget` -> `src/components/Widgets/openshift-widget.tsx`
- `./OpenShiftAiWidget` -> `src/components/Widgets/openshift-ai-widget.tsx`

`widgetRegistry` `scope` determines which app's bundle Chrome loads. Today it is `landing` (landing-page-frontend). Switching to `openshift` requires coordination with Chrome / landing-page team and should be a separate PR. Note: OpenShift is gated by feature flag `widget.openshift.enable`; OpenShift AI has no flag.

## Preview

Only exercised by Storybook and unit tests in this repo.

```bash
npm run storybook
npx jest --testPathPatterns="src/components/Widgets"
```

Stories wrap each widget in a stand-in card to show the chrome vs body split. Production chrome comes from widget-layout, not our decorator.

## Source

Copied from [landing-page-frontend](https://github.com/RedHatInsights/landing-page-frontend/tree/master/src/components/widgets) in [uhc-portal#436](https://github.com/RedHatInsights/uhc-portal/pull/436). Platform epic: [RHCLOUD-40474](https://redhat.atlassian.net/browse/RHCLOUD-40474).
