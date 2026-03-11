import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('Connecting to MySQL server...');
  
  try {
    // Connect to MySQL server first to create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Singhamey@574',
      port: 3306
    });

    console.log('Creating database if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS b2b_portal;');
    await connection.end();

    // Now connect to the specific database
    console.log('Connecting to b2b_portal database...');
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Singhamey@574',
      port: 3306,
      database: 'b2b_portal',
      multipleStatements: true
    });

    console.log('Reading schema.sql...');
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await db.query(sql);

    console.log('Database seeded successfully!');
    await db.end();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
