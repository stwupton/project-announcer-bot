import { ArgumentParser } from "./argument_parser";

export function parseArguments<T extends ArgumentParser>(
  type: new () => T, 
  args: string[]
): T {
  try {
    const obj = new type();
    obj.parse(args);
    return obj;
  } catch (e) {
    return null;
  }
} 