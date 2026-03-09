import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function getDbStatus() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'db', 'b2b_portal.sqlite'),
      driver: sqlite3.Database
    });
  }
  return db;
}
