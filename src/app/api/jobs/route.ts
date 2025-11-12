import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EXTERNAL_BASE = "https://www.juvenis.net/tr/jobjson/63kf52ur8x4rw7go";
const DATE_DASHED = /^\d{4}-\d{2}-\d{2}$/;
const DATE_COMPACT = /^\d{8}$/;

const normalizeDate = (value: string | null): string | null => {
  if (!value) return null;
  if (DATE_DASHED.test(value)) return value.replace(/-/g, "");
  if (DATE_COMPACT.test(value)) return value;
  return null;
};

const formatCompactDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const v = String(value);
  if (!DATE_COMPACT.test(v)) return null;
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
};

const formatDateTime = (value: string | null | undefined): string | null => {
  if (!value) return null;
  // Expecting "YYYY-MM-DD HH:mm:ss" or similar; keep date and HH:mm
  const parts = String(value).split(" ");
  if (!parts.length) return null;
  const date = parts[0];
  const time = parts[1]?.slice(0, 5);
  return time ? `${date} ${time}` : date;
};

type UpstreamRow = {
  name?: string | null;
  semt?: string | null;
  city_name?: string | null;
  actual_link?: string | null;
  email?: string | null;
  phone?: string | null;
  special_note?: string | null;
  read_statue?: number | null;
  source_name?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  realid?: number | null;
  phonestatuename?: string | null;
  phone_date?: string | null;
  facetofacestatuename?: string | null;
  facetoface_date?: string | null;
  documentstatuename?: string | null;
  document_date?: string | null;
  jobstatuename?: string | null;
  job_statue_date?: string | null;
  job_exit_date?: string | null;
  level_name?: string | null;
  dealer_name?: string | null;
  realdate?: string | null;
  point?: number | null;
  totalview?: number | null;
  totalmeetingview?: number | null;
  totaljobmeetingview?: number | null;
};

const transformRow = (raw: Partial<UpstreamRow>): Record<string, unknown> => {
  // Curated, readable, and formatted fields only
  return {
    Name: raw.name ?? null,
    Phone: raw.phone ?? null,
    Email: raw.email ?? null,
    City: raw.city_name ?? null,
    District: raw.semt ?? null,
    Source: raw.source_name ?? null,
    "Phone Status": raw.phonestatuename ?? null,
    "Phone Date": formatCompactDate(raw.phone_date),
    "F2F Status": raw.facetofacestatuename ?? null,
    "F2F Date": formatCompactDate(raw.facetoface_date),
    "Docs Status": raw.documentstatuename ?? null,
    "Docs Date": formatCompactDate(raw.document_date),
    "Job Status": raw.jobstatuename ?? null,
    "Job Date": formatCompactDate(raw.job_statue_date),
    "Job Exit": formatCompactDate(raw.job_exit_date),
    Level: raw.level_name ?? null,
    Dealer: raw.dealer_name ?? null,
    "Submitted At": formatDateTime(raw.realdate),
    Views: raw.totalview ?? null,
    // Keep original link minimally
    "Form URL": raw.actual_link ?? null,
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDateRaw = searchParams.get("startDate");
  const endDateRaw = searchParams.get("endDate");

  const startDate = normalizeDate(startDateRaw);
  const endDate = normalizeDate(endDateRaw);

  if (!startDate || !endDate) {
    return NextResponse.json(
      {
        error:
          "Missing or invalid startDate/endDate. Expected YYYY-MM-DD or YYYYMMDD.",
      },
      { status: 400 }
    );
  }

  const url = `${EXTERNAL_BASE}/${startDate}/${endDate}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "External API error",
          upstreamStatus: res.status,
          upstreamBody: body,
        },
        { status: 502 }
      );
    }
    const upstream: unknown = await res.json();
    let rawArray: unknown[] = [];
    if (Array.isArray(upstream)) {
      rawArray = upstream;
    } else if (typeof upstream === "object" && upstream !== null) {
      const obj = upstream as Record<string, unknown>;
      const maybeData = obj["data"];
      if (Array.isArray(maybeData)) {
        rawArray = maybeData;
      }
    }
    const data = rawArray.map((r) =>
      transformRow((r as Partial<UpstreamRow>) ?? {})
    );
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Request failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}
