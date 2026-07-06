import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const fees = await db.fee.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(fees)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const fee = await db.fee.create({
      data: {
        studentId: body.studentId,
        amount: body.amount,
        type: body.type || 'Monthly',
        status: body.status || 'Pending',
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
        month: body.month || '',
        year: body.year || new Date().getFullYear(),
        paymentMethod: body.paymentMethod || '',
        transactionId: body.transactionId || '',
        notes: body.notes || '',
      },
    })
    return NextResponse.json(fee, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const fee = await db.fee.update({
      where: { id: body.id },
      data: {
        amount: body.amount,
        type: body.type,
        status: body.status,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        month: body.month,
        year: body.year,
        paymentMethod: body.paymentMethod,
        transactionId: body.transactionId,
        notes: body.notes,
      },
    })
    return NextResponse.json(fee)
  } catch {
    return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.fee.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete fee' }, { status: 500 })
  }
}