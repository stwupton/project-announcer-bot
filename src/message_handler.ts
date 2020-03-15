import { parse as parseDiscordCommand } from 'discord-command-parser';
import { Message, User } from 'discord.js';
import { TrackArguments } from './arguments/track_arguments';
import { parseArguments } from './arguments/parse_arguments';
import unknownMessage from './messages/unknown';
import helpMessage from './messages/help';

type Command = (args?: string[], serverId?: string, user?: User) => string;

export class MessageHandler {
  protected commands: { [name: string]: Command } = {
    track: this.track,
    help: this.help
  };

  public handle(message: Message): string {
    const parsed = parseDiscordCommand(message, ['pab ', 'pablo ']);
    if (!parsed.success) {
      return;
    }

    const command = this.commands[parsed.command];
    if (!command) {
      return unknownMessage;
    }

    return this.commands[parsed.command](
      parsed.arguments, 
      message.guild.id, 
      message.author
    );
  }

  protected help(): string {
    return helpMessage;
  }

  protected track(args: string[]): string {
    const trackArguments: TrackArguments = parseArguments(TrackArguments, args);
    if (!trackArguments) {
      return unknownMessage;
    }

    return 'OK';
  }
}