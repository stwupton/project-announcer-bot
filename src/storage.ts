import { existsSync, readFileSync, writeFile } from "fs";

export interface Project {
  owner: string;
  channelId: string;
  title: string;
  description: string;
  due: string;
}

export interface Data {
  lastAnnounced: string;
  servers: { [serverId: string]: Project[] };
}

class Storage {
  protected data: Data;

  constructor() {
    if (existsSync('data')) {
      const jsonData = readFileSync('data').toString();
      this.data = JSON.parse(jsonData) as Data;
    } else {
      this.data = { servers: {}, lastAnnounced: null };
    }
  }

  public addProject(
    serverId: string, 
    channelId: string, 
    owner: string, 
    title: string, 
    description: string,
    due: Date
  ): void {
    this.ensureServerExists(serverId);
    this.data.servers[serverId].push({ 
      owner, 
      channelId, 
      title, 
      description, 
      due: due.toJSON(), 
    });
    this.save();
  }

  public deleteProject(serverId: string, owner: string, index: number): boolean {
    this.ensureServerExists(serverId);
    const projects = this.data.servers[serverId];
    const userProjects = projects.filter(project => project.owner == owner);
    
    if (index < 0 || index > userProjects.length) {
      return false;
    }

    const toDelete = userProjects[index];
    const deleteAt = projects.indexOf(toDelete);
    projects.splice(deleteAt, 1);

    this.save();

    return true;
  }

  public getLastAnnounced(): Date {
    return new Date(this.data.lastAnnounced || null);
  }

  public getProjects(serverId: string, owner: string): Project[] {
    this.ensureServerExists(serverId);
    return this.data.servers[serverId].filter(project => project.owner == owner);
  }

  public getAllProjects(serverId: string): Project[] {
    this.ensureServerExists(serverId);
    return this.data.servers[serverId];
  }

  public getServerIds(): string[] {
    return Object.keys(this.data.servers);
  }

  public updateLastAnnounced(): Promise<void> {
    this.data.lastAnnounced = new Date(Date.now()).toJSON();
    return this.save();
  }

  protected ensureServerExists(serverId: string): void {
    this.data.servers[serverId] = this.data.servers[serverId] || [];
  }

  protected async save(): Promise<void> {
    return new Promise<void>((resolve) => {
      writeFile('data', JSON.stringify(this.data), () => resolve());
    });
  }
}

export default new Storage();