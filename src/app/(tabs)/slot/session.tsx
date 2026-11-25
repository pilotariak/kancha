import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { AnswerStatus, SessionDetail, SlotDetail } from "@/api/pik";
import { Ban, BellRing, CalendarClock, Megaphone, Undo2 } from "@/components/icons";
import { SessionGauge } from "@/components/SessionGauge";
import {
  Centered,
  Paragraph,
  SectionTitle,
  shareMessage,
  SlotButton,
  SlotCardBox,
  SlotErrorBox,
  SlotNotice,
  SlotPage,
} from "@/components/SlotParts";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { type CivilDate, type DateNames, parseIsoDate } from "@/features/slots/dates";
import {
  capitalize,
  dateNames,
  formatDay,
  formatDeadline,
  formatLongDate,
} from "@/features/slots/format";
import { outcomeMessage, reminderMessage } from "@/features/slots/messages";
import {
  type AnswerChoice,
  type AnswerGroupKey,
  answerGroups,
  nextSession,
  sessionActions,
  sessionSentence,
  sessionStateLabel,
} from "@/features/slots/sessions";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import {
  useAnswerSession,
  useSessionDetail,
  useSetSessionCancelled,
  useSlotDetail,
  useSlotSessionList,
  useSlotsRefresh,
} from "@/hooks/use-slots";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

/**
 * One session of a slot (#157), `/slot/session?id=…&date=YYYY-MM-DD`: each player answers OK,
 * Dispo or KO in one tap, and everyone sees at once whether the game is on. The state, the
 * counts and the deadline are pik's; Dispo answers do not count toward the minimum.
 *
 * Any player can send a reminder to the group chat before the deadline ("Relancer"); organizers
 * also announce the outcome ("Prévenir"), cancel or restore the date, and answer for a member
 * who never picked their name (kancha ADR-0003).
 */
export default function SessionScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const names = useMemo(() => dateNames(t), [t]);
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const slotId = typeof params.id === "string" && params.id ? params.id : null;
  const day = typeof params.date === "string" ? parseIsoDate(params.date) : null;
  const date = day && typeof params.date === "string" ? params.date : null;
  const slot = useSlotDetail(slotId);
  const session = useSessionDetail(slotId, date);
  // Answers change at any time: read them again when the screen or the app comes back.
  useSlotsRefresh();

  const failed = slot.isError ? slot : session.isError ? session : null;
  const schedule = slot.data?.schedule;

  return (
    <SlotPage
      eyebrow={slot.data?.name ?? t("slot.session_screen.eyebrow")}
      title={day ? capitalize(formatLongDate(t, names, day), locale) : t("tabs.slot")}
      subtitle={schedule && slot.data
        ? [
          schedule.time_to ? `${schedule.time_from}–${schedule.time_to}` : schedule.time_from,
          slot.data.venue,
        ].join(" · ")
        : undefined}
      backLabel={t("tabs.slot")}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/slot"))}
      testID="session-screen"
    >
      {!slotId || !date || !day
        ? (
          <SlotNotice testID="session-invalid">
            {t("slot.session_screen.invalid", { tab: t("tabs.slot") })}
          </SlotNotice>
        )
        : failed
        ? (
          <SlotErrorBox
            title={t("slot.session_screen.load_error")}
            error={failed.error}
            onRetry={() => {
              if (slot.isError) void slot.refetch();
              if (session.isError) void session.refetch();
            }}
            retrying={slot.isRefetching || session.isRefetching}
          />
        )
        : !slot.data || !session.data
        ? <Centered label={t("common.loading")} />
        : (
          <SessionBody
            slot={slot.data}
            session={session.data}
            day={day}
            names={names}
          />
        )}
    </SlotPage>
  );
}

