'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BedDouble, Users, CreditCard, MessageSquareWarning,
  UserCheck, Hotel, ChevronRight, Menu, X, Plus, Search, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Eye, ArrowUpRight,
  TrendingUp, TrendingDown, LogOut, Phone, Mail, Calendar, MapPin,
  BookOpen, Shield, Home, User, Star, CircleDot
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

type NavItem = 'dashboard' | 'rooms' | 'students' | 'fees' | 'complaints' | 'visitors'

interface Room { id: string; roomNumber: string; floor: number; capacity: number; roomType: string; price: number; status: string; amenities: string; students: Student[] }
interface Student { id: string; name: string; email: string; phone: string; address: string; guardianName: string; guardianPhone: string; course: string; admissionDate: string; status: string; roomId: string | null; room: Room | null }
interface Fee { id: string; studentId: string; amount: number; type: string; status: string; paymentDate: string | null; dueDate: string; month: string; year: number; paymentMethod: string; transactionId: string; notes: string; student: Student }
interface Complaint { id: string; studentId: string; subject: string; description: string; category: string; status: string; priority: string; resolution: string; createdAt: string; student: Student }
interface Visitor { id: string; studentId: string; visitorName: string; visitorPhone: string; relation: string; purpose: string; visitDate: string; checkIn: string; checkOut: string | null; status: string; student: Student }
interface DashboardData {
  totalStudents: number; totalRooms: number; occupiedRooms: number; availableRooms: number;
  pendingFees: number; paidFees: number; totalRevenue: number; pendingRevenue: number;
  openComplaints: number; resolvedComplaints: number; totalVisitors: number; todayVisitors: number;
  recentStudents: Student[]; recentComplaints: Complaint[]; roomBreakdown: { roomType: string; _count: { id: number } }[]
}

