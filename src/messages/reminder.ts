export default function reminderMessage(title: string, when: string): string {
  return `${title} is due ${when}!`;
}