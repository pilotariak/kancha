import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, View } from "react-native";

import { isPikFailure } from "@/api/pik";
import { KeyRound } from "@/components/icons";
import {
  Centered,
  Paragraph,
  SlotButton,
  SlotCardBox,
  SlotErrorBox,
  SlotNotice,
  SlotPage,
} from "@/components/SlotParts";
import type { Palette } from "@/constants/colors";
import { useLinkSecret } from "@/hooks/use-link-secret";
import { useAdoptToken, useDeviceToken, useMySlots, usePersonalLinkSlots } from "@/hooks/use-slots";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

/**
 * The personal link, `/slot/me#t=…` (kancha ADR-0002): it gives a player their names back on
 * this device without an organizer. The token is in the fragment, read by `useLinkSecret`.
 *
 * Native only. On the web the token lives in pik's `HttpOnly` cookie, which pik sets only for a
 * token it issues (a join, a recovery, a new slot): no call takes a known token and sets the
 * cookie, so the page cannot restore one, and keeping it in browser storage is ruled out
 * (ADR-0004). The web page says so and points to a recovery link.
 */
export default function PersonalLinkScreen() {
  const { t } = useTranslation();
  const secret = useLinkSecret("me");
  const web = Platform.OS === "web";

  return (
    <SlotPage
      eyebrow={t("slot.me_screen.eyebrow")}
      title={t("slot.me_screen.title")}
      backLabel={t("common.back")}
      testID="personal-link-screen"
    >
      {!secret.ready
        ? <Centered label={t("common.loading")} />
        : web
        ? <WebNotice />
        : !secret.token
        ? (
          <SlotNotice title={t("slot.me_screen.invalid_title")} testID="personal-link-invalid">
            {t("slot.me_screen.invalid_text")}
          </SlotNotice>
        )
        : <RestoreFromLink token={secret.token} />}
    </SlotPage>
  );
}

function WebNotice() {
  const { t } = useTranslation();
  return (
    <>
      <SlotNotice title={t("slot.me_screen.web_title")} testID="personal-link-web">
        {t("slot.me_screen.web_text")}
      </SlotNotice>
      <SlotButton
        label={t("slot.me_screen.to_slots")}
        onPress={() => router.replace("/(tabs)/slot")}
        testID="personal-link-to-slots"
      />
    </>
  );
}

function RestoreFromLink({ token }: { token: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const linked = usePersonalLinkSlots(token);
  const current = useDeviceToken();
  const mine = useMySlots();
  const adopt = useAdoptToken();

  if (adopt.isSuccess) {
    return (
      <>
        <SlotNotice
          tone="success"
          title={t("slot.me_screen.restored_title")}
          testID="personal-link-restored"
        >
          {t("slot.me_screen.restored_text")}
        </SlotNotice>
        <SlotButton
          label={t("slot.join_flow.done")}
          tone="primary"
          onPress={() => router.replace("/")}
          testID="personal-link-done"
        />
      </>
    );
  }
  if (linked.isPending) return <Centered label={t("slot.me_screen.checking")} />;
  if (linked.isError) {
    return isPikFailure(linked.error, "unauthorized")
      ? (
        <SlotNotice title={t("slot.me_screen.unknown_title")} testID="personal-link-unknown">
          {t("slot.me_screen.unknown_text")}
        </SlotNotice>
      )
      : (
        <SlotErrorBox
          title={t("slot.me_screen.check_error")}
          error={linked.error}
          onRetry={() => void linked.refetch()}
          retrying={linked.isRefetching}
        />
      );
  }

  const slots = linked.data.slots;
  const sameDevice = current === token;
  // Another player already answers on this device: using the link moves the device to the
  // link's player, and that player's slots are only reachable again with its own link.
  const replaced = !sameDevice && current ? (mine.data?.slots.length ?? 0) : 0;

  return (
    <>
      <SlotCardBox>
        <View style={styles.titleRow}>
          <KeyRound color={colors.red} size={18} />
          <Text style={styles.title}>
            {slots.length > 0
              ? t("slot.me_screen.slots_intro", { count: slots.length })
              : t("slot.me_screen.no_slots")}
          </Text>
        </View>
        {slots.map((slot) => (
          <Text key={slot.id} style={styles.slotName} testID={`personal-link-slot-${slot.id}`}>
            {slot.name}
          </Text>
        ))}
      </SlotCardBox>

      {sameDevice
        ? <SlotNotice testID="personal-link-same">{t("slot.me_screen.same_device")}</SlotNotice>
        : (
          <>
            {replaced > 0 && (
              <SlotNotice title={t("slot.me_screen.replace_title")} testID="personal-link-replace">
                {t("slot.me_screen.replace_warning", { count: replaced })}
              </SlotNotice>
            )}
            {!!adopt.error && (
              <SlotErrorBox title={t("slot.me_screen.check_error")} error={adopt.error} />
            )}
            <Paragraph>{t("slot.me_screen.use_hint")}</Paragraph>
            <SlotButton
              label={t("slot.me_screen.use")}
              tone="primary"
              busy={adopt.isPending}
              onPress={() => adopt.mutate(token)}
              testID="personal-link-use"
            />
          </>
        )}
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { flex: 1, color: c.ink, fontSize: 16, fontWeight: "800" },
    slotName: { color: c.text, fontSize: 15, fontWeight: "700" },
  });
