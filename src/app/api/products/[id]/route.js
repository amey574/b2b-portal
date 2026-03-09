import { NextResponse } from 'next/server';
import { getDbStatus } from '@/app/lib/db';

export async function GET(request, { params }) {
  try {
    const { id: productId } = await params;
    const db = await getDbStatus();

    const product = await db.get(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (!product) {
       return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const tiers = await db.all(
      'SELECT min_quantity, max_quantity, unit_price FROM pricing_tiers WHERE product_id = ? ORDER BY min_quantity ASC',
      [productId]
    );

    return NextResponse.json({ ...product, tiers });

  } catch (error) {
    console.error('Product Detail Fetch Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
