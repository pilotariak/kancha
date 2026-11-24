import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { isPikFailure, type JoinPreview } from "@/api/pik";
import { CalendarClock, Check, MapPin, UserCheck, UserPlus } from "@/components/icons";
import {
  Centered,
  Paragraph,
  PersonalLinkCard,
  SectionTitle,
  SlotButton,
  SlotCardBox,
  SlotErrorBox,
  SlotNotice,
  SlotPage,
} from "@/components/SlotParts";
import type { Palette } from "@/constants/colors";
import { parseIsoDate } from "@/features/slots/dates";
import { dateNames, formatDay, formatSchedule } from "@/features/slots/format";
import {
  canAddName,
  type JoinChoice,
  myName,
  NAME_MAX,
  nameProblem,
  nothingToPick,
} from "@/features/slots/join";
import { normalizeInviteCode } from "@/features/slots/links";
import { normalizeName } from "@/features/slots/wizard";
import {
  type InteractionState,
  showsFocusRing,
  useFieldFocus,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useJoinPreview, useJoinSlot, useRecognizedSlot } from "@/hooks/use-slots";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

/**
 * Joining a slot from its invite link, `/slot/join?code=…`, without an account (kancha
 * ADR-0002). A root route, out of the tabs: the link must open it while the Créneaux tab is
 * hidden on iOS and Android, where native tabs register only the routes that have a tab.
 *
 * Then: on the web, the Créneaux list. On iOS and Android, where that tab is still hidden (#157
 * shows it), the screen says the player is in, and offers the personal link.
 */
export default function JoinSlotScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const code = normalizeInviteCode(typeof params.code === "string" ? params.code : null);
  return code ? <JoinFlow key={code} code={code} /> : <CodeEntry typed={params.code} />;
}

/** Leaves for the Créneaux list where it can show: on the web. */
const opensSlotList = Platform.OS === "web";

// ── No code: type or paste it ─────────────────────────────────────────────────

function CodeEntry({ typed }: { typed?: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const focus = useFieldFocus();
  const [value, setValue] = useState(typeof typed === "string" ? typed : "");
  const [invalid, setInvalid] = useState(false);

  const submit = () => {
    const code = normalizeInviteCode(value);
    setInvalid(!code);
    if (code) router.setParams({ code });
  };

  return (
    <SlotPage
      eyebrow={t("slot.join_flow.eyebrow")}
      title={t("slot.join_flow.title")}
      backLabel={t("common.back")}
      testID="join-code-screen"
    >
      <SlotCardBox>
        <View style={styles.field}>
          <Text style={styles.label} nativeID="join-code-label">
            {t("slot.join_flow.code_label")}
          </Text>
          <TextInput
            {...focus.focusProps}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              setInvalid(false);
            }}
            onSubmitEditing={submit}
            style={[styles.input, focus.inputStyle, focus.focusStyle]}
            placeholder={t("slot.join_flow.code_placeholder")}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            aria-labelledby="join-code-label"
            aria-invalid={invalid}
            testID="join-code-input"
          />
          <Text style={invalid ? styles.fieldError : styles.hint} aria-live="polite">
            {t(invalid ? "slot.join_flow.code_invalid" : "slot.join_flow.code_hint")}
          </Text>
        </View>
        <SlotButton
          label={t("slot.join_flow.continue")}
          tone="primary"
          onPress={submit}
          testID="join-code-continue"
        />
      </SlotCardBox>
    </SlotPage>
  );
}

// ── A code: the invitation ────────────────────────────────────────────────────

