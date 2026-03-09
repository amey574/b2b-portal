import { NextResponse } from 'next/server';
import { getDbStatus } from '@/app/lib/db';

export async function POST(request) {
  try {
    const { companyId, amount } = await request.json();

    if (!companyId || !amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid repayment amount' }, { status: 400 });
    }

    const db = await getDbStatus();

    // 1. Fetch Company Info
    const company = await db.get(
      'SELECT id, credit_limit, current_debt FROM companies WHERE id = ?',
      [companyId]
    );

    if (!company) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    if (amount > company.current_debt) {
      return NextResponse.json(
        { message: 'Repayment amount exceeds current debt.' },
        { status: 400 }
      );
    }

    // 2. Perform Transaction
    await db.exec('BEGIN TRANSACTION');
    
    try {
       const newDebt = company.current_debt - amount;
       await db.run(
         'UPDATE companies SET current_debt = ? WHERE id = ?',
         [newDebt, companyId]
       );

       await db.exec('COMMIT');

       return NextResponse.json({
         message: 'Debt repaid successfully',
         amountRepaid: amount,
         newCurrentDebt: newDebt,
         newAvailableCredit: company.credit_limit - newDebt
       });

    } catch (txError) {
      await db.exec('ROLLBACK');
      throw txError;
    }

  } catch (error) {
    console.error('Repayment Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
