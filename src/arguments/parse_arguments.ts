export function parseArguments<T>(
  type: new (args: string[]) => T, 
  args: string[]
): T {
  try {
    return new type(args);
  } catch (e) {
    return null;
  }
} 