# 🧭 Reporting Dashboard

A full-stack reporting dashboard built with **Next.js (latest)** and **MongoDB**, designed to visualize and analyze data fetched from an external API within a selected date range.  

Users can sign up, log in, view dashboards, and customize which columns to display in a data table — preferences are saved per user.

---

## 🚀 Features

- **User Authentication**
  - Sign up / login flow
  - Protected dashboard route
  - Session persistence (via Clerk or NextAuth)

- **Dynamic Data Fetching**
  - Controlled by user’s selected date range
  - Server-side proxy API for validation and transformation

- **Interactive Dashboard**
  - KPI widgets with real-time calculations
  - Filterable and sortable data table
  - Column visibility toggle — user can choose which columns to display
  - Date range selector and chip filters for quick filtering
  - User preferences (visible columns, filters) saved to MongoDB

- **User Settings**
  - Each user’s dashboard layout and visible columns persist across sessions

- **Responsive Design**
  - Fully responsive layout built with Tailwind CSS
  - Optimized for both desktop and mobile

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | [Next.js (latest)](https://nextjs.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Auth | [Clerk](https://clerk.com/) or [NextAuth.js](https://next-auth.js.org/) |
| Database | [MongoDB](https://www.mongodb.com/) |
| ORM / ODM | [Mongoose](https://mongoosejs.com/) or [Prisma](https://www.prisma.io/) |
| Charts | [Recharts](https://recharts.org/) or [Chart.js](https://www.chartjs.org/) |
| Data Table | [Mantine DataTable](https://mantine.dev/) or [TanStack Table](https://tanstack.com/table) |

---

## 🧠 Architecture Overview

1. **Client** selects a date range and triggers data fetch.
2. **Server API Route** (`/api/jobs`) validates and requests data from the external API.
3. The **backend** caches or transforms the result (optional) and returns it to the frontend.
4. **Frontend Dashboard** displays:
   - KPI widgets
   - Data table (filterable, customizable)
   - Column preferences saved per user (`/api/users/:userId/settings`)

---

## 📦 Project Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/reporting-dashboard.git
cd reporting-dashboard
