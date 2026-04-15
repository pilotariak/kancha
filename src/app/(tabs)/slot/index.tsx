import { router } from "expo-router";
import { CalendarClock, MapPin, Plus } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { KanchaColors } from "@/constants/colors";

// ── Slot configuration (will come from wizard state/storage) ──────────────────

const SLOT_CONFIG = {
  seasonName: "Saison 2025–2026",
  // JS months are 0-indexed: 8 = September, 7 = August
  start: new Date(2025, 8, 1),
  end: new Date(2026, 7, 31),
  weekday: 4, // 0=Sun 1=Mon … 4=Thu … 6=Sat
  weekdayLabel: "Jeudi",
  timeFrom: "18:00",
  timeTo: "20:00",
  venue: "Fronton municipal, Biarritz",
  playerCount: 12,
};

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Returns every occurrence of `weekday` between start and end (inclusive). */
function computeOccurrences(start: Date, end: Date, weekday: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(start);
  // Advance to the first matching weekday
  while (cursor.getDay() !== weekday) {
    cursor.setDate(cursor.getDate() + 1);
  }
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return dates;
}

/** Deterministic mock status counts for a given date + total players. */
function mockStatusCounts(
  date: Date,
  total: number,
): { ok: number; ko: number; disponible: number } {
  const seed = date.getDate() + date.getMonth() * 31;
  const ko = (seed % 3) + 1;
  const disponible = ((seed * 7) % 3) + 1;
  const ok = total - ko - disponible;
  return { ok, ko, disponible };
}

const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

// ── List item types ───────────────────────────────────────────────────────────

type MonthRow = {
  type: "month";
  key: string;
  label: string;
};

type SessionRow = {
  type: "session";
  key: string;
  date: Date;
  ok: number;
  ko: number;
  disponible: number;
  isPast: boolean;
  isNext: boolean;
};

type ListRow = MonthRow | SessionRow;

// ── Main component ────────────────────────────────────────────────────────────