function SessionBody(
  { slot, session, day, names }: {
    slot: SlotDetail;
    session: SessionDetail;
    day: CivilDate;
    names: DateNames;
  },
) {
  const organizer = slot.me.role === "organizer";
  const actions = sessionActions(session, organizer, new Date());
  return (
    <>
      <StateCard slot={slot} session={session} day={day} names={names} />
      <MyAnswerCard slot={slot} session={session} choice={actions.answer} />
      <AnswersCard slot={slot} session={session} organizer={organizer} choice={actions.answer} />
      {(actions.remind || actions.notify) && (
        <ShareCard
          slot={slot}
          session={session}
          names={names}
          remind={actions.remind}
          notify={actions.notify}
        />
      )}
      {(actions.cancel || actions.restore) && (
        <OrganizerCard slot={slot} session={session} cancelled={session.cancelled} />
      )}
    </>
  );
}

// ── The state and the gauge ───────────────────────────────────────────────────

function StateCard(
  { slot, session, day, names }: {
    slot: SlotDetail;
    session: SessionDetail;
    day: CivilDate;
    names: DateNames;
  },
) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const state = sessionStateLabel(session);
  const sentence = capitalize(
    sessionSentence(session)
      .map((part) => t(part.key, part.params))
      .join(t("slot.session_screen.sentence.separator")),
    locale,
  );
  const deadline = formatDeadline(t, names, session.deadline, day, "screen");

  return (
    <SlotCardBox>
      <View style={styles.stateHead}>
        <Text
          style={[styles.when, session.cancelled ? styles.struck : null]}
          testID="session-when"
        >
          {`${capitalize(formatDay(t, names, day), locale)} · ${slot.schedule.time_from}`}
        </Text>
        <View testID="session-state" aria-live="polite">
          <StatusPill label={t(state.key, state.params)} tone={state.tone} />
        </View>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.okCount} testID="session-ok-count">
          {t("slot.ok_of_min", { ok: session.counts.ok, min: session.min_players })}
        </Text>
      </View>
      <SessionGauge
        ok={session.counts.ok}
        dispo={session.counts.dispo}
        minPlayers={session.min_players}
        places={session.places}
        testID="session-gauge"
      />
      <Text style={styles.sentence} testID="session-sentence">{sentence}</Text>

      {!!session.note && <Paragraph>{session.note}</Paragraph>}

      {!!deadline && (
        <View style={styles.deadlineRow}>
          <CalendarClock color={session.deadline_passed ? colors.muted : colors.red} size={16} />
          <Text style={styles.deadline} testID="session-deadline">
            {t(
              session.deadline_passed
                ? "slot.session_screen.deadline_closed"
                : "slot.session_screen.deadline_until",
              { deadline },
            )}
          </Text>
        </View>
      )}
    </SlotCardBox>
  );
}

// ── Answers ───────────────────────────────────────────────────────────────────

const STATUSES: readonly AnswerStatus[] = ["ok", "dispo", "ko"];

const STATUS_LABELS: Record<AnswerStatus, string> = {
  ok: "slot.status.ok",
  dispo: "slot.status.disponible",
  ko: "slot.status.ko",
};

/**
 * OK, Dispo and KO as three buttons, the current answer pressed. After the deadline only KO
 * stays, as pik takes no other answer then.
 */
