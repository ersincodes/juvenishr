This is a Reporting Dashboard built with Next.js, Tailwind, NextAuth, and MongoDB.

## Getting Started

Setup:

1. Configure environment variables (create `.env.local`):

```
MONGODB_URI=mongodb://127.0.0.1:27017/juvenishr
MONGODB_DB=juvenishr
NEXTAUTH_SECRET=replace-with-a-long-random-string
NEXTAUTH_URL=http://localhost:3000
```

2. Install deps and run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

Auth pages: `/login`, `/signup`. Protected dashboard: `/dashboard`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Notes

- Data is fetched via server route `/api/jobs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` which proxies `https://juvenis.net/tr/jobjson/63kf52ur8x4rw7go/${startDate}/${endDate}`.
- Column visibility is persisted per user at `/api/users/:userId/settings`.
- Set your `MONGODB_URI` before running.
