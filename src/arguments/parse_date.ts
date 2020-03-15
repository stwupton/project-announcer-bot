export default function parseDate(value: string): Date {
  const dateValues: number[] = value.split('/').map(x => parseInt(x));
  if (dateValues.length != 3) {
    throw new Error('Expected 3 values for date');
  }

  const date = new Date();
  date.setDate(dateValues[0]);
  date.setMonth(dateValues[1] - 1);
  date.setFullYear(dateValues[2]);
  return date;
}