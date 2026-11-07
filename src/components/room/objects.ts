import type { RepoKey } from "../../lib/numbers";

export type RoomObjectId = "rack" | "matrix" | "xchart" | "query" | "photo" | "window";

export type RoomObject = {
  id: RoomObjectId;
  label: string;
  status: string;
  /** Shown instead of status in day mode. */
  dayStatus?: string;
  blurb: string;
  href: string | null;
  repo?: RepoKey;
};

export const roomObjects: RoomObject[] = [
  {
    id: "rack",
    label: "Server rack: the trading platform",
    status: "running 24/7",
    blurb: "40+ Python processes under PM2 on one Linux server, Postgres underneath. Demo accounts.",
    href: "/work/trading-platform",
    repo: "v1",
  },
  {
    id: "matrix",
    label: "Left screen: Matrix",
    status: "live",
    blurb: "The rewrite: one TypeScript process, one Postgres/TimescaleDB, DR built in.",
    href: "/work/matrix",
    repo: "matrix",
  },
  {
    id: "xchart",
    label: "Right screen: XcHart",
    status: "live · private",
    blurb: "A streaming charting app behind a login. Screenshots use simulated data.",
    href: "/work/xchart",
    repo: "xchart",
  },
  {
    id: "query",
    label: "Query, the database on the shelf: my day job",
    status: "on duty since Dec 2025",
    blurb: "My day job: SQL Server DBA at Megamax Services.",
    href: "/#job",
  },
  {
    id: "photo",
    label: "Photo of me: about",
    status: "Noida, India",
    blurb: "About me.",
    href: "/#about",
  },
  {
    id: "window",
    label: "Switch day and night",
    status: "23:00",
    dayStatus: "09:00",
    blurb: "The window. Click it to switch between night and day.",
    href: null,
  },
];

export const objectById = (id: RoomObjectId): RoomObject => roomObjects.find((o) => o.id === id)!;
