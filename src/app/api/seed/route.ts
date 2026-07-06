import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const floors = [1, 2, 3]
    const roomTypes = ['Standard', 'Deluxe', 'Premium']
    const prices = [3000, 5000, 8000]
    const amenitiesList = [
      'WiFi, AC, Attached Bathroom',
      'WiFi, AC, Attached Bathroom, Study Table',
      'WiFi, AC, Attached Bathroom, Study Table, Balcony, Mini Fridge',
    ]

    const rooms = []
    for (const floor of floors) {
      for (let i = 1; i <= 5; i++) {
        const typeIdx = floor === 1 ? 0 : floor === 2 ? 1 : 2
        rooms.push({
          roomNumber: `${floor}${String(i).padStart(2, '0')}`,
          floor,
          capacity: floor === 3 ? 1 : 2,
          roomType: roomTypes[typeIdx],
          price: prices[typeIdx],
          status: 'Available',
          amenities: amenitiesList[typeIdx],
        })
      }
    }

    await db.room.createMany({ data: rooms })

    const studentNames = [
      'Aarav Sharma', 'Vivaan Patel', 'Aditya Singh', 'Vihaan Kumar',
      'Arjun Reddy', 'Sai Teja', 'Rohit Gupta', 'Nikhil Joshi',
      'Karan Mehta', 'Rahul Verma',
    ]
    const courses = ['B.Tech CSE', 'B.Tech ECE', 'MBA', 'B.Tech ME', 'BCA']
    const guardians = ['Ramesh Sharma', 'Suresh Patel', 'Mahesh Singh', 'Dinesh Kumar', 'Rajesh Reddy']

    const students = []
    for (let i = 0; i < studentNames.length; i++) {
      students.push({
        name: studentNames[i],
        email: studentNames[i].toLowerCase().replace(' ', '.') + '@email.com',
        phone: `98765${String(43210 + i)}`,
        address: `${i + 10}, MG Road, Hyderabad`,
        guardianName: guardians[i % guardians.length],
        guardianPhone: `98765${String(10000 + i)}`,
        course: courses[i % courses.length],
        status: 'Active',
        roomId: rooms[i]?.id || null,
      })
    }

    await db.student.createMany({ data: students })

    for (let i = 0; i < 3; i++) {
      await db.room.update({
        where: { id: rooms[i].id },
        data: { status: 'Occupied' },
      })
    }

    const feeStatuses = ['Paid', 'Pending', 'Paid', 'Pending', 'Paid']
    const months = ['January', 'February', 'March', 'April', 'May', 'June']
    for (const student of students.slice(0, 5)) {
      for (let m = 0; m < 3; m++) {
        await db.fee.create({
          data: {
            studentId: student.id,
            amount: 3000 + Math.floor(Math.random() * 5000),
            type: 'Monthly',
            status: feeStatuses[m % feeStatuses.length],
            paymentDate: feeStatuses[m] === 'Paid' ? new Date(2026, m, 5) : null,
            dueDate: new Date(2026, m, 10),
            month: months[m],
            year: 2026,
            paymentMethod: feeStatuses[m] === 'Paid' ? 'UPI' : '',
            transactionId: feeStatuses[m] === 'Paid' ? `TXN${Date.now()}${m}` : '',
          },
        })
      }
    }

    const complaintData = [
      { subject: 'Water leakage in bathroom', category: 'Maintenance', priority: 'High', status: 'Open' },
      { subject: 'WiFi not working', category: 'IT Support', priority: 'High', status: 'Resolved', resolution: 'Router replaced and configured' },
      { subject: 'AC making noise', category: 'Maintenance', priority: 'Medium', status: 'In Progress' },
      { subject: 'Cleanliness issue in corridor', category: 'Housekeeping', priority: 'Low', status: 'Open' },
      { subject: 'Electrical socket not working', category: 'Maintenance', priority: 'High', status: 'Open' },
    ]
    for (let i = 0; i < complaintData.length; i++) {
      await db.complaint.create({
        data: {
          studentId: students[i % students.length].id,
          subject: complaintData[i].subject,
          description: `Detailed description for: ${complaintData[i].subject}`,
          category: complaintData[i].category,
          priority: complaintData[i].priority,
          status: complaintData[i].status,
          resolution: complaintData[i].resolution || '',
        },
      })
    }

    const visitorNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Devi', 'Manoj Singh']
    const relations = ['Father', 'Mother', 'Brother', 'Sister', 'Friend']
    const purposes = ['Meeting', 'Delivering items', 'Emergency', 'Casual Visit', 'Document submission']
    for (let i = 0; i < visitorNames.length; i++) {
      await db.visitor.create({
        data: {
          studentId: students[i % students.length].id,
          visitorName: visitorNames[i],
          visitorPhone: `99887${String(65432 + i)}`,
          relation: relations[i],
          purpose: purposes[i],
          visitDate: new Date(2026, 5, 25 + i),
          checkIn: new Date(2026, 5, 25 + i, 10, 0),
          checkOut: i < 3 ? new Date(2026, 5, 25 + i, 12, 30) : null,
          status: i < 3 ? 'Checked Out' : 'Checked In',
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 })
  }
}