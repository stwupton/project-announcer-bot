export default function overdueMessage(title: string, days: number): string {
  return `${title} is overdue by ${days} ${days == 1 ? 'day' : 'days'}!`;
}