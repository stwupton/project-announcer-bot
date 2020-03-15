interface Project {
  owner: string;
  
}

interface Data {
  servers: { [serverId: string]: Project[] };
}

class Storage {

}

export default new Storage();