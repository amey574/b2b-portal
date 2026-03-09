import { NextResponse } from 'next/server';
import { getDbStatus } from '@/app/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: 'companyId is required' }, { status: 400 });
    }

    const db = await getDbStatus();
    const company = await db.get(
      'SELECT id, name AS company_name, credit_limit, current_debt FROM companies WHERE id = ?',
      [companyId]
    );

    if (company) {
      const available_credit = company.credit_limit - company.current_debt;
      return NextResponse.json({ ...company, available_credit });
    } else {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('User Fetch Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
