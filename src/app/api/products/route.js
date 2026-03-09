import { NextResponse } from 'next/server';
import { getDbStatus } from '@/app/lib/db';

export async function GET() {
  try {
    const db = await getDbStatus();
    const products = await db.all('SELECT * FROM products');
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products List Fetch Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