function AnswerButtons(
  { current, choice, onAnswer, compact, label, testID }: {
    current: AnswerStatus | null;
    choice: AnswerChoice;
    onAnswer: (status: AnswerStatus) => void;
    compact?: boolean;
    /** The group's name for screen readers. */
    label: string;
    testID: string;
  },
) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  return (
    <View style={styles.answerRow} role="group" aria-label={label}>
      {STATUSES.map((status) => {
        const selected = current === status;
        const enabled = choice === "all" || (choice === "ko_only" && status === "ko");
        return (
          <View key={status} style={styles.answerCell}>
            <Pressable
              onPress={() => {
                if (enabled && !selected) onAnswer(status);
              }}
              accessibilityRole="button"
              accessibilityLabel={t(STATUS_LABELS[status])}
              // An answer pik would refuse. On the web, Pressable sets aria-disabled from this.
              disabled={!enabled}
              // accessibilityState never reaches the DOM on web: aria-pressed carries it there.
              accessibilityState={{ selected, disabled: !enabled }}
              {...(Platform.OS === "web" ? { "aria-pressed": selected } : null)}
              testID={`${testID}-${status}`}
              style={(state: InteractionState) => [
                styles.answer,
                compact ? styles.answerCompact : null,
                selected ? styles[`answer_${status}`] : null,
                !enabled ? styles.answerDisabled : null,
                state.hovered && enabled && !selected ? interaction.hoverBorder : null,
                showsFocusRing(state) ? interaction.focusRing : null,
              ]}
            >
              <Text
                style={[
                  styles.answerText,
                  compact ? styles.answerTextCompact : null,
                  selected ? styles[`answerText_${status}`] : null,
                  !enabled ? styles.answerTextDisabled : null,
                ]}
                numberOfLines={1}
              >
                {t(STATUS_LABELS[status])}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function MyAnswerCard(
  { slot, session, choice }: { slot: SlotDetail; session: SessionDetail; choice: AnswerChoice },
) {
  const { t } = useTranslation();
  const answer = useAnswerSession(slot.id, session.date);
  return (
    <SlotCardBox>
      <SectionTitle>{t("slot.my_answer.label")}</SectionTitle>
      {choice === "none"
        ? (
          <SlotNotice testID="session-answers-closed">
            {t("slot.session_screen.cancelled_notice")}
          </SlotNotice>
        )
        : (
          <>
            <AnswerButtons
              current={session.my_answer ?? null}
              choice={choice}
              label={t("slot.my_answer.label")}
              onAnswer={(status) => answer.mutate({ status, memberId: slot.me.member_id })}
              testID="session-answer"
            />
            <Paragraph>
              {t(
                choice === "ko_only"
                  ? "slot.session_screen.ko_only"
                  : "slot.session_screen.answer_hint",
              )}
            </Paragraph>
          </>
        )}
      {!!answer.error && (
        <SlotErrorBox title={t("slot.session_screen.answer_error")} error={answer.error} />
      )}
    </SlotCardBox>
  );
}

const GROUP_TITLES: Record<AnswerGroupKey, string> = {
  ...STATUS_LABELS,
  none: "slot.session_screen.no_answer",
};

function AnswersCard(
  { slot, session, organizer, choice }: {
    slot: SlotDetail;
    session: SessionDetail;
    organizer: boolean;
    choice: AnswerChoice;
  },
) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const groups = answerGroups(session);
  // A member who never picked their name: only an organizer can answer for them.
  const unclaimed = new Set(
    slot.members.filter((member) => !member.claimed).map((member) => member.id),
  );
  const answersFor = organizer && choice !== "none";
  const offersAnswerFor = answersFor
    && groups.some((group) => group.members.some((member) => unclaimed.has(member.memberId)));
  // One mutation for every member, held here: an answer moves its row to another group, which
  // mounts it anew, and the error of a refused answer must outlive that.
  const answerFor = useAnswerSession(slot.id, session.date, { forOthers: true });
  const failedName = answerFor.error
    ? (slot.members.find((member) => member.id === answerFor.variables?.memberId)?.name
      ?? t("slot.members_screen.former_player"))
    : null;

  return (
    <SlotCardBox>
      <SectionTitle>{t("slot.session_screen.answers_title")}</SectionTitle>
      {offersAnswerFor && <Paragraph>{t("slot.session_screen.answer_for_hint")}</Paragraph>}
      {groups.map((group) => (
        <View key={group.key} style={styles.group} testID={`session-group-${group.key}`}>
          <View style={styles.groupHead}>
            <View style={[styles.groupDot, styles[`dot_${group.key}`]]} />
            <Text style={styles.groupTitle} accessibilityRole="header">
              {`${t(GROUP_TITLES[group.key])} · ${group.members.length}`}
            </Text>
          </View>
          {group.members.length === 0
            ? <Text style={styles.nobody}>{t("slot.session_screen.nobody")}</Text>
            : group.members.map((member) => (
              <MemberAnswer
                key={member.memberId}
                memberId={member.memberId}
                name={member.name ?? t("slot.members_screen.former_player")}
                me={member.me}
                current={group.key === "none" ? null : group.key}
                choice={choice}
                onAnswerFor={answersFor && unclaimed.has(member.memberId)
                  ? (status) => answerFor.mutate({ status, memberId: member.memberId })
                  : null}
              />
            ))}
        </View>
      ))}
      {failedName !== null && (
        <SlotErrorBox
          title={t("slot.session_screen.answer_for_error", { name: failedName })}
          error={answerFor.error}
        />
      )}
    </SlotCardBox>
  );
}

function MemberAnswer(
  { memberId, name, me, current, choice, onAnswerFor }: {
    memberId: string;
    name: string;
    me: boolean;
    current: AnswerStatus | null;
    choice: AnswerChoice;
    /** An organizer's answer for a member who never picked their name; null for others. */
    onAnswerFor: ((status: AnswerStatus) => void) | null;
  },
) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.member} testID={`session-member-${memberId}`}>
      <View style={styles.memberHead}>
        <Text style={[styles.memberName, me ? styles.memberNameMe : null]} numberOfLines={1}>
          {name}
        </Text>
        {me && <StatusPill label={t("slot.members_screen.you")} tone="green" size="small" />}
        {onAnswerFor && (
          <StatusPill label={t("slot.members_screen.free")} tone="soft" size="small" />
        )}
      </View>
      {onAnswerFor && (
        <AnswerButtons
          compact
          current={current}
          choice={choice}
          label={t("slot.session_screen.answer_for", { name })}
          onAnswer={onAnswerFor}
          testID={`session-answer-for-${memberId}`}
        />
      )}
    </View>
  );
}

// ── Messages to the group chat ────────────────────────────────────────────────

function ShareCard(
  { slot, session, names, remind, notify }: {
    slot: SlotDetail;
    session: SessionDetail;
    names: DateNames;
    remind: boolean;
    notify: boolean;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const sessions = useSlotSessionList(notify ? slot.id : null);
  const [copied, setCopied] = useState<"remind" | "notify" | null>(null);

  const share = async (kind: "remind" | "notify") => {
    const message = kind === "remind"
      ? reminderMessage(t, names, {
        slotName: slot.name,
        session,
        inviteCode: slot.invite_code,
      })
      : outcomeMessage(t, names, {
        slotName: slot.name,
        session,
        next: nextSession(sessions.data?.sessions ?? [], session.date),
      });
    if (!message) return;
    // A browser without the share sheet copies the whole message instead.
    const outcome = await shareMessage({ message: message.text, url: message.url });
    setCopied(outcome === "copied" ? kind : null);
  };

  return (
    <SlotCardBox>
      <SectionTitle>{t("slot.session_screen.share_title")}</SectionTitle>
      {remind && (
        <>
          <Paragraph>{t("slot.session_screen.remind_hint")}</Paragraph>
          <SlotButton
            label={copied === "remind"
              ? t("slot.session_screen.copied")
              : t("slot.session_screen.remind")}
            icon={<BellRing color={colors.red} size={16} />}
            onPress={() => void share("remind")}
            testID="session-remind"
          />
        </>
      )}
      {notify && (
        <>
          <Paragraph>{t("slot.session_screen.notify_hint")}</Paragraph>
          <SlotButton
            label={copied === "notify"
              ? t("slot.session_screen.copied")
              : t("slot.session_screen.notify")}
            icon={<Megaphone color={colors.red} size={16} />}
            // "Prochaine séance" comes from the slot's sessions: wait for them.
            busy={sessions.isPending}
            onPress={() => void share("notify")}
            testID="session-notify"
          />
        </>
      )}
    </SlotCardBox>
  );
}

// ── Organizer actions ─────────────────────────────────────────────────────────

function OrganizerCard(
  { slot, session, cancelled }: { slot: SlotDetail; session: SessionDetail; cancelled: boolean },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const change = useSetSessionCancelled(slot.id, session.date);
  const [confirming, setConfirming] = useState(false);

  return (
    <SlotCardBox>
      <SectionTitle>{t("slot.session_screen.organizer_title")}</SectionTitle>
      {!!change.error && (
        <SlotErrorBox title={t("slot.members_screen.action_error")} error={change.error} />
      )}
      {cancelled
        ? (
          <SlotButton
            label={t("slot.session_screen.restore")}
            icon={<Undo2 color={colors.red} size={16} />}
            busy={change.isPending}
            onPress={() => change.mutate(false)}
            testID="session-restore"
          />
        )
        : confirming
        ? (
          <>
            <Paragraph strong>{t("slot.session_screen.cancel_hint")}</Paragraph>
            <SlotButton
              label={t("slot.session_screen.cancel_confirm")}
              tone="primary"
              busy={change.isPending}
              onPress={() => change.mutate(true, { onSettled: () => setConfirming(false) })}
              testID="session-cancel-confirm"
            />
            <SlotButton
              label={t("slot.session_screen.cancel_keep")}
              onPress={() => setConfirming(false)}
              testID="session-cancel-keep"
            />
          </>
        )
        : (
          <SlotButton
            label={t("slot.session_screen.cancel")}
            icon={<Ban color={colors.red} size={16} />}
            onPress={() => setConfirming(true)}
            testID="session-cancel"
          />
        )}
    </SlotCardBox>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    stateHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    when: { flexShrink: 1, color: c.ink, fontSize: 17, fontWeight: "800" },
    struck: { textDecorationLine: "line-through", color: c.muted },
    countRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
    okCount: { color: c.ink, fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"] },
    sentence: { color: c.text, fontSize: 15, fontWeight: "700", lineHeight: 21 },
    deadlineRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    deadline: { flex: 1, color: c.text, fontSize: 14, fontWeight: "600", lineHeight: 20 },

    answerRow: { flexDirection: "row", gap: 8 },
    // Padding-less cells, so the three buttons share the row equally.
    answerCell: { flex: 1 },
    answer: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
    },
    answerCompact: { minHeight: 44, borderRadius: 12 },
    answer_ok: { backgroundColor: c.greenSoft, borderColor: c.green },
    answer_dispo: { backgroundColor: c.amberBg, borderColor: c.amber },
    answer_ko: { backgroundColor: c.redSoft, borderColor: c.red },
    answerDisabled: { backgroundColor: c.cream, borderColor: c.line },
    answerText: { color: c.ink, fontSize: 15, fontWeight: "800" },
    answerTextCompact: { fontSize: 13 },
    answerText_ok: { color: c.green },
    answerText_dispo: { color: c.amber },
    answerText_ko: { color: c.red },
    answerTextDisabled: { color: c.muted },

    group: { gap: 8 },
    groupHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    groupDot: { width: 8, height: 8, borderRadius: 4 },
    dot_ok: { backgroundColor: c.green },
    dot_dispo: { backgroundColor: c.amber },
    dot_ko: { backgroundColor: c.red },
    dot_none: { backgroundColor: c.lineStrong },
    groupTitle: {
      color: c.placeholder,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    nobody: { color: c.placeholder, fontSize: 14, fontWeight: "600", paddingLeft: 16 },
    member: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
    },
    memberHead: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
    memberName: { flexShrink: 1, color: c.ink, fontSize: 15, fontWeight: "700", marginRight: 4 },
    memberNameMe: { fontWeight: "900" },
  });
