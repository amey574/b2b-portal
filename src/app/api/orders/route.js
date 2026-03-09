import { NextResponse } from 'next/server';
import { getDbStatus } from '@/app/lib/db';

export async function POST(request) {
  try {
    const { companyId, productId, quantity } = await request.json();

    if (!companyId || !productId || !quantity || quantity <= 0) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    const db = await getDbStatus();

    // 1. Fetch Company Info & Credit Limit
    const company = await db.get(
      'SELECT id, credit_limit, current_debt FROM companies WHERE id = ?',
      [companyId]
    );

    if (!company) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    // 2. Fetch Pricing Tiers & determine price
    const tiers = await db.all(
      'SELECT min_quantity, max_quantity, unit_price FROM pricing_tiers WHERE product_id = ? ORDER BY min_quantity ASC',
      [productId]
    );

    if (!tiers || tiers.length === 0) {
      return NextResponse.json({ message: 'Product or pricing not found' }, { status: 404 });
    }

    let unitPrice = null;
    for (const tier of tiers) {
      const max = tier.max_quantity === null ? Infinity : tier.max_quantity;
      if (quantity >= tier.min_quantity && quantity <= max) {
        unitPrice = tier.unit_price;
        break;
      }
    }

    if (unitPrice === null) {
      return NextResponse.json({ message: 'Invalid quantity for pricing tiers' }, { status: 400 });
    }

    const totalAmount = unitPrice * quantity;
    const availableCredit = company.credit_limit - company.current_debt;

    // 3. Credit Check
    if (totalAmount > availableCredit) {
      return NextResponse.json(
         { message: 'Order exceeds your credit limit.' },
         { status: 403 }
      );
    }

    // 4. Place Order Transaction
    await db.exec('BEGIN TRANSACTION');
    
    try {
       // Create Order
       const result = await db.run(
         'INSERT INTO orders (company_id, product_id, quantity, unit_price, total_amount) VALUES (?, ?, ?, ?, ?)',
         [companyId, productId, quantity, unitPrice, totalAmount]
       );
       
       // Update Company Debt
       const newDebt = company.current_debt + totalAmount;
       await db.run(
         'UPDATE companies SET current_debt = ? WHERE id = ?',
         [newDebt, companyId]
       );

       await db.exec('COMMIT');

       return NextResponse.json({
         message: 'Order placed successfully',
         orderId: result.lastID,
         quantity,
         unitPrice,
         totalAmount,
         newAvailableCredit: company.credit_limit - newDebt
       });

    } catch (txError) {
      await db.exec('ROLLBACK');
      throw txError;
    }

  } catch (error) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ message: error.message, stack: error.stack }, { status: 500 });
  }
}
