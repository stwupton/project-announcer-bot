import { parse as parseDiscordCommand } from 'discord-command-parser';
import { Message, User } from 'discord.js';
import { TrackArguments } from './arguments/track_arguments';
import { parseArguments } from './arguments/parse_arguments';
import unknownMessage from './messages/unknown';
import helpMessage from './messages/help';
import noProjectsMessage from './messages/no_projects';
import storage from './storage';
import projectTrackSuccess from './messages/project_track_success';
import projectListItem from './messages/project_list_item';
import { DeleteArguments } from './arguments/delete_arguments';
import deleteProjectFail from './messages/delete_project_fail';
import deleteProjectSuccess from './messages/delete_project_success';

type Command = (
  args?: string[], 
  serverId?: string, 
  channel?: string, 
  user?: User
) => string;

export class MessageHandler {
  protected commands: { [name: string]: Command } = {
    delete: this.delete,
    help: this.help,
    list: this.list,
    track: this.track,
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
      message.channel.id,
      message.author
    );
  }

  protected delete(
    args: string[], 
    serverId: string, 
    channelId: string, 
    owner: User
  ): string {
    const deleteArguments = parseArguments(DeleteArguments, args);
    if (!deleteArguments) {
      return unknownMessage;
    }

    if (!storage.deleteProject(serverId, owner.id, deleteArguments.index)) {
      return deleteProjectFail;
    }

    return deleteProjectSuccess;
  }

  protected help(): string {
    return helpMessage;
  }

  protected list(
    args: string[], 
    serverId: string, 
    channelId: string, 
    owner: User
  ): string {
    const projects = storage.getProjects(serverId, owner.id);
    if (projects.length == 0) {
      return noProjectsMessage;
    }

    return projects.reduce<string>(
      (buffer, project, i) => buffer += projectListItem(project, i + 1), '');
  }

  protected track(
    args: string[], 
    serverId: string, 
    channelId: string, 
    owner: User
  ): string {
    const trackArguments: TrackArguments = parseArguments(TrackArguments, args);
    if (!trackArguments) {
      return unknownMessage;
    }

    const { title, description, due } = trackArguments;
    storage.addProject(serverId, channelId, owner.id, title, description, due);

    return projectTrackSuccess(title);
  }
}