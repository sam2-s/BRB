import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const students = await db.student.findMany({
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(students)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const student = await db.student.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address || '',
        guardianName: body.guardianName || '',
        guardianPhone: body.guardianPhone || '',
        course: body.course || '',
        admissionDate: body.admissionDate ? new Date(body.admissionDate) : new Date(),
        status: body.status || 'Active',
        roomId: body.roomId || null,
      },
    })
    if (body.roomId) {
      await db.room.update({
        where: { id: body.roomId },
        data: { status: 'Occupied' },
      })
    }
    return NextResponse.json(student, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await db.student.findUnique({ where: { id: body.id }, include: { room: true } })

    const student = await db.student.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        course: body.course,
        status: body.status,
        roomId: body.roomId,
      },
    })

    if (existing?.roomId && existing.roomId !== body.roomId) {
      const roomStudents = await db.student.count({
        where: { roomId: existing.roomId, status: 'Active' },
      })
      if (roomStudents <= 1) {
        await db.room.update({ where: { id: existing.roomId }, data: { status: 'Available' } })
      }
    }

    if (body.roomId) {
      await db.room.update({ where: { id: body.roomId }, data: { status: 'Occupied' } })
    }

    return NextResponse.json(student)
  } catch {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const student = await db.student.findUnique({ where: { id }, include: { room: true } })
    await db.student.delete({ where: { id } })
    if (student?.roomId && student.room) {
      const roomStudents = await db.student.count({
        where: { roomId: student.roomId, status: 'Active' },
      })
      if (roomStudents <= 0) {
        await db.room.update({ where: { id: student.roomId }, data: { status: 'Available' } })
      }
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}