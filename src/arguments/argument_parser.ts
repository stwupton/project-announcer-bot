export abstract class ArgumentParser {
  constructor(args: string[]) {
    this.parse(args);
  }

  protected abstract parse(args: string[]): void;
} 