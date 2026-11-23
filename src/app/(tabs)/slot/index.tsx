import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { SlotCard } from "@/api/pik";
import { CalendarClock, MapPin, Plus, RotateCcw, Users } from "@/components/icons";
import { PressableScale } from "@/components/PressableScale";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import {
  type DateNames,
  type IsoWeekday,
  isoWeekday,
  parseIsoDate,
  weekdayName,
} from "@/features/slots/dates";
import { slotErrorMessage } from "@/features/slots/errors";
import { capitalize, dateNames, formatDay, formatMonthYear } from "@/features/slots/format";
import {
  myAnswerLabel,
  type SessionListRow,
  sessionRows,
  sessionStateLabel,
} from "@/features/slots/sessions";
import { useMySlots, useSlotsRefresh, useSlotsSessions } from "@/hooks/use-slots";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

// One empty list for every render, so the sessions queries are not rebuilt while /me loads.
const NO_SLOTS: SlotCard[] = [];

const timeRange = (from: string, to?: string | null) => (to ? `${from}–${to}` : from);

// ── States ────────────────────────────────────────────────────────────────────

function ErrorBox(
  { title, error, onRetry, retrying }: {
    title: string;
    error: unknown;
    onRetry: () => void;
    retrying: boolean;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const message = slotErrorMessage(error);
  return (
    <View style={styles.errorBox} accessibilityRole="alert">
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorDetail}>{t(message.key, message.params)}</Text>
      <Pressable
        style={styles.retryButton}
        onPress={onRetry}
        disabled={retrying}
        accessibilityRole="button"
        accessibilityLabel={t("error.retry")}
        aria-busy={retrying}
        aria-disabled={retrying}
      >
        {retrying
          ? <ActivityIndicator color={colors.red} size="small" />
          : <RotateCcw color={colors.red} size={14} />}
        <Text style={styles.retryLabel}>{t("error.retry")}</Text>
      </Pressable>
    </View>
  );
}

