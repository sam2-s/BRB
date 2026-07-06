import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const complaints = await db.complaint.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(complaints)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const complaint = await db.complaint.create({
      data: {
        studentId: body.studentId,
        subject: body.subject,
        description: body.description || '',
        category: body.category || 'Maintenance',
        status: body.status || 'Open',
        priority: body.priority || 'Medium',
        resolution: body.resolution || '',
      },
    })
    return NextResponse.json(complaint, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const complaint = await db.complaint.update({
      where: { id: body.id },
      data: {
        subject: body.subject,
        description: body.description,
        category: body.category,
        status: body.status,
        priority: body.priority,
        resolution: body.resolution,
      },
    })
    return NextResponse.json(complaint)
  } catch {
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.complaint.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 })
  }
}