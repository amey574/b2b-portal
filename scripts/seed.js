import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('Connecting to database...');
  const dbPath = path.join(process.cwd(), 'db', 'b2b_portal.sqlite');
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    console.log('Reading schema.sql...');
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await db.exec(sql);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await db.close();
  }
}

seed();
