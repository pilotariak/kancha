export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
}

export interface MatchItem {
  id: string;
  stage: string;
  venue: string;
  datetime: string;
  status: "tomorrow" | "live" | "upcoming" | "final";
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
}

export interface StandingItem {
  id: string;
  rank: number;
  player: string;
  record: string;
  points: string;
}

export interface TournamentItem {
  id: string;
  name: string;
  city: string;
  dates: string;
  category: string;
  discipline: string;
  status: "ongoing" | "upcoming" | "completed";
  roundsLabel: string;
  teams: number;
  featuredMatch: string;
  featuredScore?: string;
  standings: StandingItem[];
}

export const dashboardMetrics: DashboardMetric[] = [
  { id: "matches", label: "Matches", value: "28" },
  { id: "tournaments", label: "Tournaments", value: "6" },
  { id: "wins", label: "Wins", value: "18" },
];

export const upcomingMatches: MatchItem[] = [
  {
    id: "m1",
    stage: "Elite Doubles",
    venue: "Fronton Biarritz",
    datetime: "Tomorrow · 15:00",
    status: "tomorrow",
    teamA: "Mikel E. / Jon U.",
    teamB: "Iker L. / Ander B.",
  },
  {
    id: "m2",
    stage: "Pool A · Round 3",
    venue: "Bayonne Municipal",
    datetime: "Today · 19:30",
    status: "live",
    teamA: "Ane D. / June H.",
    teamB: "Maialen R. / Oihana S.",
    scoreA: 18,
    scoreB: 16,
  },
  {
    id: "m3",
    stage: "Junior Final",
    venue: "Kanbo Arena",
    datetime: "Sat · 11:00",
    status: "upcoming",
    teamA: "Beñat A.",
    teamB: "Peio Z.",
  },
];

export const recentResults: MatchItem[] = [
  {
    id: "r1",
    stage: "Main nue · 18 Mar",
    venue: "Bilbao Fronton",
    datetime: "Finished",
    status: "final",
    teamA: "Mikel E.",
    teamB: "Iker L.",
    scoreA: 40,
    scoreB: 32,
  },
  {
    id: "r2",
    stage: "Chistera · 15 Mar",
    venue: "Saint-Jean-de-Luz",
    datetime: "Finished",
    status: "final",
    teamA: "Ane D.",
    teamB: "June H.",
    scoreA: 35,
    scoreB: 27,
  },
];

export const tournaments: TournamentItem[] = [
  {
    id: "txapelketa-2026",
    name: "Txapelketa 2026",
    city: "Bayonne",
    dates: "12 Apr — 22 Jun 2026",
    category: "Senior Elite",
    discipline: "Main nue",
    status: "ongoing",
    roundsLabel: "Quarter-finals",
    teams: 14,
    featuredMatch: "Mikel Etxeberria vs Jon Urrutikoetxea",
    featuredScore: "40 — 27",
    standings: [
      {
        id: "s1",
        rank: 1,
        player: "Mikel E.",
        record: "5V 1D",
        points: "10 pts",
      },
      {
        id: "s2",
        rank: 2,
        player: "Iker L.",
        record: "4V 2D",
        points: "8 pts",
      },
      {
        id: "s3",
        rank: 3,
        player: "Andoni B.",
        record: "3V 3D",
        points: "6 pts",
      },
      { id: "s4", rank: 4, player: "Jon U.", record: "1V 5D", points: "2 pts" },
    ],
  },
  {
    id: "pilotariak-open",
    name: "Pilotariak Open",
    city: "Biarritz",
    dates: "03 Jul — 19 Jul 2026",
    category: "Women",
    discipline: "Chistera",
    status: "upcoming",
    roundsLabel: "Registration open",
    teams: 10,
    featuredMatch: "Draft and seeding in progress",
    standings: [],
  },
  {
    id: "winter-cup",
    name: "Winter Cup 2025",
    city: "Donibane Lohizune",
    dates: "08 Nov — 16 Dec 2025",
    category: "Veterans",
    discipline: "Pala",
    status: "completed",
    roundsLabel: "Champion decided",
    teams: 8,
    featuredMatch: "Final won by Patxi G. / Eneko T.",
    featuredScore: "35 — 29",
    standings: [],
  },
];

export const profileShortcuts = [
  { id: "club", title: "Club identity", detail: "Pilotariak Team · Bayonne" },
  { id: "season", title: "Current season", detail: "2026 Championship setup" },
  {
    id: "notifications",
    title: "Match alerts",
    detail: "Enabled for tournament milestones",
  },
  {
    id: "about",
    title: "About Kancha",
    detail: "Pelota tournament manager for match day operations",
  },
] as const;