function EmptyBox({ text, testID }: { text: string; testID?: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.emptyBox} testID={testID}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

// ── Slot card ─────────────────────────────────────────────────────────────────

function SlotCardView({ slot, names }: { slot: SlotCard; names: DateNames }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const next = slot.next_session;
  const nextDate = next ? parseIsoDate(next.date) : null;
  const weekday = capitalize(
    weekdayName(slot.schedule.weekday as IsoWeekday, names.weekdays),
    locale,
  );
  const interval = slot.schedule.interval_weeks === 2
    ? t("slot.interval.fortnightly")
    : t("slot.interval.weekly");
  const state = next ? sessionStateLabel(next) : null;
  const answer = next ? myAnswerLabel(next.my_answer) : null;

  return (
    <View style={styles.slotCard} testID={`slot-card-${slot.id}`}>
      <View style={styles.slotTitleRow}>
        <Text style={styles.slotName} numberOfLines={2}>{slot.name}</Text>
        {state && <StatusPill label={t(state.key, state.params)} tone={state.tone} />}
      </View>

      <View style={styles.configRow}>
        <CalendarClock color={colors.red} size={15} />
        <Text style={styles.configInfo}>
          {`${weekday} · ${
            timeRange(slot.schedule.time_from, slot.schedule.time_to)
          } · ${interval}`}
        </Text>
      </View>
      <View style={styles.configRow}>
        <MapPin color={colors.muted} size={15} />
        <Text style={styles.configVenue} numberOfLines={1}>
          {`${slot.venue} · ${t(`slot.court.${slot.court}`, { defaultValue: slot.court })}`}
        </Text>
      </View>

      <View style={styles.divider} />

      {next && nextDate && answer
        ? (
          <>
            <View style={styles.nextRow}>
              <View style={styles.nextText}>
                <Text style={styles.nextLabel}>{t("slot.next_session")}</Text>
                <Text style={styles.nextDate}>
                  {`${
                    capitalize(formatDay(t, names, nextDate), locale)
                  } · ${slot.schedule.time_from}`}
                </Text>
              </View>
              <View style={styles.okCount}>
                <Users color={colors.green} size={15} />
                <Text style={styles.okCountText}>
                  {t("slot.ok_of_min", { ok: next.counts.ok, min: next.min_players })}
                </Text>
              </View>
            </View>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>{t("slot.my_answer.label")}</Text>
              <StatusPill label={t(answer.key)} tone={answer.tone} size="small" />
            </View>
          </>
        )
        : <Text style={styles.seasonOver}>{t("slot.season_over")}</Text>}
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SlotScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { t } = useTranslation();
  const names = useMemo(() => dateNames(t), [t]);

  const mySlots = useMySlots();
  const slots = mySlots.data?.slots ?? NO_SLOTS;
  const sessions = useSlotsSessions(slots);
  const refresh = useSlotsRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const rows = useMemo<SessionListRow[]>(
    () => (sessions.data ? sessionRows(sessions.data) : []),
    [sessions.data],
  );
  const sessionCount = rows.filter((row) => row.type === "session").length;
  const severalSlots = slots.length > 1;

  const subtitle = mySlots.data
    ? [
      t("slot.slots_count", { count: slots.length }),
      ...(sessions.data && slots.length > 0
        ? [t("slot.sessions_count", { count: sessionCount })]
        : []),
    ].join(" · ")
    : undefined;

  const sessionsStatus = () => {
    if (!mySlots.data || slots.length === 0) return null;
    if (sessions.isError) {
      return (
        <ErrorBox
          title={t("slot.sessions_error")}
          error={sessions.error}
          onRetry={sessions.refetch}
          retrying={sessions.isRefetching}
        />
      );
    }
    if (!sessions.data) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.red} accessibilityLabel={t("common.loading")} />
        </View>
      );
    }
    return <EmptyBox text={t("slot.no_sessions")} />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="slot-screen"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
        ListHeaderComponent={
          <>
            <ScreenHeader eyebrow={t("slot.eyebrow")} title={t("tabs.slot")} subtitle={subtitle} />

            <View style={styles.headerBody}>
              {/* ── Create and join ── */}
              <View style={styles.actionsRow}>
                <PressableScale
                  style={styles.actionCell}
                  onPress={() => router.push("/(tabs)/slot/new")}
                  accessibilityRole="button"
                  accessibilityLabel={t("slot.new")}
                >
                  <View style={styles.ctaButton} testID="slot-new-button">
                    <Plus color={colors.ink} size={17} />
                    <Text style={styles.ctaText}>{t("slot.create")}</Text>
                  </View>
                </PressableScale>
                {/* Joining from an invite link comes with #158. */}
                <View
                  style={[styles.actionCell, styles.ctaButton, styles.ctaDisabled]}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("slot.join")}, ${t("common.soon")}`}
                  aria-disabled
                  testID="slot-join-button"
                >
                  <Text style={[styles.ctaText, styles.ctaTextDisabled]}>{t("slot.join")}</Text>
                  <StatusPill label={t("common.soon")} tone="soft" size="small" />
                </View>
              </View>

              {/* ── The player's slots ── */}
              {mySlots.isError
                ? (
                  <ErrorBox
                    title={t("slot.load_error")}
                    error={mySlots.error}
                    onRetry={() => void mySlots.refetch()}
                    retrying={mySlots.isRefetching}
                  />
                )
                : !mySlots.data
                ? (
                  <View style={styles.centered} testID="slot-loading">
                    <ActivityIndicator
                      color={colors.red}
                      accessibilityLabel={t("slot.loading")}
                    />
                  </View>
                )
                : slots.length === 0
                ? <EmptyBox text={t("slot.empty")} testID="slot-empty" />
                : slots.map((slot) => <SlotCardView key={slot.id} slot={slot} names={names} />)}

              {/* ── Upcoming sessions, by month ── */}
              {slots.length > 0 && (
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderTitle}>{t("slot.all_sessions")}</Text>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
                    <Text style={styles.legendText}>{t("slot.status.ok")}</Text>
                    <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
                    <Text style={styles.legendText}>{t("slot.status.ko")}</Text>
                    <View style={[styles.legendDot, { backgroundColor: colors.amber }]} />
                    <Text style={styles.legendText}>{t("slot.status.disponible")}</Text>
                  </View>
                </View>
              )}
            </View>
          </>
        }
        ListEmptyComponent={<View style={styles.headerBody}>{sessionsStatus()}</View>}
        renderItem={({ item }) => {
          if (item.type === "month") {
            return (
              <View style={styles.monthRow} testID={item.key}>
                <Text style={styles.monthLabel}>
                  {formatMonthYear(t, names, item.year, item.month)}
                </Text>
              </View>
            );
          }

          const { session, isNext } = item;
          const cancelled = session.state === "cancelled";
          return (
            <View
              style={[styles.sessionRow, isNext ? styles.sessionRowNext : null]}
              testID={`session-row-${item.key}`}
            >
              {/* Date block */}
              <View style={styles.dateBlock}>
                <Text style={[styles.dateDay, isNext ? styles.dateDayNext : null]}>
                  {item.date.day}
                </Text>
                <Text style={[styles.dateDayLabel, isNext ? styles.dateDayLabelNext : null]}>
                  {weekdayName(isoWeekday(item.date), names.weekdaysShort)}
                </Text>
              </View>

              <View style={styles.sessionMain}>
                {isNext && (
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>{t("slot.next")}</Text>
                  </View>
                )}
                <Text style={styles.sessionMeta} numberOfLines={1}>
                  {severalSlots ? `${item.slotName} · ${item.timeFrom}` : item.timeFrom}
                </Text>
              </View>

              {/* Counters, or the cancellation */}
              {cancelled
                ? <StatusPill label={t("slot.state.cancelled")} tone="soft" size="small" />
                : (
                  <View style={styles.counters}>
                    <Counter color={colors.green} value={session.counts.ok} />
                    <Counter color={colors.red} value={session.counts.ko} />
                    <Counter color={colors.amber} value={session.counts.dispo} />
                  </View>
                )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function Counter({ color, value }: { color: string; value: number }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.counter}>
      <View style={[styles.counterDot, { backgroundColor: color }]} />
      <Text style={styles.counterValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.redFill },
    scroll: { backgroundColor: c.cream },
    content: { paddingBottom: 120, gap: 10 },
    headerBody: { paddingHorizontal: 20, paddingTop: 22, gap: 10 },

    // Create and join
    actionsRow: { flexDirection: "row", gap: 10 },
    actionCell: { flex: 1 },
    ctaButton: {
      borderRadius: 14,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    ctaDisabled: { backgroundColor: c.cream },
    ctaText: { color: c.ink, fontSize: 15, fontWeight: "800" },
    ctaTextDisabled: { color: c.muted },

    // Slot card
    slotCard: {
      borderRadius: 20,
      backgroundColor: c.card,
      padding: 16,
      borderWidth: 1,
      borderColor: c.line,
      gap: 10,
    },
    slotTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    slotName: { flex: 1, color: c.ink, fontSize: 17, fontWeight: "800" },
    configRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    configInfo: { flex: 1, color: c.ink, fontSize: 14, fontWeight: "700" },
    configVenue: { color: c.muted, fontSize: 13, fontWeight: "600", flex: 1 },
    divider: { height: 1, backgroundColor: c.line },
    nextRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    nextText: { flex: 1, gap: 2 },
    nextLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    nextDate: { color: c.ink, fontSize: 15, fontWeight: "800" },
    okCount: { flexDirection: "row", alignItems: "center", gap: 6 },
    okCountText: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    answerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    answerLabel: { color: c.muted, fontSize: 13, fontWeight: "600" },
    seasonOver: { color: c.muted, fontSize: 13, fontWeight: "600" },

    // States
    centered: { paddingVertical: 24, alignItems: "center" },
    errorBox: {
      borderRadius: 16,
      backgroundColor: c.redSoft,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(200,16,46,0.2)",
    },
    errorTitle: { color: c.red, fontSize: 14, fontWeight: "700" },
    errorDetail: { color: c.muted, fontSize: 12, fontWeight: "600" },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.red,
      marginTop: 4,
    },
    retryLabel: { color: c.red, fontSize: 14, fontWeight: "700" },
    emptyBox: {
      borderRadius: 16,
      backgroundColor: c.white,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.line,
    },
    emptyText: { color: c.muted, fontSize: 14, fontWeight: "600", textAlign: "center" },

    // List header
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
      paddingTop: 6,
      paddingBottom: 2,
    },
    listHeaderTitle: { color: c.ink, fontSize: 16, fontWeight: "900" },
    legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 7, height: 7, borderRadius: 4 },
    legendText: { color: c.muted, fontSize: 11, fontWeight: "700", marginRight: 4 },

    // Month separator
    monthRow: {
      marginHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 4,
      paddingHorizontal: 2,
    },
    monthLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },

    // Session row
    sessionRow: {
      marginHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    sessionRowNext: {
      backgroundColor: c.redSoft,
      borderColor: c.redSoft,
    },
    sessionMain: { flex: 1, gap: 4, alignItems: "flex-start" },
    sessionMeta: { color: c.muted, fontSize: 13, fontWeight: "700" },

    // Date block
    dateBlock: {
      width: 40,
      alignItems: "center",
      gap: 2,
    },
    dateDay: {
      color: c.ink,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 22,
      fontVariant: ["tabular-nums"],
    },
    dateDayNext: { color: c.red },
    dateDayLabel: {
      color: c.muted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    dateDayLabelNext: { color: c.red },

    // "Prochain" badge
    nextBadge: {
      borderRadius: 8,
      backgroundColor: c.redFill,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    nextBadgeText: {
      color: c.onRedStrong,
      fontSize: 11,
      fontWeight: "800",
    },

    // Counters
    counters: { flexDirection: "row", gap: 10 },
    counter: { flexDirection: "row", alignItems: "center", gap: 5, minWidth: 26 },
    counterDot: { width: 8, height: 8, borderRadius: 4 },
    counterValue: { color: c.ink, fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  });
