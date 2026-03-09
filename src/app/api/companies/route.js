import { NextResponse } from 'next/server';
import { getDbStatus } from '@/app/lib/db';

// GET all companies
export async function GET() {
  try {
    const db = await getDbStatus();
    const companies = await db.all('SELECT * FROM companies ORDER BY name ASC');
    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Fetch Companies Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create new company
export async function POST(request) {
  try {
    const { name, credit_limit } = await request.json();

    if (!name || isNaN(parseFloat(credit_limit))) {
      return NextResponse.json({ message: 'Invalid company data' }, { status: 400 });
    }

    const db = await getDbStatus();
    const result = await db.run(
      'INSERT INTO companies (name, credit_limit, current_debt) VALUES (?, ?, 0)',
      [name, parseFloat(credit_limit)]
    );

    return NextResponse.json({ 
      message: 'Company created successfully', 
      companyId: result.lastID 
    });
  } catch (error) {
    console.error('Create Company Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE company
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
    }

    const db = await getDbStatus();
    await db.run('DELETE FROM companies WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete Company Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update company credit limit
export async function PUT(request) {
  try {
    const { id, credit_limit } = await request.json();

    if (!id || isNaN(parseFloat(credit_limit))) {
      return NextResponse.json({ message: 'Invalid update data' }, { status: 400 });
    }

    const newLimit = parseFloat(credit_limit);
    if (newLimit < 0) {
      return NextResponse.json({ message: 'Credit limit cannot be negative' }, { status: 400 });
    }

    const db = await getDbStatus();
    
    // Ensure company exists first
    const company = await db.get('SELECT current_debt FROM companies WHERE id = ?', [id]);
    if (!company) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    // Optional: could block lowering limit below current debt, but MVP might just allow it
    await db.run(
      'UPDATE companies SET credit_limit = ? WHERE id = ?',
      [newLimit, id]
    );

    return NextResponse.json({ message: 'Credit limit updated successfully', newLimit });
  } catch (error) {
    console.error('Update Company Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
