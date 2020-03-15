import { ArgumentParser } from "./argument_parser";
import parseDate from "./parse_date";

export class TrackArguments extends ArgumentParser {
  public title: string;
  public description: string;
  public due: Date;

  protected parse(args: string[]): void {
    if (args.length != 3) {
      throw new Error('Wrong amount of arguments passed');
    }

    this.title = args[0];
    this.description = args[1];
    this.due = parseDate(args[2]);
  }
}