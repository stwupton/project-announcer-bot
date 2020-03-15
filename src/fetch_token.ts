import { existsSync, readFileSync } from 'fs';

export default function fetchToken(): string {
  if (!existsSync('token')) {
    throw new Error('Could not find token file');
  }
  return readFileSync('token').toString();
};