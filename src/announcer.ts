import { Client, TextChannel, User } from "discord.js";
import storage, { Project } from "./storage";
import reminderMessage from "./messages/reminder";
import overdueMessage from "./messages/overdue";

export class Announcer {
  protected readonly reminders: { days: number, when: string }[] = [
    { days: 0, when: 'today' },
    { days: 1, when: 'tommorow' },
    { days: 7, when: 'in one week' },
    { days: 14, when: 'in two weeks' },
  ];

  constructor(protected client: Client) {}

  public start(): void {
    setTimeout(() => {
      this.sendAnnouncementMessages().then(() => {
        this.start();
      });
    }, this.getReminderCheckTimeoutDuration());
  }

  protected getAnnouncementMessage(project: Project): string | null {
    const msPerDay = 1000 * 60 * 60 * 24;
    const now = new Date(Date.now());
    const due = new Date(project.due);

    const differenceInDays = Math.floor((now.getTime() - due.getTime()) / msPerDay);
    if (differenceInDays > 0) {
      return overdueMessage(project.title, differenceInDays);
    }

    const lastAnnounced = storage.getLastAnnounced();
    for (const reminder of this.reminders) {
      const remindAt = new Date(due);
      remindAt.setDate(due.getDate() - reminder.days);

      const shouldAnnounce = now >= remindAt && remindAt > lastAnnounced;
      if (shouldAnnounce) {
        return reminderMessage(project.title, reminder.when);
      }
    }

    return null;
  }

  protected getReminderCheckTimeoutDuration(): number {
    const now = new Date(Date.now());
    const lastAnnounced = storage.getLastAnnounced();

    let announceTime = new Date(now);
    announceTime.setHours(10, 0, 0, 0);

    const overAnnounceTime = now.getTime() >= announceTime.getTime();
    const wasAnnouncedToday = 
      now.getDate() == lastAnnounced.getDate() && 
      now.getMonth() == lastAnnounced.getMonth() && 
      now.getFullYear() == lastAnnounced.getFullYear();

    if (overAnnounceTime) {
      if (!wasAnnouncedToday) {
        announceTime = new Date(now);
      } else {
        announceTime.setDate(announceTime.getDate() + 1);
      }
    }

    return announceTime.getTime() - now.getTime();
  }

  protected async sendAnnouncementMessages(): Promise<void> {
    for (const serverId of storage.getServerIds()) {
      for (const project of storage.getAllProjects(serverId)) {
        const message = this.getAnnouncementMessage(project);
        if (!message) continue;

        try {
          const channel = await this.client
            .guilds.resolve(serverId)
            .channels.resolve(project.channelId)
            .fetch() as TextChannel;
          await channel.send(message, { reply: project.owner });
        } catch (e) {
          console.info('Failed to send reminder to user', e);
          continue;
        }
      }
    }

    await storage.updateLastAnnounced();
  }
}