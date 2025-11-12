# Reporting Dashboard — Requirements & Development Plan

## Project Overview

Build a full‑stack **Reporting Dashboard** using **Next.js (latest)** with a MongoDB backend. The app provides: sign up / login, user‑scoped preferences, and a data‑driven dashboard that fetches records from an external API and displays interactive widgets and a datatable.

The external data source (time‑range based) is:

```
https://juvenis.net/tr/jobjson/63kf52ur8x4rw7go/${startDate}/${endDate}
```

`startDate` and `endDate` are URL path parameters and will be provided by the client (selected date range).

---

## Goals / Key Features

1. Authentication

   - Sign up and Login pages.
   - Protect dashboard routes server‑side (SSR/SSG) or via client redirect.
   - Session persistence.

2. Data Integration

   - Fetch data from the given API using the user‑chosen `startDate` and `endDate`.
   - Analyze the returned dataset and surface metrics via widgets.

3. Dashboard UI

   - Metric widgets (cards): totals, averages, counts, trends, top‑N, etc.
   - DataTable: shows raw rows returned from the API.
   - Columns are removable/hidden by the user — default: all shown.
   - User column preferences are persisted (saved per `userId` in MongoDB).
   - Date range selector to control the API request.
   - Chip filter (multi‑value quick filters) integrated to filter the table and widgets.

4. User Settings

   - Save visible columns per user.
   - Option to restore defaults.

5. UX

   - Responsive layout.
   - Loading / error states.
   - Export (CSV/Excel) — optional.

6. Security

   - Sanitize and validate dates before calling the external API.
   - Rate‑limit or debounce calls when user changes date range.
   - Store secrets (DB URI, any API secrets) in environment variables.

---

## Tech Stack (recommended)

- Frontend / Fullstack: **Next.js (latest)** — App Router or Pages Router (choose one; App Router recommended).
- Styling: Tailwind CSS
- Auth: **NextAuth.js**
- Database: **MongoDB** (Atlas or self‑hosted) with **Mongoose**.
- HTTP client: `fetch` (native) or `axios`.
- Charts: Chart.js
- Data grid: TanStack Table (React Table)

---

## Data Flow and Architecture

1. Client selects `startDate` and `endDate`.
2. Client calls an internal API route (e.g. `/api/jobs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`).
3. Server API route validates inputs, calls external API `https://juvenis.net/tr/jobjson/...`, receives JSON, optionally transforms it, and sends result to client.
4. Client receives rows and:

   - Renders DataTable.
   - Computes metrics for widgets.
   - Applies client‑side filters (chip filters) and column visibility.

5. Column visibility changes are saved with a POST/PUT to `/api/users/{userId}/settings` in MongoDB.

**Why route via your server?**

- Hides the external API key or prevents CORS issues.
- Lets you cache/transform data and apply server‑side validation.

---

## API Endpoints (suggested)

```
GET /api/jobs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  - Validates dates
  - Calls external API
  - Returns { data: [...rows] }

GET /api/users/:userId/settings
  - Returns settings (visibleColumns, other prefs)

PUT /api/users/:userId/settings
  - Body: { visibleColumns: ["colA","colB", ...] }
  - Persists settings to MongoDB
```

---

## MongoDB Schemas (example)

```js
// users collection (auth may supply UID)
{
  _id: ObjectId,
  authId: String, // from NextAuth/Clerk
  email: String,
  createdAt: Date
}

// user_settings collection
{
  _id: ObjectId,
  authId: String,
  visibleColumns: [String],
  lastUpdated: Date
}
```

---

## Frontend Components & Pages

- `/pages/signup` or `/app/signup` — Sign up page
- `/pages/login` or `/app/login` — Login page
- `/app/dashboard` — Main dashboard (protected)

  - `DateRangePicker` — selects start / end
  - `ChipFilter` — chips for quick filtering
  - `MetricsBar` — collection of widget cards
  - `DataTable` — configurable columns with hide/show
  - `ColumnsSettingsModal` — toggle visible columns

---

## Column Visibility & Persistence - Flow

1. On first login, load `GET /api/users/:userId/settings`.
2. If no settings, default to showing all columns (you can compute columns from the first row keys).
3. When user toggles columns, update local state immediately for UX and `PUT` the settings to the server.
4. On subsequent logins, apply saved `visibleColumns`.

**Edge cases**

- If the external dataset contains new columns, merge them into defaults when user has no saved settings.
- If a saved column is not present in the current dataset, simply ignore it.

---

## Date Range & Chip Filter Behavior

- Date Range Picker limits:

  - Max range (e.g., 90 days) — configurable.
  - Validate `startDate <= endDate`.

- Chip Filter examples: `status:open`, `priority:high`, `source:web`.
- Chips should be combinable (AND/OR) — implement AND semantics initially.
- Filtering can be done client‑side after fetching the API data, but for large datasets consider server‑side filtering or pagination.

---

## Sample Server API Route (Next.js) — pseudo

```js
// pages/api/jobs.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  const { startDate, endDate } = req.query;
  // validate YYYY-MM-DD format
  // sanitize input
  const url = `https://juvenis.net/tr/jobjson/63kf52ur8x4rw7go/${startDate}/${endDate}`;
  const response = await fetch(url);
  if (!response.ok)
    return res.status(502).json({ error: "external api error" });
  const data = await response.json();
  // optional: transform data
  return res.status(200).json({ data });
}
```

---

## Metrics to Compute (examples)

- Total records in range
- Counts by status / category
- Average value of a numeric column
- Trend: daily counts (time series)
- Top 5 items by any numeric metric

Widgets should be recomputed when filters or date range change.

---

## UX & Performance Considerations

- Debounce date changes (300–500ms).
- Show skeletons while loading.
- Cache recent queries server‑side (in‑memory or Redis) to avoid re‑requesting same range.
- Paginate the table if dataset large.

---

## Testing & Acceptance Criteria

1. Authentication flow works (signup, login, protected dashboard).
2. Given a valid date range, `/api/jobs` returns data and dashboard renders.
3. Users can hide/show columns and the choice persists across sessions.
4. Chip filters narrow the dataset and update widgets accordingly.
5. Validation prevents invalid date input.

---

## Optional Enhancements

- Export filtered table to CSV.
- Scheduled background fetch & caching for long ranges.
- Role‑based features (admins vs normal users).
- Realtime updates with WebSockets if the external source pushes changes.

---

## Implementation Steps (rough roadmap)

1. Initialize Next.js project + Tailwind.
2. Add auth (NextAuth or Clerk).
3. Setup MongoDB and user settings schema.
4. Implement `/api/jobs` proxy route with validation.
5. Create dashboard page skeleton and date picker.
6. Fetch data and display DataTable and simple metric cards.
7. Implement column visibility and persistence.
8. Add chip filters and refine UX.
9. Add caching, pagination, and export.
10. Testing and deployment (Vercel recommended).

---

## Notes / Assumptions

- The external endpoint returns JSON array of objects. If the shape differs, adapt parsing.
- No external API key is required (if required, store it in env vars and call server‑side).
- `userId` refers to your auth provider's unique identifier.

---

If you want, I can also:

- Provide a starter Next.js file structure and minimal working example for the API route and the DataTable.
- Generate the Mongoose/Prisma schemas.
- Generate example React components (DateRangePicker, DataTable) wired up to the API.

Tell me which of the above you'd like next and I will scaffold it.
