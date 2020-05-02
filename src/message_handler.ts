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
import incorrectTrackArguments from './messages/incorrect_track_arguments';
import incorrectDeleteArguments from './messages/incorrect_delete_arguments';
import { CompleteArguments } from './arguments/complete_arguments';
import incorrectCompleteArguments from './messages/incorrect_complete_arguments';
import completeProjectFail from './messages/complete_project_fail';
import targetUserMessagePrefix from './messages/target_user_message_prefix';
import completeProjectSuccess from './messages/complete_project_success';

type Command = (
  args?: string[], 
  serverId?: string, 
  channel?: string, 
  user?: User
) => string;

export class MessageHandler {
  protected commands: { [name: string]: Command } = {
    complete: this.complete,
    delete: this.delete,
    help: this.help,
    list: this.list,
    track: this.track,
    test: this.test
  };

  public handle(message: Message): string {
    const parsed = parseDiscordCommand(message, ['pab ', 'pablo ', 'Pab ', 'Pablo ']);
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

  protected complete(
    args: string[], 
    serverId: string, 
    channelId: string, 
    owner: User
  ): string {
    const completeArguments = parseArguments(CompleteArguments, args);
    if (!completeArguments) {
      return incorrectCompleteArguments;
    }

    const { title } = storage.getProjects(serverId, owner.id)[completeArguments.index];
    if (!storage.deleteProject(serverId, owner.id, completeArguments.index)) {
      return completeProjectFail;
    }

    return targetUserMessagePrefix('everyone', completeProjectSuccess(owner.username, title));
  };

  protected delete(
    args: string[], 
    serverId: string, 
    channelId: string, 
    owner: User
  ): string {
    const deleteArguments = parseArguments(DeleteArguments, args);
    if (!deleteArguments) {
      return incorrectDeleteArguments;
    }

    if (!storage.deleteProject(serverId, owner.id, deleteArguments.index)) {
      return deleteProjectFail;
    }

    return targetUserMessagePrefix(owner.username, deleteProjectSuccess);
  }

  protected help(
    args: string[], 
    serverId: string, 
    channelId: string, 
    owner: User
  ): string {
    return targetUserMessagePrefix(owner.username, helpMessage);
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

    const listOfProjects = projects.reduce<string>(
      (buffer, project, i) => buffer += projectListItem(project, i + 1), '');
    return targetUserMessagePrefix(owner.username, listOfProjects);
  }

  protected track(
    args: string[], 
    serverId: string, 
    channelId: string, 
    owner: User
  ): string {
    const trackArguments: TrackArguments = parseArguments(TrackArguments, args);
    if (!trackArguments) {
      return incorrectTrackArguments;
    }

    const { title, description, due } = trackArguments;
    storage.addProject(serverId, channelId, owner.id, title, description, due);
    return targetUserMessagePrefix(owner.username, projectTrackSuccess(title));
  }

  public test(): string {
    return 'https://giphy.com/gifs/climate-crisis-greta-thunberg-un-action-summit-U1aN4HTfJ2SmgB2BBK';
  }
}