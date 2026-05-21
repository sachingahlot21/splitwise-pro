import { promises as fs } from 'fs';
import path from 'path';

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  color: string;
}

const USER_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

async function ensureUserDirectory() {
  await fs.mkdir(path.dirname(USER_FILE_PATH), { recursive: true });
}

async function seedUsers(): Promise<LocalUser[]> {
  await ensureUserDirectory();
  await fs.writeFile(USER_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  return [];
}

export async function readUsers(): Promise<LocalUser[]> {
  try {
    const contents = await fs.readFile(USER_FILE_PATH, 'utf-8');
    return JSON.parse(contents) as LocalUser[];
  } catch (error) {
    return seedUsers();
  }
}

export async function writeUsers(users: LocalUser[]): Promise<void> {
  await ensureUserDirectory();
  await fs.writeFile(USER_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

export async function findUserByEmail(email: string): Promise<LocalUser | null> {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<LocalUser | null> {
  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
}

export async function addLocalUser(user: Omit<LocalUser, 'id'>): Promise<LocalUser> {
  const users = await readUsers();
  const newUser: LocalUser = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...user,
  };
  users.push(newUser);
  await writeUsers(users);
  return newUser;
}
