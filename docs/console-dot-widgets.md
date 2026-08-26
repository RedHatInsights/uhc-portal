# Hybrid Cloud Console home-page widgets

`OpenShiftWidget` and `OpenShiftAiWidget` are the "Red Hat OpenShift" and "Red Hat OpenShift AI" tiles on the HCC home-page widget grid (`console.redhat.com/`). Chrome loads them at runtime via Module Federation. The OCM UI app does not import them.

## What we own

**Body content only** — description text plus a link. Title, icon, kebab menu, and drag handle come from `widgetRegistry` metadata in `deploy/frontend.yaml`, rendered by the dashboard. Do not wrap in a PatternFly `Card`.

| Tile | Link |
|---|---|
| OpenShift | `/openshift` (same-tab) |
| OpenShift AI | external trial page (new tab) |

Use PatternFly `Button` with `component="a"`, not `~/common/routing/Link` (tiles run outside our app). Default exports are required for Module Federation.

## Module Federation

Expose keys in `fec.config.js`:

- `./OpenShiftWidget` -> `src/components/Widgets/openshift-widget.tsx`
- `./OpenShiftAiWidget` -> `src/components/Widgets/openshift-ai-widget.tsx`

`widgetRegistry` `scope` determines which app's bundle Chrome loads. Today it is `landing` (landing-page-frontend). Switching to `openshift` requires coordination with Chrome / landing-page team and should be a separate PR.

## Preview

Only exercised by Storybook and unit tests in this repo.

```bash
npm run storybook
```

Stories wrap each widget in a stand-in card to show the chrome vs body split. Production chrome comes from widget-layout, not our decorator.

## Source

Copied from [landing-page-frontend](https://github.com/RedHatInsights/landing-page-frontend/tree/master/src/components/widgets) in [uhc-portal#436](https://github.com/RedHatInsights/uhc-portal/pull/436). Platform epic: [RHCLOUD-40474](https://redhat.atlassian.net/browse/RHCLOUD-40474).
