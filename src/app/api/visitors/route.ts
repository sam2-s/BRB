import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const visitors = await db.visitor.findMany({
      include: { student: true },
      orderBy: { visitDate: 'desc' },
    })
    return NextResponse.json(visitors)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch visitors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const visitor = await db.visitor.create({
      data: {
        studentId: body.studentId,
        visitorName: body.visitorName,
        visitorPhone: body.visitorPhone || '',
        relation: body.relation || '',
        purpose: body.purpose || '',
        visitDate: body.visitDate ? new Date(body.visitDate) : new Date(),
        checkIn: body.checkIn ? new Date(body.checkIn) : new Date(),
        checkOut: body.checkOut ? new Date(body.checkOut) : null,
        status: body.status || 'Checked In',
      },
    })
    return NextResponse.json(visitor, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create visitor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const visitor = await db.visitor.update({
      where: { id: body.id },
      data: {
        visitorName: body.visitorName,
        visitorPhone: body.visitorPhone,
        relation: body.relation,
        purpose: body.purpose,
        visitDate: body.visitDate ? new Date(body.visitDate) : undefined,
        checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
        checkOut: body.checkOut ? new Date(body.checkOut) : null,
        status: body.status,
      },
    })
    return NextResponse.json(visitor)
  } catch {
    return NextResponse.json({ error: 'Failed to update visitor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.visitor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete visitor' }, { status: 500 })
  }
}