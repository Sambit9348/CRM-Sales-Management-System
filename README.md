# CRM Sales Management System 🚀

> **Full-Stack MERN Technical Assessment Implementation**

A production-ready **CRM Sales Management System** built with **MongoDB, Express.js, React 18, Node.js, Redux Toolkit (RTK Query), and TypeScript**. This application powers the end-to-end sales workflow from lead capture to deal closure, complete with role-based access control (RBAC), executive analytics dashboard, automated activity tracking, timeline history, and real-time notifications.

---

## 📑 Table of Contents

1. [Key Features & Capabilities](#-key-features--capabilities)
2. [User Roles & Test Credentials](#-user-roles--test-credentials)
3. [Architecture & Tech Stack](#-architecture--tech-stack)
4. [Business Rules & Assumptions](#-business-rules--assumptions)
5. [Setup & Local Installation](#-setup--local-installation)
6. [Environment Variables](#-environment-variables)
7. [API Endpoints Overview](#-api-endpoints-overview)
8. [Candidate Assessment Checklist](#-candidate-assessment-checklist)

---

## 🌟 Key Features & Capabilities

### 1. 👥 Role-Based Authentication & Access Control (RBAC)
- **Role Permissions**: Admin, Sales Manager, and Sales Executive.
- **Frontend Route Protection**: Dynamic layout rendering and route guards.
- **Backend API Protection**: Enforcement of token verification (`JWT`) and strict role permissions on both controller and service query levels.

### 2. 📇 Lead Management
- **Lead Capture Sources**: Website, Referral, Social Media, Email, Phone.
- **Lead Lifecycle**: Manage lead statuses (`NEW`, `CONTACTED`, `QUALIFIED`, `UNQUALIFIED`, `LOST`) and priorities (`LOW`, `MEDIUM`, `HIGH`).
- **Assignment & Reassignment**: Managers and Admins can reassign leads with logged reasons.
- **Notes & Discussions**: Attach timestamped user notes directly to leads.
- **Server-Side Operations**: Search across name/email/company, filter by status/priority/source/assignee/date range, sort, and paginate.

### 3. 🔄 Lead-to-Customer Conversion
- **Seamless 1-Click Conversion**: Converts qualified leads into a `Customer` record and creates an initial `Deal` simultaneously.
- **Data Integrity & Duplicate Prevention**: Backend validation prevents double conversion of already converted leads.
- **History Preservation**: Preserves original lead context while establishing relational links to Customer and Deal entities.

### 4. 📊 Deal Management & Pipeline
- **Pipeline Stages**: `Qualification` → `Discovery` → `Proposal` → `Negotiation` → `Won` / `Lost`.
- **Financial Calculations**: Real-time expected revenue calculation (`Deal Value × Probability %`).
- **Stage Transition Rules**: Enforces valid stage sequence transitions.
- **Closure Rules**: Closing as `Won` automatically locks probability at 100%; closing as `Lost` records mandatory loss reason and resets probability to 0%.

### 5. 📅 Follow-Up Activities & Timeline History
- **Activity Tracking**: Schedule Calls, Emails, Meetings, Demos, and Reminders.
- **Automated Overdue Status**: System auto-updates pending activities past due date to `OVERDUE`.
- **Entity Timelines**: Detailed history audit log attached to Lead, Customer, and Deal details showing creation, status/priority changes, assignments, notes, conversions, and deal closures.

### 6. 📈 Executive Dashboard & Sales Analytics
- **KPI Metrics**: Total/New/Qualified/Converted leads, conversion rates, total pipeline value, won revenue, expected revenue, and overdue activities.
- **Visual Breakdown**: Pipeline stage distribution bar chart & Lead source breakdown.
- **Team Performance Matrix**: Available for Admins & Managers to benchmark sales executive performance.

### 7. 🔔 Notifications System
- Automatic system notifications generated for key events:
  - Lead assignment / reassignment
  - Deal assignment & stage updates
  - Lead conversion
  - Upcoming and overdue follow-up alerts

---

## 🔑 User Roles & Test Credentials

The system includes pre-seeded test accounts for evaluating different permission levels:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `Admin@123` | Full access across system, user management, global analytics |
| **Sales Manager** | `manager@crm.com` | `Manager@123` | Team performance dashboard, lead/deal reassignment, full view |
| **Sales Executive** | `executive1@crm.com` | `Executive@123` | Manages assigned leads, deals, customers & activities |
| **Sales Executive** | `executive2@crm.com` | `Executive@123` | Manages assigned leads, deals, customers & activities |
| **Sales Executive** | `executive3@crm.com` | `Executive@123` | Manages assigned leads, deals, customers & activities |

> 💡 **Auto-Seeding**: Upon starting the backend server with an empty database, demo data for users, leads, customers, deals, activities, timelines, and notifications will be auto-seeded automatically!

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Node.js & Express.js** (TypeScript)
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT & Bcrypt password hashing
- **Architecture**: Controller-Service-Model design pattern with custom error handling middleware

### Frontend
- **React 18** (TypeScript, Vite)
- **State Management**: Redux Toolkit & RTK Query (API caching & auto-invalidation tags)
- **Styling**: Tailwind CSS & Lucide Icons
- **UI Components**: Reusable Modals, Pagination controls, Toast alerts, Responsive Navigation

---

## ⚙️ Business Rules & Assumptions

1. **Sales Executive Data Isolation**: Sales Executives can only view, edit, and update leads, deals, customers, and activities assigned to them. Managers and Admins have organization-wide visibility.
2. **Reassignment Authority**: Only Admins and Sales Managers can reassign leads and deals to other team members.
3. **Stage Transitions**: Deal stage updates strictly adhere to the transition matrix. Reopening won or lost deals resets probability based on target pipeline stage.
4. **Duplicate Lead Conversion**: Backend throws HTTP 400 if conversion is attempted on an already converted lead.
5. **Expected Revenue Calculation**: `expectedRevenue = Math.round(dealValue * (probability / 100) * 100) / 100`.

---

## 🚀 Quick Start / Local Development

### 1. Install Dependencies
Run from the root directory:
```bash
# Install root, backend, and frontend packages
npm install
npm run install:all
```

### 2. Start Both Frontend & Backend (One Command)
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173` (with Vite HMR and API proxy)

---

## 🌐 Render Deployment Guide (Single Web Service)

Deploy the entire fullstack application (Backend API + React Frontend) in **one single Web Service** on Render:

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your repository: `CRM-Sales-Management-System`.
3. Configure the settings:
   - **Root Directory**: *(Leave completely blank / empty)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/crm_sales_management?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_key`
   - `JWT_EXPIRES_IN`: `7d`
5. Click **Deploy Web Service**.

---

## 🔐 Environment Variables Reference

| Variable Name | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string (Atlas or local instance) | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/crm_sales_management` |
| `JWT_SECRET` | Secret key for signing Auth JWT tokens | `your_jwt_secret_key_here` |
| `JWT_EXPIRES_IN` | Token expiration timeframe | `7d` |
| `CLIENT_URL` | Frontend origin URL allowed by CORS | `http://localhost:5173` |


---

## 📡 API Endpoints Overview

- `POST /api/auth/login` — User authentication
- `GET /api/auth/me` — Current user profile
- `GET /api/leads` — List leads (search, filter, sort, paginate)
- `POST /api/leads` — Create new lead
- `PUT /api/leads/:id` — Update lead details
- `PUT /api/leads/:id/assign` — Assign/reassign lead (Manager/Admin)
- `POST /api/leads/:id/notes` — Add note to lead
- `POST /api/leads/:id/convert` — Convert lead to customer & deal
- `GET /api/deals` — List deals with filter/sort/pagination
- `PUT /api/deals/:id/stage` — Update deal pipeline stage
- `GET /api/customers` — List customers
- `GET /api/activities` — List & filter follow-up activities
- `POST /api/activities` — Create follow-up activity
- `PUT /api/activities/:id` — Update activity status
- `GET /api/dashboard` — Get dashboard metrics & team performance
- `GET /api/notifications` — Fetch user notifications
- `GET /api/timeline/:entityType/:entityId` — Fetch entity timeline history

---

## ✅ Candidate Assessment Checklist

- [x] CRM application implemented
- [x] Role-based login and access control (Admin, Manager, Executive)
- [x] Lead management completed (Website, Referral, Social Media, Email, Phone)
- [x] Lead-to-customer conversion completed with duplicate prevention
- [x] Deal pipeline implemented with stage transition validation
- [x] Activities and timeline implemented
- [x] Dashboard and sales analytics implemented
- [x] Search, filter, sort, and pagination implemented
- [x] Backend validation and business rules enforced
- [x] Redux Toolkit & RTK Query state management implemented
- [x] README and setup documentation included
- [x] Test credentials and environment variables documented