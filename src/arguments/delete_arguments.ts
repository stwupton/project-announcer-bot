import { ArgumentParser } from "./argument_parser";

export class DeleteArguments extends ArgumentParser {
  public index: number;

  public parse(args: string[]): void {
    if (args.length != 1) {
      throw new Error('Incorrect amount of arguments passed');
    }

    const index = parseInt(args[0]) - 1;
    if (isNaN(index)) {
      throw new Error('Invalid argument type');
    }

    this.index = index;
  }
}