const navItems: { key: NavItem; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'rooms', label: 'Room Allocation', icon: BedDouble },
  { key: 'students', label: 'Student Details', icon: Users },
  { key: 'fees', label: 'Fee Payment', icon: CreditCard },
  { key: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
  { key: 'visitors', label: 'Visitor Records', icon: UserCheck },
]

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  // Dialog states
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [feeDialogOpen, setFeeDialogOpen] = useState(false)
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [visitorDialogOpen, setVisitorDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewType, setViewType] = useState<'student' | 'room'>('student')
  const [viewData, setViewData] = useState<Student | Room | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Record<string, string | number>>({})

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, studentsRes, feesRes, complaintsRes, visitorsRes, dashRes] = await Promise.all([
        fetch('/api/rooms'), fetch('/api/students'), fetch('/api/fees'),
        fetch('/api/complaints'), fetch('/api/visitors'), fetch('/api/dashboard'),
      ])
      const [roomsData, studentsData, feesData, complaintsData, visitorsData, dashData] = await Promise.all([
        roomsRes.json(), studentsRes.json(), feesRes.json(),
        complaintsRes.json(), visitorsRes.json(), dashRes.json(),
      ])
      setRooms(roomsData)
      setStudents(studentsData)
      setFees(feesData)
      setComplaints(complaintsData)
      setVisitors(visitorsData)
      setDashboard(dashData)
    } catch {
      toast({ title: 'Error loading data', description: 'Please try again', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  const seedDatabase = async () => {
    await fetch('/api/seed', { method: 'POST' })
    toast({ title: 'Database Seeded', description: 'Sample data has been added successfully!' })
    fetchData()
  }

  const handleNav = (key: NavItem) => { setActiveNav(key); setSidebarOpen(false); setSearchTerm('') }

  // Room CRUD
  const handleSaveRoom = async () => {
    if (!formData.roomNumber || !formData.price) { toast({ title: 'Missing fields', variant: 'destructive' }); return }
    if (editMode) {
      await fetch('/api/rooms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Room Updated' })
    } else {
      await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Room Added' })
    }
    setRoomDialogOpen(false); setEditMode(false); setFormData({}); fetchData()
  }

  const handleDeleteRoom = async (id: string) => {
    await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' })
    toast({ title: 'Room Deleted' }); fetchData()
  }

  // Student CRUD
  const handleSaveStudent = async () => {
    if (!formData.name || !formData.email || !formData.phone) { toast({ title: 'Missing required fields', variant: 'destructive' }); return }
    if (editMode) {
      await fetch('/api/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Student Updated' })
    } else {
      await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Student Added' })
    }
    setStudentDialogOpen(false); setEditMode(false); setFormData({}); fetchData()
  }

  const handleDeleteStudent = async (id: string) => {
    await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
    toast({ title: 'Student Removed' }); fetchData()
  }

  // Fee CRUD
  const handleSaveFee = async () => {
    if (!formData.studentId || !formData.amount || !formData.month) { toast({ title: 'Missing required fields', variant: 'destructive' }); return }
    if (editMode) {
      await fetch('/api/fees', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Fee Updated' })
    } else {
      await fetch('/api/fees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Fee Record Added' })
    }
    setFeeDialogOpen(false); setEditMode(false); setFormData({}); fetchData()
  }

  const handleDeleteFee = async (id: string) => {
    await fetch(`/api/fees?id=${id}`, { method: 'DELETE' })
    toast({ title: 'Fee Record Deleted' }); fetchData()
  }

  // Complaint CRUD
  const handleSaveComplaint = async () => {
    if (!formData.studentId || !formData.subject) { toast({ title: 'Missing required fields', variant: 'destructive' }); return }
    if (editMode) {
      await fetch('/api/complaints', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Complaint Updated' })
    } else {
      await fetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Complaint Filed' })
    }
    setComplaintDialogOpen(false); setEditMode(false); setFormData({}); fetchData()
  }

  const handleDeleteComplaint = async (id: string) => {
    await fetch(`/api/complaints?id=${id}`, { method: 'DELETE' })
    toast({ title: 'Complaint Deleted' }); fetchData()
  }

  // Visitor CRUD
  const handleSaveVisitor = async () => {
    if (!formData.studentId || !formData.visitorName) { toast({ title: 'Missing required fields', variant: 'destructive' }); return }
    if (editMode) {
      await fetch('/api/visitors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Visitor Record Updated' })
    } else {
      await fetch('/api/visitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast({ title: 'Visitor Registered' })
    }
    setVisitorDialogOpen(false); setEditMode(false); setFormData({}); fetchData()
  }

  const handleDeleteVisitor = async (id: string) => {
    await fetch(`/api/visitors?id=${id}`, { method: 'DELETE' })
    toast({ title: 'Visitor Record Deleted' }); fetchData()
  }

  const openEditDialog = (type: string, data: Record<string, unknown>) => {
    setEditMode(true)
    setFormData({ ...data } as Record<string, string | number>)
    if (type === 'room') setRoomDialogOpen(true)
    else if (type === 'student') setStudentDialogOpen(true)
    else if (type === 'fee') setFeeDialogOpen(true)
    else if (type === 'complaint') setComplaintDialogOpen(true)
    else if (type === 'visitor') setVisitorDialogOpen(true)
  }

  const openNewDialog = (type: string) => {
    setEditMode(false)
    setFormData({})
    if (type === 'room') { setFormData({ roomNumber: '', floor: 1, capacity: 2, roomType: 'Standard', price: 3000, amenities: '', status: 'Available' }); setRoomDialogOpen(true) }
    else if (type === 'student') setStudentDialogOpen(true)
    else if (type === 'fee') { setFormData({ amount: 3000, type: 'Monthly', status: 'Pending', month: new Date().toLocaleString('default', { month: 'long' }), year: new Date().getFullYear() }); setFeeDialogOpen(true) }
    else if (type === 'complaint') { setFormData({ category: 'Maintenance', priority: 'Medium', status: 'Open' }); setComplaintDialogOpen(true) }
    else if (type === 'visitor') { setFormData({ status: 'Checked In' }); setVisitorDialogOpen(true) }
  }

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const filteredStudents = students.filter(s => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm))
  const filteredRooms = rooms.filter(r => !searchTerm || r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || r.roomType.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredFees = fees.filter(f => !searchTerm || f.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.month.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredComplaints = complaints.filter(c => !searchTerm || c.subject.toLowerCase().includes(searchTerm.toLowerCase()) || c.student?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredVisitors = visitors.filter(v => !searchTerm || v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) || v.student?.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // ==================== DASHBOARD ====================
  const renderDashboard = () => {
    if (!dashboard) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>
    const occupancyRate = dashboard.totalRooms > 0 ? Math.round((dashboard.occupiedRooms / dashboard.totalRooms) * 100) : 0
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to BRB Hotels</h2>
            <p className="text-muted-foreground mt-1">Bell Road Baazigar — Your complete hostel overview</p>
          </div>
          {students.length === 0 && (
            <Button onClick={seedDatabase} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Star className="h-4 w-4 mr-2" /> Load Sample Data
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={dashboard.totalStudents} icon={Users} color="bg-amber-100 text-amber-700" subtitle="Active residents" />
          <StatCard title="Occupied Rooms" value={`${dashboard.occupiedRooms}/${dashboard.totalRooms}`} icon={BedDouble} color="bg-emerald-100 text-emerald-700" subtitle={`${occupancyRate}% occupancy`} />
          <StatCard title="Revenue Collected" value={fmtCurrency(dashboard.totalRevenue)} icon={TrendingUp} color="bg-emerald-100 text-emerald-700" subtitle={`${dashboard.paidFees} payments received`} />
          <StatCard title="Pending Fees" value={fmtCurrency(dashboard.pendingRevenue)} icon={TrendingDown} color="bg-rose-100 text-rose-700" subtitle={`${dashboard.pendingFees} records pending`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Available Rooms" value={dashboard.availableRooms} icon={Home} color="bg-sky-100 text-sky-700" />
          <StatCard title="Open Complaints" value={dashboard.openComplaints} icon={AlertTriangle} color="bg-orange-100 text-orange-600" subtitle={`${dashboard.resolvedComplaints} resolved`} />
          <StatCard title="Today's Visitors" value={dashboard.todayVisitors} icon={UserCheck} color="bg-violet-100 text-violet-700" />
          <StatCard title="Total Visitors" value={dashboard.totalVisitors} icon={UserCheck} color="bg-amber-100 text-amber-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Occupancy Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2"><span>Room Occupancy</span><span className="font-semibold">{occupancyRate}%</span></div>
                  <Progress value={occupancyRate} className="h-3" />
                </div>
                {dashboard.roomBreakdown.map((rb) => (
                  <div key={rb.roomType}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{rb.roomType} Rooms</span><span className="font-medium">{rb._count.id}</span></div>
                    <Progress value={(rb._count.id / dashboard.totalRooms) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.recentStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setViewData(s); setViewType('student'); setViewDialogOpen(true) }}>
                    <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm">{s.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.course} • {s.room?.roomNumber || 'Unassigned'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{s.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {dashboard.recentComplaints.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recent Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.recentComplaints.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center ${c.priority === 'High' ? 'bg-rose-100 text-rose-600' : c.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.student?.name} • {c.category}</p>
                    </div>
                    <Badge variant={c.status === 'Open' ? 'destructive' : c.status === 'Resolved' ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ==================== ROOMS ====================
  const renderRooms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Room Allocation</h2>
          <p className="text-muted-foreground">Manage all hostel rooms and their occupancy</p>
        </div>
        <Button onClick={() => openNewDialog('room')} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Room
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <motion.div key={room.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${room.status === 'Occupied' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                  <Badge variant={room.status === 'Occupied' ? 'default' : 'secondary'}>{room.status}</Badge>
                </div>
                <CardDescription className="text-xs">{room.roomType} • Floor {room.floor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{room.students.length}/{room.capacity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rent</span>
                  <span className="font-semibold text-amber-700">{fmtCurrency(room.price)}/mo</span>
                </div>
                {room.students.length > 0 && (
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-xs text-muted-foreground font-medium">Occupants:</p>
                    {room.students.map((s) => (
                      <p key={s.id} className="text-sm flex items-center gap-2"><CircleDot className="h-3 w-3 text-amber-500" />{s.name}</p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setViewData(room); setViewType('room'); setViewDialogOpen(true) }}><Eye className="h-3 w-3 mr-1" />View</Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => openEditDialog('room', room)}><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteRoom(room.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  // ==================== STUDENTS ====================
  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Details</h2>
          <p className="text-muted-foreground">Manage all student records and room assignments</p>
        </div>
        <Button onClick={() => openNewDialog('student')} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Student
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Course</TableHead>
                <TableHead className="font-semibold">Room</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setViewData(student); setViewType('student'); setViewDialogOpen(true) }}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-xs shrink-0">{student.name.split(' ').map(n => n[0]).join('')}</div>
                      <div><p className="font-medium text-sm">{student.name}</p><p className="text-xs text-muted-foreground md:hidden">{student.course}</p></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{student.phone}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><p className="text-sm">{student.course}</p></TableCell>
                  <TableCell>
                    {student.room ? (
                      <Badge variant="outline" className="font-medium">{student.room.roomNumber}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell><Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="text-xs">{student.status}</Badge></TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditDialog('student', student)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteStudent(student.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No students found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )

  // ==================== FEES ====================
  const renderFees = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Payment</h2>
          <p className="text-muted-foreground">Track and manage student fee payments</p>
        </div>
        <Button onClick={() => openNewDialog('fee')} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Fee Record
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by student or month..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Collected</p><p className="text-2xl font-bold text-emerald-700">{fmtCurrency(fees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0))}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending Amount</p><p className="text-2xl font-bold text-rose-700">{fmtCurrency(fees.filter(f => f.status === 'Pending').reduce((a, f) => a + f.amount, 0))}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Records</p><p className="text-2xl font-bold">{fees.length}</p></CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold">Month</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Due Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">{fee.student?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm">{fee.month} {fee.year}</TableCell>
                  <TableCell className="font-semibold text-sm">{fmtCurrency(fee.amount)}</TableCell>
                  <TableCell className="text-sm hidden sm:table-cell">{fmt(fee.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={fee.status === 'Paid' ? 'default' : 'destructive'} className="text-xs">
                      {fee.status === 'Paid' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}{fee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditDialog('fee', { ...fee, studentId: fee.studentId })}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteFee(fee.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFees.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No fee records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )

  // ==================== COMPLAINTS ====================
  const renderComplaints = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Complaint System</h2>
          <p className="text-muted-foreground">Track and resolve student complaints</p>
        </div>
        <Button onClick={() => openNewDialog('complaint')} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> File Complaint
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search complaints..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredComplaints.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`border-0 shadow-sm hover:shadow-md transition-all border-l-4 ${c.priority === 'High' ? 'border-l-rose-500' : c.priority === 'Medium' ? 'border-l-amber-500' : 'border-l-sky-500'}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{c.subject}</h3>
                      <Badge variant="outline" className="text-xs">{c.category}</Badge>
                      <Badge variant={c.priority === 'High' ? 'destructive' : c.priority === 'Medium' ? 'secondary' : 'outline'} className="text-xs">{c.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.student?.name}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(c.createdAt)}</span>
                    </div>
                    {c.resolution && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-sm">
                        <p className="font-medium text-emerald-700">Resolution:</p>
                        <p className="text-emerald-600 mt-0.5">{c.resolution}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={c.status === 'Open' ? 'destructive' : c.status === 'Resolved' ? 'default' : 'secondary'}>{c.status}</Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditDialog('complaint', c)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteComplaint(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredComplaints.length === 0 && (
          <Card className="border-0 shadow-sm"><CardContent className="p-12 text-center text-muted-foreground">No complaints found</CardContent></Card>
        )}
      </div>
    </div>
  )

  // ==================== VISITORS ====================
  const renderVisitors = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visitor Records</h2>
          <p className="text-muted-foreground">Track all visitor entries and exits</p>
        </div>
        <Button onClick={() => openNewDialog('visitor')} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Register Visitor
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search visitors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="font-semibold">Visitor</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Relation</TableHead>
                <TableHead className="font-semibold">Visiting</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Purpose</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.map((v) => (
                <TableRow key={v.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{v.visitorName}</p>
                      <p className="text-xs text-muted-foreground">{v.visitorPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm hidden sm:table-cell">{v.relation}</TableCell>
                  <TableCell className="text-sm">{v.student?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm hidden md:table-cell">{v.purpose}</TableCell>
                  <TableCell className="text-sm hidden lg:table-cell">{fmt(v.visitDate)}</TableCell>
                  <TableCell>
                    <Badge variant={v.status === 'Checked In' ? 'default' : 'secondary'} className="text-xs">
                      {v.status === 'Checked In' ? <CircleDot className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}{v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditDialog('visitor', v)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteVisitor(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVisitors.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No visitor records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )

  // ==================== DIALOGS ====================
  const FormField = ({ label, name, type = 'text', required = false, placeholder = '' }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} {required && <span className="text-destructive">*</span>}</Label>
      {type === 'select' ? (
        <Select value={String(formData[name] || '')} onValueChange={(v) => setFormData({ ...formData, [name]: v })}>
          <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
          <SelectContent>
            {name === 'roomType' && ['Standard', 'Deluxe', 'Premium'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'status' && ['Available', 'Occupied', 'Maintenance'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'studentStatus' && ['Active', 'Inactive', 'Graduated'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'roomId' && <><SelectItem value="none">Unassigned</SelectItem>{rooms.filter(r => r.status === 'Available' || r.id === formData.roomId).map(r => <SelectItem key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType})</SelectItem>)}</>}
            {name === 'feeStudentId' && students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            {name === 'complaintStudentId' && students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            {name === 'visitorStudentId' && students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            {name === 'category' && ['Maintenance', 'IT Support', 'Housekeeping', 'Food', 'Security', 'Other'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'priority' && ['Low', 'Medium', 'High'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'complaintStatus' && ['Open', 'In Progress', 'Resolved', 'Closed'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'feeStatus' && ['Pending', 'Paid', 'Overdue'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'visitorStatus' && ['Checked In', 'Checked Out'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'paymentMethod' && ['UPI', 'Cash', 'Bank Transfer', 'Card', 'Online'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'type' && ['Monthly', 'One-time', 'Annual'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            {name === 'month' && ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea id={name} value={String(formData[name] || '')} onChange={(e) => setFormData({ ...formData, [name]: e.target.value })} placeholder={placeholder} rows={3} />
      ) : (
        <Input id={name} type={type} value={String(formData[name] || '')} onChange={(e) => setFormData({ ...formData, [name]: type === 'number' ? Number(e.target.value) : e.target.value })} placeholder={placeholder} />
      )}
    </div>
  )

  const RoomDialog = () => (
    <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          <DialogDescription>{editMode ? 'Update room details' : 'Add a new room to the hostel'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <FormField label="Room Number" name="roomNumber" required placeholder="e.g., 101" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Floor" name="floor" type="number" />
            <FormField label="Capacity" name="capacity" type="number" />
          </div>
          <FormField label="Room Type" name="roomType" type="select" />
          <FormField label="Price (INR)" name="price" type="number" required placeholder="3000" />
          <FormField label="Status" name="status" type="select" />
          <FormField label="Amenities" name="amenities" type="textarea" placeholder="WiFi, AC, Attached Bathroom" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRoom} className="bg-amber-600 hover:bg-amber-700 text-white">{editMode ? 'Update' : 'Add'} Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const StudentDialog = () => (
    <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogDescription>{editMode ? 'Update student information' : 'Register a new student'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <FormField label="Full Name" name="name" required placeholder="Enter full name" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" name="email" type="email" required placeholder="student@email.com" />
            <FormField label="Phone" name="phone" required placeholder="9876543210" />
          </div>
          <FormField label="Address" name="address" type="textarea" placeholder="Full address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Guardian Name" name="guardianName" placeholder="Guardian's name" />
            <FormField label="Guardian Phone" name="guardianPhone" placeholder="Guardian's phone" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Course" name="course" placeholder="e.g., B.Tech CSE" />
            <FormField label="Status" name="studentStatus" type="select" />
          </div>
          <FormField label="Assign Room" name="roomId" type="select" placeholder="Select a room" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { const data = { ...formData }; if (data.roomId === 'none') data.roomId = ''; if (data.studentStatus) { data.status = data.studentStatus; delete data.studentStatus; } setFormData(data); handleSaveStudent(); }} className="bg-amber-600 hover:bg-amber-700 text-white">{editMode ? 'Update' : 'Add'} Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const FeeDialog = () => (
    <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Fee' : 'Add Fee Record'}</DialogTitle>
          <DialogDescription>{editMode ? 'Update fee details' : 'Create a new fee record'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <FormField label="Student" name="feeStudentId" type="select" required />
          <FormField label="Amount (INR)" name="amount" type="number" required />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" name="type" type="select" />
            <FormField label="Status" name="feeStatus" type="select" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Month" name="month" type="select" />
            <FormField label="Year" name="year" type="number" />
          </div>
          <FormField label="Due Date" name="dueDate" type="date" />
          {String(formData.status || formData.feeStatus) === 'Paid' && (
            <>
              <FormField label="Payment Date" name="paymentDate" type="date" />
              <FormField label="Payment Method" name="paymentMethod" type="select" />
              <FormField label="Transaction ID" name="transactionId" placeholder="TXN..." />
            </>
          )}
          <FormField label="Notes" name="notes" type="textarea" placeholder="Any additional notes" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setFeeDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { const data = { ...formData }; if (data.feeStudentId) { data.studentId = data.feeStudentId; delete data.feeStudentId; } if (data.feeStatus) { data.status = data.feeStatus; delete data.feeStatus; } setFormData(data); handleSaveFee(); }} className="bg-amber-600 hover:bg-amber-700 text-white">{editMode ? 'Update' : 'Add'} Fee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const ComplaintDialog = () => (
    <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Complaint' : 'File New Complaint'}</DialogTitle>
          <DialogDescription>{editMode ? 'Update complaint details' : 'Submit a new complaint'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <FormField label="Student" name="complaintStudentId" type="select" required />
          <FormField label="Subject" name="subject" required placeholder="Brief subject" />
          <FormField label="Description" name="description" type="textarea" required placeholder="Detailed description" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" name="category" type="select" />
            <FormField label="Priority" name="priority" type="select" />
          </div>
          <FormField label="Status" name="complaintStatus" type="select" />
          {String(formData.status || formData.complaintStatus) === 'Resolved' && (
            <FormField label="Resolution" name="resolution" type="textarea" placeholder="How was it resolved?" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setComplaintDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { const data = { ...formData }; if (data.complaintStudentId) { data.studentId = data.complaintStudentId; delete data.complaintStudentId; } if (data.complaintStatus) { data.status = data.complaintStatus; delete data.complaintStatus; } setFormData(data); handleSaveComplaint(); }} className="bg-amber-600 hover:bg-amber-700 text-white">{editMode ? 'Update' : 'Submit'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const VisitorDialog = () => (
    <Dialog open={visitorDialogOpen} onOpenChange={setVisitorDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Visitor' : 'Register New Visitor'}</DialogTitle>
          <DialogDescription>{editMode ? 'Update visitor details' : 'Register a visitor entry'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <FormField label="Student Being Visited" name="visitorStudentId" type="select" required />
          <FormField label="Visitor Name" name="visitorName" required placeholder="Full name" />
          <FormField label="Visitor Phone" name="visitorPhone" placeholder="Phone number" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Relation" name="relation" placeholder="e.g., Father" />
            <FormField label="Purpose" name="purpose" placeholder="e.g., Meeting" />
          </div>
          <FormField label="Visit Date" name="visitDate" type="date" />
          <FormField label="Status" name="visitorStatus" type="select" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setVisitorDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { const data = { ...formData }; if (data.visitorStudentId) { data.studentId = data.visitorStudentId; delete data.visitorStudentId; } if (data.visitorStatus) { data.status = data.visitorStatus; delete data.visitorStatus; } setFormData(data); handleSaveVisitor(); }} className="bg-amber-600 hover:bg-amber-700 text-white">{editMode ? 'Update' : 'Register'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const ViewDialog = () => {
    if (viewType === 'student') {
      const s = viewData as Student
      return (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">{s.name.split(' ').map(n => n[0]).join('')}</div>
                {s.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{s.email}</p></div></div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"><Phone className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{s.phone}</p></div></div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"><BookOpen className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Course</p><p className="font-medium">{s.course}</p></div></div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"><BedDouble className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Room</p><p className="font-medium">{s.room ? `Room ${s.room.roomNumber} (${s.room.roomType})` : 'Unassigned'}</p></div></div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"><Shield className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Guardian</p><p className="font-medium">{s.guardianName || 'N/A'}</p><p className="text-xs text-muted-foreground">{s.guardianPhone}</p></div></div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Admission Date</p><p className="font-medium">{fmt(s.admissionDate)}</p></div></div>
              </div>
              {s.address && <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /><div><p className="text-xs text-muted-foreground">Address</p><p className="font-medium">{s.address}</p></div></div>}
              <div className="flex items-center justify-between mt-2">
                <Badge variant={s.status === 'Active' ? 'default' : 'secondary'} className="px-3 py-1">{s.status}</Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
    const r = viewData as Room
    return (
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">{r.roomNumber}</div>
              Room {r.roomNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{r.roomType}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Floor</p><p className="font-medium">{r.floor}</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Capacity</p><p className="font-medium">{r.capacity} beds</p></div>
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Rent</p><p className="font-semibold text-amber-700">{fmtCurrency(r.price)}/mo</p></div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Amenities</p><p className="font-medium">{r.amenities || 'None specified'}</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Status</p><Badge variant={r.status === 'Occupied' ? 'default' : 'secondary'}>{r.status}</Badge></div>
            {r.students && r.students.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground mb-2">Current Occupants ({r.students.length}/{r.capacity})</p>
                {r.students.map(s => <p key={s.id} className="text-sm font-medium">• {s.name} ({s.course})</p>)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="animate-spin h-10 w-10 border-3 border-amber-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm">Loading BRB Hotels...</p>
        </div>
      </div>
    )
    switch (activeNav) {
      case 'dashboard': return renderDashboard()
      case 'rooms': return renderRooms()
      case 'students': return renderStudents()
      case 'fees': return renderFees()
      case 'complaints': return renderComplaints()
      case 'visitors': return renderVisitors()
      default: return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Hotel className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-sm">BRB Hotels</span>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">Bell Road Baazigar</Badge>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Overlay (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-sidebar text-sidebar-foreground z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
          {/* Brand */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">BRB Hotels</h1>
                <p className="text-[11px] text-sidebar-foreground/60 tracking-wider uppercase">Bell Road Baazigar</p>
              </div>
            </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scroll">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto text-sidebar-primary" />}
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">manager@brbhotels.com</p>
              </div>
              <LogOut className="h-4 w-4 text-sidebar-foreground/40 cursor-pointer hover:text-sidebar-foreground/70 transition-colors" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNav}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t bg-card/50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
              <p>&copy; 2026 BRB Hotels — Bell Road Baazigar. All rights reserved.</p>
              <p className="hidden sm:block">Hostel Management System v1.0</p>
            </div>
          </footer>
        </main>
      </div>

      {/* Dialogs */}
      <RoomDialog />
      <StudentDialog />
      <FeeDialog />
      <ComplaintDialog />
      <VisitorDialog />
      <ViewDialog />
    </div>
  )
}