export default function SlotScreen() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const listData = useMemo<ListRow[]>(() => {
    const occurrences = computeOccurrences(
      SLOT_CONFIG.start,
      SLOT_CONFIG.end,
      SLOT_CONFIG.weekday,
    );

    // Find the index of the next upcoming session
    const nextIndex = occurrences.findIndex((d) => d >= today);

    const rows: ListRow[] = [];
    let lastMonth = -1;

    occurrences.forEach((date, index) => {
      const month = date.getMonth();
      if (month !== lastMonth) {
        rows.push({
          type: "month",
          key: `month-${date.getFullYear()}-${month}`,
          label: `${MONTH_LABELS[month]} ${date.getFullYear()}`,
        });
        lastMonth = month;
      }
      const counts = mockStatusCounts(date, SLOT_CONFIG.playerCount);
      rows.push({
        type: "session",
        key: `session-${date.toISOString()}`,
        date,
        ...counts,
        isPast: date < today,
        isNext: index === nextIndex,
      });
    });

    return rows;
  }, [today]);

  const totalSessions = listData.filter((r) => r.type === "session").length;

  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <FlatList
          data={listData}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="slot-screen"
          ListHeaderComponent={
            <>
              {/* ── Hero ── */}
              <View style={styles.hero}>
                <Text style={styles.eyebrow}>Créneau récurrent</Text>
                <Text style={styles.title}>Slot</Text>
                <Text style={styles.subtitle}>
                  {`${totalSessions} séances · ${SLOT_CONFIG.playerCount} joueurs`}
                </Text>
              </View>

              {/* ── Config card ── */}
              <View style={styles.configCard}>
                <Text style={styles.configSeason}>{SLOT_CONFIG.seasonName}</Text>

                <View style={styles.configRow}>
                  <CalendarClock color={KanchaColors.red} size={15} />
                  <Text style={styles.configInfo}>
                    {`${SLOT_CONFIG.weekdayLabel}s · ${SLOT_CONFIG.timeFrom}–${SLOT_CONFIG.timeTo}`}
                  </Text>
                </View>

                <View style={styles.configRow}>
                  <MapPin color={KanchaColors.muted} size={15} />
                  <Text style={styles.configVenue}>{SLOT_CONFIG.venue}</Text>
                </View>
              </View>

              {/* ── New slot button ── */}
              <PressableScale onPress={() => router.push("/(tabs)/slot/new")}>
                <View style={styles.ctaButton} testID="slot-new-button">
                  <Plus color={KanchaColors.ink} size={17} />
                  <Text style={styles.ctaText}>Nouveau slot</Text>
                </View>
              </PressableScale>

              {/* ── List header ── */}
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderTitle}>Toutes les séances</Text>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: KanchaColors.green }]} />
                  <Text style={styles.legendText}>OK</Text>
                  <View style={[styles.legendDot, { backgroundColor: "#E53935" }]} />
                  <Text style={styles.legendText}>KO</Text>
                  <View style={[styles.legendDot, { backgroundColor: "#D4A017" }]} />
                  <Text style={styles.legendText}>Dispo</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => {
            if (item.type === "month") {
              return (
                <View style={styles.monthRow} testID={`month-${item.key}`}>
                  <Text style={styles.monthLabel}>{item.label}</Text>
                </View>
              );
            }

            // session row
            const session = item as SessionRow;
            const day = session.date.getDate();
            const dayLabel = DAY_LABELS[session.date.getDay()];

            return (
              <View
                style={[
                  styles.sessionRow,
                  session.isPast ? styles.sessionRowPast : null,
                  session.isNext ? styles.sessionRowNext : null,
                ]}
                testID={`session-row-${session.key}`}
              >
                {/* Date block */}
                <View
                  style={[
                    styles.dateBlock,
                    session.isNext ? styles.dateBlockNext : null,
                    session.isPast ? styles.dateBlockPast : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      session.isNext ? styles.dateDayNext : null,
                      session.isPast ? styles.dateDayPast : null,
                    ]}
                  >
                    {day}
                  </Text>
                  <Text
                    style={[
                      styles.dateDayLabel,
                      session.isNext ? styles.dateDayLabelNext : null,
                      session.isPast ? styles.dateDayLabelPast : null,
                    ]}
                  >
                    {dayLabel}
                  </Text>
                </View>

                {/* "Prochain" badge */}
                {session.isNext && (
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>Prochain</Text>
                  </View>
                )}

                {/* Spacer so counters align right */}
                {!session.isNext && <View style={styles.flex} />}

                {/* Counters */}
                <View style={styles.counters}>
                  <View style={styles.counter}>
                    <View style={[styles.counterDot, { backgroundColor: KanchaColors.green }]} />
                    <Text
                      style={[
                        styles.counterValue,
                        session.isPast ? styles.counterValuePast : null,
                      ]}
                    >
                      {session.ok}
                    </Text>
                  </View>
                  <View style={styles.counter}>
                    <View style={[styles.counterDot, { backgroundColor: "#E53935" }]} />
                    <Text
                      style={[
                        styles.counterValue,
                        session.isPast ? styles.counterValuePast : null,
                      ]}
                    >
                      {session.ko}
                    </Text>
                  </View>
                  <View style={styles.counter}>
                    <View style={[styles.counterDot, { backgroundColor: "#D4A017" }]} />
                    <Text
                      style={[
                        styles.counterValue,
                        session.isPast ? styles.counterValuePast : null,
                      ]}
                    >
                      {session.disponible}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </KanchaBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 10,
  },

  // Hero
  hero: { gap: 6, marginBottom: 8 },
  eyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: { color: KanchaColors.white, fontSize: 34, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.82)", fontSize: 14 },

  // Config card
  configCard: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 16,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 10,
  },
  configSeason: { color: KanchaColors.ink, fontSize: 16, fontWeight: "900" },
  configRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  configInfo: { color: KanchaColors.ink, fontSize: 14, fontWeight: "700" },
  configVenue: { color: KanchaColors.muted, fontSize: 13, flex: 1 },

  // CTA
  ctaButton: {
    borderRadius: 14,
    backgroundColor: KanchaColors.white,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: { color: KanchaColors.ink, fontSize: 15, fontWeight: "800" },

  // List header
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: 2,
  },
  listHeaderTitle: { color: KanchaColors.ink, fontSize: 16, fontWeight: "900" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: KanchaColors.muted, fontSize: 11, fontWeight: "700", marginRight: 4 },

  // Month separator
  monthRow: {
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 2,
  },
  monthLabel: {
    color: KanchaColors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  // Session row
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: KanchaColors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sessionRowPast: {
    backgroundColor: "#FAF8F5",
    borderColor: "#EDE8E1",
  },
  sessionRowNext: {
    backgroundColor: KanchaColors.redSoft,
    borderColor: "#F1B9C4",
  },

  // Date block
  dateBlock: {
    width: 40,
    alignItems: "center",
    gap: 2,
  },
  dateBlockNext: {},
  dateBlockPast: {},
  dateDay: {
    color: KanchaColors.ink,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
  dateDayNext: { color: KanchaColors.redDark },
  dateDayPast: { color: "#B0A89E" },
  dateDayLabel: {
    color: KanchaColors.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dateDayLabelNext: { color: KanchaColors.red },
  dateDayLabelPast: { color: "#C4BBB2" },

  // "Prochain" badge
  nextBadge: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: KanchaColors.red,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "center",
  },
  nextBadgeText: {
    color: KanchaColors.white,
    fontSize: 11,
    fontWeight: "800",
  },

  flex: { flex: 1 },

  // Counters
  counters: { flexDirection: "row", gap: 10 },
  counter: { flexDirection: "row", alignItems: "center", gap: 5, minWidth: 26 },
  counterDot: { width: 8, height: 8, borderRadius: 4 },
  counterValue: { color: KanchaColors.ink, fontSize: 14, fontWeight: "800" },
  counterValuePast: { color: "#B0A89E" },
});
