const parseUpdateSchedule = (value: string): [string | number, string | number] => {
  const splitted = value.split(' ');
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
  let day: string | number = splitted[splitted.length - 1];

  if (weekdays.includes(day as (typeof weekdays)[number])) {
    day = weekdays.indexOf(day as (typeof weekdays)[number]);
  }

  return [splitted[1], day];
};

export default parseUpdateSchedule;
