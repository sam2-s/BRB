import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const rooms = await db.room.findMany({
      include: { students: { where: { status: 'Active' } } },
      orderBy: { roomNumber: 'asc' },
    })
    return NextResponse.json(rooms)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const room = await db.room.create({
      data: {
        roomNumber: body.roomNumber,
        floor: body.floor || 1,
        capacity: body.capacity || 2,
        roomType: body.roomType || 'Standard',
        price: body.price || 0,
        amenities: body.amenities || '',
        status: body.status || 'Available',
      },
    })
    return NextResponse.json(room, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const room = await db.room.update({
      where: { id: body.id },
      data: {
        roomNumber: body.roomNumber,
        floor: body.floor,
        capacity: body.capacity,
        roomType: body.roomType,
        price: body.price,
        amenities: body.amenities,
        status: body.status,
      },
    })
    return NextResponse.json(room)
  } catch {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.room.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}