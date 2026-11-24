import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { MemberView, RecoveryLink, SlotDetail } from "@/api/pik";
import { Crown, Lock, LockOpen, Plus, RefreshCw, UserMinus } from "@/components/icons";
import {
  Centered,
  LinkActions,
  Paragraph,
  PersonalLinkCard,
  SectionTitle,
  SlotButton,
  SlotCardBox,
  SlotErrorBox,
  SlotNotice,
  SlotPage,
} from "@/components/SlotParts";
import { StatusPill } from "@/components/StatusPill";
import type { Palette } from "@/constants/colors";
import { dateNames, formatSchedule } from "@/features/slots/format";
import {
  type MemberAction,
  memberActions,
  NAME_MAX,
  nameKey,
  suggestCoOrganizer,
} from "@/features/slots/join";
import { inviteUrl, recoveryUrl } from "@/features/slots/links";
import { normalizeName } from "@/features/slots/wizard";
import {
  type InteractionState,
  showsFocusRing,
  useFieldFocus,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import {
  newIdempotencyKey,
  useAddMember,
  useCreateRecoveryLink,
  useReleaseName,
  useRotateInviteCode,
  useSetListClosed,
  useSlotDetail,
  useUpdateMember,
} from "@/hooks/use-slots";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

/**
 * A slot's players and invite link (#158), `/slot/members?id=…`. Every member sees the list of
 * names and the invite link to post in the group chat. Organizers also manage the list (kancha
 * ADR-0002): add a name, make a member organizer, create a recovery link to send privately,
 * free a name, change the invite link, close or reopen the list.
 *
 * The slot wizard opens it once the slot is created (`created=1`), to suggest naming the players
 * and a second organizer before posting the link.
 */
export default function SlotMembersScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const names = useMemo(() => dateNames(t), [t]);
  const params = useLocalSearchParams<{ id?: string; created?: string }>();
  const slotId = typeof params.id === "string" && params.id ? params.id : null;
  const detail = useSlotDetail(slotId);
  const slot = detail.data;

  return (
    <SlotPage
      eyebrow={t("slot.members_screen.eyebrow")}
      title={slot?.name ?? t("slot.members_screen.eyebrow")}
      subtitle={slot ? formatSchedule(t, names, locale, slot.schedule) : undefined}
      backLabel={t("tabs.slot")}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/slot"))}
      loading={!!slotId && detail.isPending}
      testID="slot-members-screen"
    >
      {!slotId
        ? <SlotNotice>{t("slot.errors.not_found")}</SlotNotice>
        : detail.isError
        ? (
          <SlotErrorBox
            title={t("slot.members_screen.load_error")}
            error={detail.error}
            onRetry={() => void detail.refetch()}
            retrying={detail.isRefetching}
          />
        )
        : !slot
        ? <Centered label={t("common.loading")} />
        : <Members slot={slot} created={params.created === "1"} />}
    </SlotPage>
  );
}

function Members({ slot, created }: { slot: SlotDetail; created: boolean }) {
  const { t } = useTranslation();
  const organizer = slot.me.role === "organizer";
  return (
    <>
      {created && organizer && (
        <SlotNotice
          tone="success"
          title={t("slot.members_screen.created_title")}
          testID="members-created"
        >
          {t("slot.members_screen.created_text")}
        </SlotNotice>
      )}
      <InviteCard slot={slot} />
      <NamesCard slot={slot} />
      <PersonalLinkCard testID="members-personal-link" />
    </>
  );
}

// ── Invite link ───────────────────────────────────────────────────────────────

function InviteCard({ slot }: { slot: SlotDetail }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const rotate = useRotateInviteCode(slot.id);
  const [confirming, setConfirming] = useState(false);
  const organizer = slot.me.role === "organizer";

  return (
    <SlotCardBox>
      <SectionTitle>{t("slot.members_screen.invite_title")}</SectionTitle>
      <Paragraph>{t("slot.members_screen.invite_text")}</Paragraph>
      <LinkActions
        url={inviteUrl(slot.invite_code)}
        message={t("slot.members_screen.invite_message", { slot: slot.name })}
        shareLabel={t("slot.links.share")}
        copyLabel={t("slot.links.copy")}
        testID="members-invite"
      />
      {rotate.isSuccess && !confirming && (
        <SlotNotice tone="success" testID="members-rotated">
          {t("slot.members_screen.rotated")}
        </SlotNotice>
      )}
      {!!rotate.error && (
        <SlotErrorBox title={t("slot.members_screen.action_error")} error={rotate.error} />
      )}
      {organizer && (
        confirming
          ? (
            <>
              <Paragraph strong>{t("slot.members_screen.rotate_hint")}</Paragraph>
              <SlotButton
                label={t("slot.members_screen.rotate_confirm")}
                tone="primary"
                busy={rotate.isPending}
                onPress={() => rotate.mutate(undefined, { onSettled: () => setConfirming(false) })}
                testID="members-rotate-confirm"
              />
              <SlotButton
                label={t("slot.members_screen.rotate_cancel")}
                onPress={() => setConfirming(false)}
                testID="members-rotate-cancel"
              />
            </>
          )
          : (
            <SlotButton
              label={t("slot.members_screen.rotate")}
              icon={<RefreshCw color={colors.red} size={16} />}
              onPress={() => setConfirming(true)}
              testID="members-rotate"
            />
          )
      )}
    </SlotCardBox>
  );
}

