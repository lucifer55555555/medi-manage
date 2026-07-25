# MediManage-Suite

MediManage-Suite is a comprehensive Hospital Management System designed to streamline healthcare operations. It provides a robust platform for managing patient records, scheduling appointments, tracking bed availability, and monitoring medical inventory.

## 🚀 Features

- **Dashboard**: Real-time overview of hospital metrics, including active admissions, pending appointments, and bed occupancy.
- **Patient Management**: Centralized database for patient records, medical history, and contact information.
- **Appointment Scheduling**: Efficient OPD queue management and appointment booking with specific doctors.
- **Bed Tracking**: Monitor bed availability across different wards (ICU, General, Private) and manage patient admissions/discharges.
- **Inventory Management**: Track medical supplies and consumables with automated reorder alerts and expiry tracking.
- **Role-Based Access**: Secure authentication system for hospital staff.

## 🛠 Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI, TanStack Query, Wouter.
- **Backend**: Node.js, Express.
- **Database**: SQLite with Drizzle ORM.
- **State Management**: React Context / Hooks.
- **Validation**: Zod.

## 📂 Project Structure

```text
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Application pages (Dashboard, Patients, etc.)
│   │   └── lib/        # Utility functions (queryClient, api, etc.)
├── server/          # Express backend application
│   ├── index.ts     # Main server entry point
│   ├── routes.ts    # API route definitions
│   └── storage.ts   # Data persistence layer
├── shared/          # Shared types and schemas
│   └── schema.ts    # Drizzle schema and Zod types
└── d3rd-party/      # Configuration for various tools
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MediManage-Suite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`.

## 📜 Available Scripts

- `npm run dev`: Starts the development server for both frontend and backend.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run check`: Runs TypeScript type checking.
- `npm run db:push`: Pushes schema changes to the SQLite database.


