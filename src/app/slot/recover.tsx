import { router } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { isPikFailure } from "@/api/pik";
import { LifeBuoy } from "@/components/icons";
import {
  Centered,
  Paragraph,
  PersonalLinkCard,
  SlotButton,
  SlotCardBox,
  SlotErrorBox,
  SlotNotice,
  SlotPage,
} from "@/components/SlotParts";
import { useLinkSecret } from "@/hooks/use-link-secret";
import { useRedeemRecovery } from "@/hooks/use-slots";
import { useTheme } from "@/hooks/use-theme";

/**
 * The recovery link, `/slot/recover#t=…`, that an organizer sends privately to a member who lost
 * their device (kancha ADR-0002). It gives the member back to this device, with their answers,
 * once and within 24 hours. The token is in the fragment, as in the personal link; only the call
 * to pik puts it in a path (`POST /recover/{token}`).
 *
 * The link is redeemed on a press, never on load: opened in a messaging app's own browser, whose
 * storage is apart from the usual browser's, it would be spent there. On the web pik sets its
 * cookie in the response when this browser has no player yet.
 */
export default function RecoveryLinkScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const secret = useLinkSecret("recover");
  const redeem = useRedeemRecovery();
  const web = Platform.OS === "web";

  // The web build shows the player's slots; the Créneaux tab is still hidden on iOS and Android.
  useEffect(() => {
    if (web && redeem.isSuccess) router.replace("/(tabs)/slot");
  }, [web, redeem.isSuccess]);

  const gone = isPikFailure(redeem.error, "recovery-link-gone")
    || isPikFailure(redeem.error, "not-found");

  const body = () => {
    if (!secret.ready) return <Centered label={t("common.loading")} />;
    if (!secret.token) {
      return (
        <SlotNotice title={t("slot.recover_screen.invalid_title")} testID="recovery-invalid">
          {t("slot.recover_screen.invalid_text")}
        </SlotNotice>
      );
    }
    if (redeem.isSuccess) {
      if (web) return <Centered label={t("common.loading")} />;
      return (
        <>
          <SlotNotice
            tone="success"
            title={t("slot.recover_screen.done_title")}
            testID="recovery-done"
          >
            {t("slot.recover_screen.done_text")}
          </SlotNotice>
          <PersonalLinkCard testID="recovery-personal-link" />
          <SlotButton
            label={t("slot.join_flow.done")}
            tone="primary"
            onPress={() => router.replace("/")}
            testID="recovery-finish"
          />
        </>
      );
    }
    if (gone) {
      return (
        <SlotNotice title={t("slot.recover_screen.gone_title")} testID="recovery-gone">
          {t("slot.recover_screen.gone_text")}
        </SlotNotice>
      );
    }
    const token = secret.token;
    return (
      <SlotCardBox>
        <LifeBuoy color={colors.red} size={22} />
        <Paragraph strong>{t("slot.recover_screen.text")}</Paragraph>
        <Paragraph>{t("slot.recover_screen.in_app_browser")}</Paragraph>
        {!!redeem.error && (
          <SlotErrorBox title={t("slot.recover_screen.error")} error={redeem.error} />
        )}
        <SlotButton
          label={t("slot.recover_screen.use")}
          tone="primary"
          busy={redeem.isPending}
          onPress={() => redeem.mutate(token)}
          testID="recovery-use"
        />
      </SlotCardBox>
    );
  };

  return (
    <SlotPage
      eyebrow={t("slot.recover_screen.eyebrow")}
      title={t("slot.recover_screen.title")}
      backLabel={t("common.back")}
      testID="recovery-screen"
    >
      {body()}
    </SlotPage>
  );
}