// ── The list of names ─────────────────────────────────────────────────────────

function NamesCard({ slot }: { slot: SlotDetail }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const organizer = slot.me.role === "organizer";
  const setList = useSetListClosed(slot.id);
  const [recovery, setRecovery] = useState<{ memberId: string; link: RecoveryLink } | null>(null);

  return (
    <SlotCardBox>
      <SectionTitle>
        {t("slot.members_screen.list_title", { count: slot.members.length })}
      </SectionTitle>

      <View style={styles.listState}>
        {slot.list_closed
          ? <Lock color={colors.muted} size={16} />
          : <LockOpen color={colors.green} size={16} />}
        <Text style={styles.listStateText} testID="members-list-state">
          {t(
            slot.list_closed ? "slot.members_screen.list_closed" : "slot.members_screen.list_open",
          )}
        </Text>
      </View>

      {organizer && suggestCoOrganizer(slot) && (
        <SlotNotice testID="members-co-organizer">
          {t("slot.members_screen.co_organizer_hint")}
        </SlotNotice>
      )}

      <View style={styles.rows}>
        {slot.members.map((member) => (
          <MemberRow
            key={member.id}
            slot={slot}
            member={member}
            recovery={recovery?.memberId === member.id ? recovery.link : null}
            onRecovery={(link) => setRecovery(link ? { memberId: member.id, link } : null)}
          />
        ))}
      </View>

      {organizer && (
        <>
          <AddName slot={slot} />
          {!!setList.error && (
            <SlotErrorBox title={t("slot.members_screen.action_error")} error={setList.error} />
          )}
          <SlotButton
            label={t(
              slot.list_closed
                ? "slot.members_screen.reopen_list"
                : "slot.members_screen.close_list",
            )}
            icon={slot.list_closed
              ? <LockOpen color={colors.red} size={16} />
              : <Lock color={colors.red} size={16} />}
            busy={setList.isPending}
            onPress={() => setList.mutate(!slot.list_closed)}
            testID="members-toggle-list"
          />
        </>
      )}
    </SlotCardBox>
  );
}

const ACTION_ICONS: Record<MemberAction, typeof Crown> = {
  make_organizer: Crown,
  remove_organizer: Crown,
  recovery_link: RefreshCw,
  release_name: UserMinus,
};

