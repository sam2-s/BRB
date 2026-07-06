import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const totalStudents = await db.student.count({ where: { status: 'Active' } })
    const totalRooms = await db.room.count()
    const occupiedRooms = await db.room.count({ where: { status: 'Occupied' } })
    const availableRooms = await db.room.count({ where: { status: 'Available' } })
    const pendingFees = await db.fee.count({ where: { status: 'Pending' } })
    const paidFees = await db.fee.count({ where: { status: 'Paid' } })
    const totalRevenue = await db.fee.aggregate({ where: { status: 'Paid' }, _sum: { amount: true } })
    const pendingRevenue = await db.fee.aggregate({ where: { status: 'Pending' }, _sum: { amount: true } })
    const openComplaints = await db.complaint.count({ where: { status: 'Open' } })
    const resolvedComplaints = await db.complaint.count({ where: { status: 'Resolved' } })
    const totalVisitors = await db.visitor.count()
    const todayVisitors = await db.visitor.count({
      where: {
        visitDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    })

    const recentStudents = await db.student.findMany({
      include: { room: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentComplaints = await db.complaint.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const roomBreakdown = await db.room.groupBy({
      by: ['roomType'],
      _count: { id: true },
    })

    return NextResponse.json({
      totalStudents,
      totalRooms,
      occupiedRooms,
      availableRooms,
      pendingFees,
      paidFees,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingRevenue: pendingRevenue._sum.amount || 0,
      openComplaints,
      resolvedComplaints,
      totalVisitors,
      todayVisitors,
      recentStudents,
      recentComplaints,
      roomBreakdown,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}