function JoinFlow({ code }: { code: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const names = useMemo(() => dateNames(t), [t]);
  const preview = useJoinPreview(code);
  const recognized = useRecognizedSlot(code, preview.data);
  const join = useJoinSlot();
  const [joinedAs, setJoinedAs] = useState<string | null>(null);

  const recognizedName = recognized.slot ? myName(recognized.slot) : null;
  const isIn = joinedAs !== null || !!recognized.slot;

  // The player is in: the web build shows their slots.
  useEffect(() => {
    if (opensSlotList && isIn) router.replace("/(tabs)/slot");
  }, [isIn]);

  const goneLink = preview.isError && isPikFailure(preview.error, "not-found");
  const title = preview.data?.name
    ?? t(goneLink ? "slot.join_flow.gone_title" : "slot.join_flow.title");

  const body = () => {
    if (preview.isPending) return <Centered label={t("slot.join_flow.loading")} />;
    if (goneLink) {
      return (
        <>
          <SlotNotice title={t("slot.join_flow.gone_title")} testID="join-gone">
            {t("slot.join_flow.gone_text")}
          </SlotNotice>
          <SlotButton
            label={t("slot.join_flow.other_code")}
            onPress={() => router.setParams({ code: "" })}
            testID="join-other-code"
          />
        </>
      );
    }
    if (preview.isError) {
      return (
        <SlotErrorBox
          title={t("slot.join_flow.load_error")}
          error={preview.error}
          onRetry={() => void preview.refetch()}
          retrying={preview.isRefetching}
        />
      );
    }
    const slot = preview.data;
    if (isIn) {
      if (opensSlotList) return <Centered label={t("common.loading")} />;
      const name = joinedAs ?? recognizedName ?? "";
      return (
        <>
          <SlotNotice
            tone="success"
            title={t(
              joinedAs !== null ? "slot.join_flow.joined_title" : "slot.join_flow.already_title",
              {
                name,
              },
            )}
            testID={joinedAs !== null ? "join-joined" : "join-already"}
          >
            {t("slot.join_flow.joined_text", { name, slot: slot.name })}
          </SlotNotice>
          <PersonalLinkCard testID="join-personal-link" />
          <SlotButton
            label={t("slot.join_flow.done")}
            tone="primary"
            onPress={() => router.replace("/")}
            testID="join-done"
          />
        </>
      );
    }
    return (
      <>
        <PreviewCard preview={slot} names={names} />
        {recognized.isPending
          ? <Centered label={t("slot.join_flow.checking")} />
          : (
            <WhoAreYou
              preview={slot}
              busy={join.isPending}
              error={join.error}
              onJoin={(choice, name) =>
                join.mutate({ code, choice }, { onSuccess: () => setJoinedAs(name) })}
            />
          )}
      </>
    );
  };

  return (
    <SlotPage
      eyebrow={t("slot.join_flow.eyebrow")}
      title={title}
      subtitle={preview.data
        ? formatSchedule(t, names, locale, previewSchedule(preview.data))
        : undefined}
      backLabel={t("common.back")}
      loading={preview.isPending}
      testID="join-screen"
    >
      {body()}
    </SlotPage>
  );
}

const previewSchedule = (preview: JoinPreview) => ({
  weekday: preview.weekday,
  time_from: preview.time_from,
  interval_weeks: preview.interval_weeks,
});

function PreviewCard(
  { preview, names }: {
    preview: JoinPreview;
    names: ReturnType<typeof dateNames>;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const next = preview.next_session ? parseIsoDate(preview.next_session) : null;
  return (
    <SlotCardBox>
      <View style={styles.infoRow}>
        <MapPin color={colors.muted} size={15} />
        <Text style={styles.infoText}>
          {`${preview.venue} · ${
            t(`slot.court.${preview.court}`, { defaultValue: preview.court })
          }`}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <CalendarClock color={colors.red} size={15} />
        <Text style={styles.infoStrong}>
          {next
            ? t("slot.join_flow.next_session", { date: formatDay(t, names, next) })
            : t("slot.season_over")}
        </Text>
      </View>
    </SlotCardBox>
  );
}

// ── "Qui es-tu ?" ─────────────────────────────────────────────────────────────

const OWN_NAME = "own-name";

function WhoAreYou(
  { preview, busy, error, onJoin }: {
    preview: JoinPreview;
    busy: boolean;
    error: unknown;
    onJoin: (choice: JoinChoice, name: string) => void;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const focus = useFieldFocus();
  const [selected, setSelected] = useState<string | null>(null);
  const [ownName, setOwnName] = useState("");
  const [checked, setChecked] = useState(false);

  // A name taken, or a list closed, meanwhile: the preview comes back without it.
  const free = preview.free_names;
  const selection = selected === OWN_NAME
    ? (canAddName(preview) ? OWN_NAME : null)
    : free.some((name) => name.member_id === selected)
    ? selected
    : null;
  const freeChoice = free.find((name) => name.member_id === selection);
  const problem = selection === OWN_NAME ? nameProblem(ownName, free) : undefined;

  if (nothingToPick(preview)) {
    return (
      <SlotNotice title={t("slot.join_flow.who")} testID="join-nothing-to-pick">
        {t("slot.join_flow.nothing_to_pick")}
      </SlotNotice>
    );
  }

  const label = freeChoice
    ? t("slot.join_flow.its_me", { name: freeChoice.name })
    : selection === OWN_NAME && !problem
    ? t("slot.join_flow.join_as", { name: normalizeName(ownName) })
    : t("slot.join_flow.pick_first");

  const submit = () => {
    if (freeChoice) {
      onJoin({ memberId: freeChoice.member_id }, freeChoice.name);
      return;
    }
    if (selection !== OWN_NAME) return;
    setChecked(true);
    if (problem?.code === "in_list") setSelected(problem.memberId);
    if (problem) return;
    const name = normalizeName(ownName);
    onJoin({ name }, name);
  };

  const problemText = problem && checked
    ? t(`slot.join_flow.name_errors.${problem.code}`, {
      max: NAME_MAX,
      name: normalizeName(ownName),
    })
    : null;

  return (
    <SlotCardBox>
      <SectionTitle>{t("slot.join_flow.who")}</SectionTitle>
      <Paragraph>{t("slot.join_flow.who_hint")}</Paragraph>

      <View role="radiogroup" aria-label={t("slot.join_flow.who")} style={styles.options}>
        {free.map((name) => (
          <Option
            key={name.member_id}
            label={name.name}
            selected={selection === name.member_id}
            onPress={() => setSelected(name.member_id)}
            testID={`join-name-${name.member_id}`}
          />
        ))}
        {canAddName(preview) && (
          <Option
            label={t("slot.join_flow.not_in_list")}
            selected={selection === OWN_NAME}
            onPress={() => setSelected(OWN_NAME)}
            icon={<UserPlus color={colors.muted} size={16} />}
            testID="join-not-in-list"
          />
        )}
      </View>

      {!canAddName(preview) && <Text style={styles.hint}>{t("slot.join_flow.list_closed")}</Text>}

      {selection === OWN_NAME && (
        <View style={styles.field}>
          <Text style={styles.label} nativeID="join-name-label">
            {t("slot.join_flow.name_label")}
          </Text>
          <TextInput
            {...focus.focusProps}
            value={ownName}
            onChangeText={(text) => {
              setOwnName(text);
              setChecked(false);
            }}
            onSubmitEditing={submit}
            style={[styles.input, focus.inputStyle, focus.focusStyle]}
            placeholder={t("slot.join_flow.name_placeholder")}
            placeholderTextColor={colors.placeholder}
            maxLength={NAME_MAX * 2}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            aria-labelledby="join-name-label"
            aria-invalid={!!problemText}
            testID="join-name-input"
          />
          {problemText && (
            <Text style={styles.fieldError} accessibilityRole="alert">
              {problemText}
            </Text>
          )}
        </View>
      )}

      {!!error && <SlotErrorBox title={t("slot.join_flow.join_error")} error={error} />}

      <SlotButton
        label={busy ? t("slot.join_flow.joining") : label}
        tone="primary"
        onPress={submit}
        busy={busy}
        disabled={!selection}
        icon={<UserCheck color={selection ? colors.onRedStrong : colors.muted} size={18} />}
        testID="join-submit"
      />
    </SlotCardBox>
  );
}

function Option(
  { label, selected, onPress, icon, testID }: {
    label: string;
    selected: boolean;
    onPress: () => void;
    icon?: React.ReactNode;
    testID?: string;
  },
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  return (
    <Pressable
      onPress={onPress}
      role="radio"
      aria-checked={selected}
      accessibilityLabel={label}
      testID={testID}
      style={(state: InteractionState) => [
        styles.option,
        selected ? styles.optionSelected : null,
        state.hovered && !selected ? interaction.hoverBorder : null,
        showsFocusRing(state) ? interaction.focusRing : null,
      ]}
    >
      {icon}
      <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>{label}</Text>
      {selected && <Check color={colors.red} size={18} />}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    field: { gap: 8 },
    label: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.3,
    },
    input: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      paddingHorizontal: 18,
      paddingVertical: 16,
      fontSize: 16,
      color: c.ink,
      fontWeight: "700",
    },
    hint: { color: c.muted, fontSize: 13, fontWeight: "600", lineHeight: 18 },
    fieldError: { color: c.red, fontSize: 13, fontWeight: "700", lineHeight: 18 },

    infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoText: { flex: 1, color: c.muted, fontSize: 14, fontWeight: "600" },
    infoStrong: { flex: 1, color: c.ink, fontSize: 15, fontWeight: "800" },

    options: { gap: 8 },
    option: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    optionSelected: { backgroundColor: c.redSoft, borderColor: c.redSoft },
    optionText: { flex: 1, color: c.ink, fontSize: 15, fontWeight: "700" },
    optionTextSelected: { color: c.red, fontWeight: "800" },
  });