function MemberRow(
  { slot, member, recovery, onRecovery }: {
    slot: SlotDetail;
    member: MemberView;
    recovery: RecoveryLink | null;
    onRecovery: (link: RecoveryLink | null) => void;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  const update = useUpdateMember(slot.id);
  const release = useReleaseName(slot.id);
  const createRecovery = useCreateRecoveryLink(slot.id);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const actions = memberActions(member, slot.me);
  const isMe = member.id === slot.me.member_id;
  const name = member.name ?? t("slot.members_screen.former_player");
  const error = update.error ?? release.error ?? createRecovery.error;
  const busy = update.isPending || release.isPending || createRecovery.isPending;

  const run = (action: MemberAction) => {
    if (busy) return;
    switch (action) {
      case "make_organizer":
      case "remove_organizer":
        update.mutate({
          memberId: member.id,
          changes: { role: action === "make_organizer" ? "organizer" : "player" },
        });
        break;
      case "recovery_link":
        onRecovery(null);
        createRecovery.mutate(
          { memberId: member.id, key: newIdempotencyKey() },
          { onSuccess: (link) => onRecovery(link) },
        );
        break;
      case "release_name":
        if (!confirmRelease) {
          setConfirmRelease(true);
          return;
        }
        release.mutate(member.id, { onSettled: () => setConfirmRelease(false) });
        break;
    }
  };

  return (
    <View style={styles.row} testID={`member-${member.id}`}>
      <View style={styles.rowHead}>
        <Text style={styles.memberName} numberOfLines={1}>{name}</Text>
        {isMe && <StatusPill label={t("slot.members_screen.you")} tone="green" size="small" />}
        {member.role === "organizer" && (
          <StatusPill label={t("slot.members_screen.organizer")} tone="dark" size="small" />
        )}
        <StatusPill
          label={t(member.claimed ? "slot.members_screen.claimed" : "slot.members_screen.free")}
          tone="soft"
          size="small"
        />
      </View>

      {actions.length > 0 && (
        <View
          style={styles.actions}
          role="group"
          aria-label={t("slot.members_screen.actions_label", { name })}
        >
          {actions.map((action) => {
            const Icon = ACTION_ICONS[action];
            const armed = action === "release_name" && confirmRelease;
            const label = t(
              armed
                ? "slot.members_screen.actions.release_confirm"
                : `slot.members_screen.actions.${action}`,
            );
            return (
              <Pressable
                key={action}
                onPress={() => run(action)}
                accessibilityRole="button"
                accessibilityLabel={`${label}, ${name}`}
                aria-busy={busy}
                testID={`member-${member.id}-${action}`}
                style={(state: InteractionState) => [
                  styles.action,
                  armed ? styles.actionArmed : null,
                  state.hovered ? interaction.hoverBorder : null,
                  showsFocusRing(state) ? interaction.focusRing : null,
                ]}
              >
                <Icon color={armed ? colors.redDark : colors.red} size={14} />
                <Text style={[styles.actionText, armed ? styles.actionTextArmed : null]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {confirmRelease && <Text style={styles.hint}>{t("slot.members_screen.release_hint")}</Text>}
      {!!error && <SlotErrorBox title={t("slot.members_screen.action_error")} error={error} />}

      {recovery && (
        <View style={styles.recovery} testID={`member-${member.id}-recovery`}>
          <Text style={styles.recoveryTitle}>
            {t("slot.members_screen.recovery_title", { name })}
          </Text>
          <Text style={styles.hint}>{t("slot.members_screen.recovery_text", { name })}</Text>
          <LinkActions
            url={recoveryUrl(recovery.token)}
            secret
            message={t("slot.members_screen.recovery_message", { slot: slot.name })}
            shareLabel={t("slot.members_screen.recovery_share")}
            copyLabel={t("slot.links.copy")}
            testID={`member-${member.id}-recovery-link`}
          />
        </View>
      )}
    </View>
  );
}

function AddName({ slot }: { slot: SlotDetail }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const focus = useFieldFocus();
  const interaction = useInteractionStyles();
  const add = useAddMember(slot.id);
  const [value, setValue] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const submit = () => {
    const name = normalizeName(value);
    const taken = slot.members.some((member) =>
      member.name && nameKey(member.name) === nameKey(name)
    );
    const next = !name
      ? t("slot.join_flow.name_errors.required")
      : Array.from(name).length > NAME_MAX
      ? t("slot.join_flow.name_errors.too_long", { max: NAME_MAX })
      : taken
      ? t("slot.errors.name_taken")
      : null;
    setProblem(next);
    if (next || add.isPending) return;
    add.mutate(name, { onSuccess: () => setValue("") });
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label} nativeID="members-add-label">
        {t("slot.members_screen.add_label")}
      </Text>
      <View style={styles.addRow}>
        <TextInput
          {...focus.focusProps}
          value={value}
          onChangeText={(text) => {
            setValue(text);
            setProblem(null);
          }}
          onSubmitEditing={submit}
          style={[styles.input, focus.inputStyle, focus.focusStyle]}
          placeholder={t("slot.join_flow.name_placeholder")}
          placeholderTextColor={colors.placeholder}
          maxLength={NAME_MAX * 2}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          aria-labelledby="members-add-label"
          aria-invalid={!!problem}
          testID="members-add-input"
        />
        <Pressable
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel={t("slot.members_screen.add")}
          aria-busy={add.isPending}
          testID="members-add"
          style={(state: InteractionState) => [
            styles.addButton,
            showsFocusRing(state) ? interaction.focusRing : null,
          ]}
        >
          <Plus color={colors.onRedStrong} size={20} />
        </Pressable>
      </View>
      {problem && <Text style={styles.fieldError} accessibilityRole="alert">{problem}</Text>}
      {!!add.error && (
        <SlotErrorBox title={t("slot.members_screen.action_error")} error={add.error} />
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    listState: { flexDirection: "row", alignItems: "center", gap: 8 },
    listStateText: { flex: 1, color: c.text, fontSize: 14, fontWeight: "600", lineHeight: 20 },

    rows: { gap: 10 },
    row: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      padding: 14,
      gap: 10,
    },
    rowHead: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
    memberName: { flexShrink: 1, color: c.ink, fontSize: 16, fontWeight: "800", marginRight: 4 },
    actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    action: {
      minHeight: 44,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.card,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionArmed: { backgroundColor: c.redSoft, borderColor: c.redSoft },
    actionText: { color: c.ink, fontSize: 13, fontWeight: "700" },
    actionTextArmed: { color: c.redDark },
    hint: { color: c.muted, fontSize: 13, fontWeight: "600", lineHeight: 18 },

    recovery: {
      borderRadius: 14,
      backgroundColor: c.cream,
      padding: 12,
      gap: 8,
    },
    recoveryTitle: { color: c.ink, fontSize: 15, fontWeight: "800" },

    field: { gap: 8 },
    label: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.3,
    },
    addRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
    input: {
      flex: 1,
      minWidth: 0,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.white,
      paddingHorizontal: 18,
      paddingVertical: 14,
      fontSize: 16,
      color: c.ink,
      fontWeight: "700",
    },
    addButton: {
      width: 52,
      borderRadius: 16,
      backgroundColor: c.redFill,
      alignItems: "center",
      justifyContent: "center",
    },
    fieldError: { color: c.red, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  });
