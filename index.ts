import { Client, Message, ClientUser, TextChannel } from 'discord.js';
import fetchToken from './src/fetch_token';
import { MessageHandler } from './src/message_handler';

const client = new Client();
const messageHandler = new MessageHandler();

client.on('ready', () => {
  console.log('Running!');
});

client.on('message', (message: Message) => {
  const returnMessage = messageHandler.handle(message);
  if (returnMessage) {
    message.reply(returnMessage);
  }
});

client.login(fetchToken());