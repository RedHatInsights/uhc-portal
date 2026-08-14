/**
 * Legacy OCM ↔ HCC severity pairs for Cluster Logs during the ROSA-725 transition.
 * Filtering either label should include rows stored under its equivalent.
 * Object.create(null) avoids inherited Object.prototype keys (e.g. toString).
 */
const SEVERITY_EQUIVALENTS: Record<string, string> = Object.assign(Object.create(null), {
  Info: 'Low',
  Low: 'Info',
  Warning: 'Moderate',
  Moderate: 'Warning',
  Major: 'Important',
  Important: 'Major',
});

/** Expands selected severities to include legacy/HCC equivalents. */
const expandSeverityTypesForFilter = (severityTypes: string[]): string[] => {
  const expanded = new Set<string>();
  severityTypes.forEach((severity) => {
    expanded.add(severity);
    if (Object.prototype.hasOwnProperty.call(SEVERITY_EQUIVALENTS, severity)) {
      expanded.add(SEVERITY_EQUIVALENTS[severity]);
    }
  });
  return Array.from(expanded);
};

export { expandSeverityTypesForFilter };
