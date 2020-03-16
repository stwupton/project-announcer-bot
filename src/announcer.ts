import { Client, TextChannel, User } from "discord.js";
import storage, { Project } from "./storage";
import reminderMessage from "./messages/reminder";

export class Announcer {
  constructor(protected client: Client) {}

  public start(): void {
    setTimeout(() => {
      this.sendAnnouncementMessages();
      this.start();
    }, this.getReminderCheckTimeoutDuration());
  }

  protected getAnnouncementWhenMessage(due: Date, lastAnnounced: Date): string | null {
    const reminders: { days: number, when: string }[] = [
      { days: 0, when: 'today' },
      { days: 1, when: 'tommorow' },
      { days: 7, when: 'in one week' },
      { days: 14, when: 'in two weeks' },
    ];
    
    for (const reminder of reminders) {
      const remindAt = new Date(due);
      remindAt.setDate(due.getDate() - reminder.days);

      if (this.shouldAnnounce(remindAt, lastAnnounced)) {
        return reminder.when;
      }
    }

    return null;
  }

  protected getReminderCheckTimeoutDuration(): number {
    const now = new Date(Date.now());
    const checkTime = new Date(now);
    checkTime.setHours(10, 0, 0, 0);

    if (now > checkTime) {
      checkTime.setDate(checkTime.getDate() + 1);
    }

    return checkTime.getTime() - now.getTime();
  }

  protected async sendAnnouncementMessages(): Promise<void> {
    const updatedProjects: Project[] = [];
    const projectsToDelete: Project[] = [];

    for (const serverId of storage.getServerIds()) {
      for (const project of storage.getAllProjects(serverId)) {
        const due = new Date(project.due);
        const lastAnnounced = new Date(project.lastAnnounced);

        const when = this.getAnnouncementWhenMessage(due, lastAnnounced);
        if (!when) continue;

        try {
          const channel = await this.client
            .guilds.resolve(serverId)
            .channels.resolve(project.channelId)
            .fetch() as TextChannel;
          await channel.send(
            reminderMessage(project.title, when), 
            { reply: project.owner }
          );
        } catch (e) {
          console.info('Failed to send reminder to user', e);
          continue;
        }

        const shouldDeleteProject = Date.now() >= due.getTime();
        if (shouldDeleteProject) {
          projectsToDelete.push(project);
        } else {
          updatedProjects.push(project);
        }
      }
    }

    await storage.deleteProjects(projectsToDelete);
    await storage.updateLastAnnounced(updatedProjects);
  }

  protected shouldAnnounce(remindAt: Date, lastAnnounced: Date): boolean {
    const now = new Date(Date.now());
    return now >= remindAt && remindAt > lastAnnounced;
  }
}