export default function targetUserMessagePrefix(to: string, message: string): string {
  return `@${to}, ${message}`;
}