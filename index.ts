import { Client, Message, ClientUser, TextChannel } from 'discord.js';
import fetchToken from './src/fetch_token';
import { MessageHandler } from './src/message_handler';
import { Announcer } from './src/announcer';

const client = new Client();
const messageHandler = new MessageHandler();

client.on('ready', () => {
  const announcer = new Announcer(client);
  announcer.start();
  
  console.log('Running!');
});

client.on('message', (message: Message) => {
  const returnMessage = messageHandler.handle(message);
  if (returnMessage) {
    message.channel.send(returnMessage, { disableMentions: 'none' });
  }
});

client.login(fetchToken());