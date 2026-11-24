import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Copy, KeyRound, RotateCcw, Share as ShareIcon, Share2 } from "@/components/icons";
import { PressableScale } from "@/components/PressableScale";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { Palette } from "@/constants/colors";
import { slotErrorMessage } from "@/features/slots/errors";
import { personalUrl } from "@/features/slots/links";
import { messageText } from "@/features/slots/messages";
import { useTextColumn } from "@/hooks/use-layout";
import { useDeviceToken } from "@/hooks/use-slots";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

/**
 * The parts of the slot screens that come with joining a slot (#158): the page, cards, buttons,
 * the error box and the link actions. They follow DESIGN.md: the red band, cream below it, one
 * red action per level.
 */

/** Back to the previous screen, or to the start when the screen was opened from a link. */
export function backOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export function SlotPage(
  { title, eyebrow, subtitle, backLabel, onBack, loading, children, testID }: {
    title: string;
    eyebrow?: string;
    subtitle?: string;
    backLabel?: string;
    onBack?: () => void;
    loading?: boolean;
    children: ReactNode;
    testID?: string;
  },
) {
  const styles = useThemedStyles(makeStyles);
  const column = useTextColumn();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        testID={testID}
      >
        <ScreenHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          backLabel={backLabel}
          onBack={onBack ?? backOrHome}
          loading={loading}
          column={column}
        />
        <View style={[styles.body, column]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SlotCardBox({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={styles.sectionTitle} accessibilityRole="header">{children}</Text>;
}

export function Paragraph({ children, strong }: { children: ReactNode; strong?: boolean }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={strong ? styles.paragraphStrong : styles.paragraph}>{children}</Text>;
}

export function Centered({ label }: { label: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.red} accessibilityLabel={label} />
    </View>
  );
}

export type ButtonTone = "primary" | "secondary";

/**
 * A full-width button: `primary` is the screen's red action, `secondary` a white one. Never
 * disabled while busy: a press then does nothing, and focus stays on the button.
 */
export function SlotButton(
  { label, onPress, tone = "secondary", icon, busy, disabled, testID, hint }: {
    label: string;
    onPress: () => void;
    tone?: ButtonTone;
    icon?: ReactNode;
    busy?: boolean;
    disabled?: boolean;
    testID?: string;
    hint?: string;
  },
) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const primary = tone === "primary";
  return (
    <PressableScale
      onPress={() => {
        if (!busy && !disabled) onPress();
      }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      aria-busy={busy}
      aria-disabled={disabled}
    >
      <View
        style={[
          styles.button,
          primary ? styles.buttonPrimary : null,
          disabled ? styles.buttonDisabled : null,
        ]}
      >
        {busy
          ? <ActivityIndicator color={primary ? colors.onRedStrong : colors.red} size="small" />
          : icon}
        <Text
          style={[
            styles.buttonText,
            primary ? styles.buttonTextPrimary : null,
            disabled ? styles.buttonTextDisabled : null,
          ]}
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

/** A failed pik call: a title, pik's message, and a retry when there is one. */
export function SlotErrorBox(
  { title, error, onRetry, retrying }: {
    title: string;
    error: unknown;
    onRetry?: () => void;
    retrying?: boolean;
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
      {onRetry && (
        <PressableScale
          onPress={() => {
            if (!retrying) onRetry();
          }}
          accessibilityRole="button"
          accessibilityLabel={t("error.retry")}
          aria-busy={retrying}
        >
          <View style={styles.retryButton}>
            {retrying
              ? <ActivityIndicator color={colors.red} size="small" />
              : <RotateCcw color={colors.red} size={14} />}
            <Text style={styles.retryLabel}>{t("error.retry")}</Text>
          </View>
        </PressableScale>
      )}
    </View>
  );
}

/** A notice on cream: why something cannot be done, or what happens next. */
export function SlotNotice(
  { title, children, tone = "neutral", testID }: {
    title?: string;
    children: ReactNode;
    tone?: "neutral" | "success";
    testID?: string;
  },
) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[styles.notice, tone === "success" ? styles.noticeSuccess : null]}
      testID={testID}
    >
      {title && <Text style={styles.noticeTitle}>{title}</Text>}
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

export type ShareOutcome = "shared" | "copied" | "failed";

/**
 * Opens the system share sheet with a message and its link. iOS shares the URL next to the text;
 * Android and the web share one text, the link on its last line, as `Share.share({ url })` is
 * iOS only. On the web, a browser without the share sheet copies `copy` instead (the whole text
 * by default). Closing the share sheet is not an error.
 */
export async function shareMessage(
  { message, url, copy }: { message?: string; url?: string; copy?: string },
): Promise<ShareOutcome> {
  const text = messageText({ text: message ?? "", url });
  try {
    if (Platform.OS === "ios") {
      await Share.share(url ? (message ? { message, url } : { url }) : { message: text });
    } else if (Platform.OS === "web" && typeof navigator.share !== "function") {
      await Clipboard.setStringAsync(copy ?? text);
      return "copied";
    } else {
      await Share.share({ message: text });
    }
    return "shared";
  } catch {
    return "failed";
  }
}

/**
 * Share and Copy for a link, through `shareMessage`. On the web, a browser without the share
 * sheet copies the link.
 */
export function LinkActions(
  { url, shareLabel, copyLabel, testID, message, secret }: {
    url: string;
    shareLabel: string;
    copyLabel: string;
    testID?: string;
    /** Text before the link in the shared message. */
    message?: string;
    /** A link with a token in its fragment: the screen shows it without the token. */
    secret?: boolean;
  },
) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [copied, setCopied] = useState(false);
  const ShareGlyph = Platform.OS === "android" ? Share2 : ShareIcon;

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    if ((await shareMessage({ message, url, copy: url })) === "copied") setCopied(true);
  };

  return (
    <View style={styles.linkActions} testID={testID}>
      <Text style={styles.linkText} selectable={!secret} numberOfLines={2}>
        {(secret ? url.replace(/#.*$/, "#…") : url).replace(/^https:\/\//, "")}
      </Text>
      <View style={styles.linkButtons}>
        <View style={styles.linkButton}>
          <SlotButton
            label={shareLabel}
            onPress={() => void share()}
            icon={<ShareGlyph color={colors.red} size={16} />}
            testID={testID ? `${testID}-share` : undefined}
          />
        </View>
        <View style={styles.linkButton}>
          <SlotButton
            label={copied ? t("slot.links.copied") : copyLabel}
            onPress={() => void copy()}
            icon={<Copy color={colors.red} size={16} />}
            testID={testID ? `${testID}-copy` : undefined}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * The personal link, offered after a player picks their name (kancha ADR-0002): optional, it
 * gives the name back without an organizer. Native only: the web build never sees its token,
 * which pik keeps in its cookie, and could not restore it (pik sets the cookie only for a token it
 * issues).
 */
export function PersonalLinkCard({ testID }: { testID?: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const token = useDeviceToken();
  if (Platform.OS === "web" || !token) return null;
  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.titleRow}>
        <KeyRound color={colors.red} size={18} />
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t("slot.personal_link.title")}
        </Text>
        <Text style={styles.optional}>{t("slot.personal_link.optional")}</Text>
      </View>
      <Text style={styles.paragraph}>{t("slot.personal_link.text")}</Text>
      <LinkActions
        url={personalUrl(token)}
        secret
        shareLabel={t("slot.personal_link.share")}
        copyLabel={t("slot.links.copy")}
        testID={testID ? `${testID}-actions` : undefined}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.redFill },
    scroll: { backgroundColor: c.cream },
    content: { paddingBottom: 120, flexGrow: 1 },
    body: { paddingHorizontal: 20, paddingTop: 22, gap: 22 },
    centered: { paddingVertical: 32, alignItems: "center" },

    card: {
      borderRadius: 20,
      backgroundColor: c.card,
      padding: 18,
      borderWidth: 1,
      borderColor: c.line,
      gap: 14,
    },
    sectionTitle: { color: c.ink, fontSize: 18, fontWeight: "800", flexShrink: 1 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    optional: {
      color: c.placeholder,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    paragraph: { color: c.text, fontSize: 15, lineHeight: 21 },
    paragraphStrong: { color: c.ink, fontSize: 15, lineHeight: 21, fontWeight: "700" },

    button: {
      minHeight: 48,
      borderRadius: 20,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 18,
      paddingVertical: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buttonPrimary: { backgroundColor: c.redFill, borderColor: c.redFill },
    buttonDisabled: { backgroundColor: c.cream, borderColor: c.line },
    buttonText: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "700",
      textAlign: "center",
      flexShrink: 1,
    },
    buttonTextPrimary: { color: c.onRedStrong },
    buttonTextDisabled: { color: c.muted },

    errorBox: {
      borderRadius: 16,
      backgroundColor: c.redSoft,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(200,16,46,0.2)",
    },
    errorTitle: { color: c.red, fontSize: 14, fontWeight: "700" },
    errorDetail: { color: c.text, fontSize: 13, fontWeight: "600", lineHeight: 18 },
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

    notice: {
      borderRadius: 16,
      backgroundColor: c.white,
      padding: 16,
      gap: 6,
      borderWidth: 1,
      borderColor: c.line,
    },
    noticeSuccess: { backgroundColor: c.greenSoft, borderColor: c.greenSoft },
    noticeTitle: { color: c.ink, fontSize: 15, fontWeight: "800" },
    noticeText: { color: c.text, fontSize: 14, lineHeight: 20, fontWeight: "600" },

    linkActions: { gap: 10 },
    linkText: { color: c.ink, fontSize: 14, fontWeight: "700" },
    linkButtons: { flexDirection: "row", gap: 10 },
    linkButton: { flex: 1 },
  });
