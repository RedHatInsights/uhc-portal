// First element is the versions array (ProductLifeCycle['versions']),
// matching the return type of useOCPLifeCycleStatusData().
export const mockOCPLifeCycleStatusData = [
  [
    {
      name: '5.0',
      type: 'Full Support',
      last_minor_release: null,
      final_minor_release: null,
      extra_header_value: null,
      phases: [
        {
          name: 'General availability',
          date: '2026-09-01T00:00:00.000Z',
          date_format: 'date',
        },
        {
          name: 'Extended update support',
          date: '2028-03-01T00:00:00.000Z',
          date_format: 'date',
        },
      ],
      extra_dependences: [],
    },
    {
      name: '4.20',
      type: 'Full Support',
      last_minor_release: null,
      final_minor_release: null,
      extra_header_value: null,
      phases: [
        {
          name: 'General availability',
          date: '2025-01-17T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Full support', date: 'Release of 4.13 + 3 months', date_format: 'string' },
        {
          name: 'Maintenance support',
          date: '2024-07-17T00:00:00.000Z',
          date_format: 'date',
        },
        {
          name: 'Extended update support',
          date: '2026-01-17T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Extended life phase', date: '', date_format: 'string' },
      ],
      extra_dependences: [],
    },
    {
      name: '4.12',
      type: 'Full Support',
      last_minor_release: null,
      final_minor_release: null,
      extra_header_value: null,
      phases: [
        {
          name: 'General availability',
          date: '2023-01-17T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Full support', date: 'Release of 4.13 + 3 months', date_format: 'string' },
        {
          name: 'Maintenance support',
          date: '2024-07-17T00:00:00.000Z',
          date_format: 'date',
        },
        {
          name: 'Extended update support',
          date: '2025-01-17T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Extended life phase', date: '', date_format: 'string' },
      ],
      extra_dependences: [],
    },
    {
      name: '4.11',
      type: 'Maintenance Support',
      last_minor_release: null,
      final_minor_release: null,
      extra_header_value: null,
      phases: [
        {
          name: 'General availability',
          date: '2022-08-10T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Full support', date: '2023-04-17T00:00:00.000Z', date_format: 'date' },
        {
          name: 'Maintenance support',
          date: '2024-02-10T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Extended update support', date: 'N/A', date_format: 'string' },
        { name: 'Extended life phase', date: 'N/A', date_format: 'string' },
      ],
      extra_dependences: [],
    },
    {
      name: '4.10',
      type: 'Maintenance Support',
      last_minor_release: null,
      final_minor_release: null,
      extra_header_value: null,
      phases: [
        {
          name: 'General availability',
          date: '2022-03-10T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Full support', date: '2022-11-10T00:00:00.000Z', date_format: 'date' },
        {
          name: 'Maintenance support',
          date: '2023-09-10T00:00:00.000Z',
          date_format: 'date',
        },
        { name: 'Extended update support', date: 'N/A', date_format: 'string' },
        { name: 'Extended life phase', date: 'N/A', date_format: 'string' },
      ],
      extra_dependences: [],
    },
  ],
  true,
];
