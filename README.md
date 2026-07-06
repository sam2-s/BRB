# BRB Hotels — Bell Road Baazigar

A complete **Hostel Management System** built with modern web technologies. Manage rooms, students, fee payments, complaints, and visitor records — all from one beautiful dashboard.

> **BRB** stands for **Bell Road Baazigar**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)

---

## Features

### 📊 Dashboard
- Real-time stats: total students, occupancy rate, revenue, pending fees
- Room type breakdown with progress bars
- Recent student registrations
- Latest complaints feed

### 🛏️ Room Allocation
- Add, edit, delete rooms
- Room cards with status (Available / Occupied / Maintenance)
- Floor-wise organization (Standard, Deluxe, Premium)
- View room details with current occupants
- Automatic status updates when students are assigned/removed

### 👥 Student Details
- Full CRUD for student records
- Assign rooms during admission
- View detailed student profile (contact, guardian, course, room)
- Search by name, email, or phone
- Status tracking (Active, Inactive, Graduated)

### 💳 Fee Payment
- Track monthly/one-time/annual fee payments
- Status management: Pending, Paid, Overdue
- Payment method and transaction ID tracking
- Summary cards: total collected, pending amount, total records
- INR currency formatting

### 📝 Complaint System
- File and manage student complaints
- Categories: Maintenance, IT Support, Housekeeping, Food, Security, Other
- Priority levels: Low, Medium, High
- Status tracking: Open → In Progress → Resolved → Closed
- Resolution notes for closed complaints

### 🏷️ Visitor Records
- Register visitors with check-in/check-out
- Track relation and purpose of visit
- Status: Checked In / Checked Out
- Search by visitor or student name

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite via Prisma ORM |
| Animations | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| State | React hooks + fetch API |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/brb-hotels.git
cd brb-hotels

# Install dependencies
npm install
# or: bun install

# Set up database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Load Sample Data

On first launch, click the **"Load Sample Data"** button on the dashboard to populate the database with demo rooms, students, fees, complaints, and visitors.

---

## Project Structure

```
brb-hotels/
├── prisma/
│   └── schema.prisma          # Database schema (5 models)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Main SPA (all sections)
│   │   ├── globals.css        # Amber/gold hotel theme
│   │   └── api/
│   │       ├── rooms/         # Room CRUD
│   │       ├── students/      # Student CRUD
│   │       ├── fees/          # Fee CRUD
│   │       ├── complaints/    # Complaint CRUD
│   │       ├── visitors/      # Visitor CRUD
│   │       ├── dashboard/     # Dashboard stats
│   │       └── seed/          # Sample data seeder
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/
│   │   └── use-toast.ts       # Toast notification hook
│   └── lib/
│       ├── db.ts              # Prisma client
│       └── utils.ts           # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .gitignore
```

---

## Database Models

```
Room          ──→  Student  ──→  Fee
                    │
                    ├──→  Complaint
                    │
                    └──→  Visitor
```

| Model | Key Fields |
|-------|-----------|
| **Room** | roomNumber, floor, capacity, roomType, price, status, amenities |
| **Student** | name, email, phone, course, guardianName, roomId (FK) |
| **Fee** | studentId (FK), amount, month, year, status, paymentMethod |
| **Complaint** | studentId (FK), subject, category, priority, status, resolution |
| **Visitor** | studentId (FK), visitorName, relation, purpose, checkIn, checkOut |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/rooms` | List / Create rooms |
| PUT | `/api/rooms` | Update room |
| DELETE | `/api/rooms?id=` | Delete room |
| GET/POST | `/api/students` | List / Create students |
| PUT | `/api/students` | Update student |
| DELETE | `/api/students?id=` | Delete student |
| GET/POST | `/api/fees` | List / Create fees |
| PUT | `/api/fees` | Update fee |
| DELETE | `/api/fees?id=` | Delete fee |
| GET/POST | `/api/complaints` | List / Create complaints |
| PUT | `/api/complaints` | Update complaint |
| DELETE | `/api/complaints?id=` | Delete complaint |
| GET/POST | `/api/visitors` | List / Create visitors |
| PUT | `/api/visitors` | Update visitor |
| DELETE | `/api/visitors?id=` | Delete visitor |
| GET | `/api/dashboard` | Dashboard statistics |
| POST | `/api/seed` | Seed sample data |

---

## Scripts

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

---

## License

MIT License — feel free to use this project for your hostel, PG, or hotel management needs.

---

<p align="center">
  Built with ❤️ by <strong>BRB Hotels — Bell Road Baazigar</strong>
</p>