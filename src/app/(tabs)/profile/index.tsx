import Constants from "expo-constants";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Monitor,
  Moon,
  Sun,
  SunMoon,
} from "@/components/icons";
import { LeagueIcon } from "@/components/LeagueIcon";
import { ListGroup, ListSeparator, ROW_INSET } from "@/components/ListGroup";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { Palette } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import { languageNames, LANGUAGES, resolveLanguage } from "@/features/language/languages";
import {
  type InteractionState,
  showsFocusRing,
  useInteractionStyles,
} from "@/hooks/use-interaction-styles";
import { useTextColumn } from "@/hooks/use-layout";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import { type SupportedLanguage, useLanguageStore } from "@/store/language-store";
import { type ThemeMode, useThemeStore } from "@/store/theme-store";

const WEBSITE_URL = "https://pilotariak.com";
const APP_VERSION = Constants.expoConfig?.version ?? "—";
const COPYRIGHT_YEAR = new Date().getFullYear();

type Icon = React.ComponentType<{ size?: number; color?: string }>;

const THEMES: { mode: ThemeMode; Icon: Icon }[] = [
  { mode: "system", Icon: Monitor },
  { mode: "light", Icon: Sun },
  { mode: "dark", Icon: Moon },
];

// A picker's options line up with its label: the row inset, the 16px icon and its 8px gap.
const OPTION_INSET = ROW_INSET + 16 + 8;

const supportedLeagues = LEAGUES.filter((l) => l.supported);

/** Row fill on press and hover. The card clips its rows, so the focus ring goes inside. */
function useRowStyle() {
  const styles = useThemedStyles(makeStyles);
  const interaction = useInteractionStyles();
  return (state: InteractionState) => [
    (state.pressed || state.hovered) && styles.rowPressed,
    showsFocusRing(state) && [interaction.focusRing, styles.focusRingInside],
  ];
}

interface PickerProps<T extends string> {
  Icon: Icon;
  label: string;
  /** The selected option's name, at the end of the row. */
  value: string;
  options: readonly T[];
  selected: T;
  onSelect: (option: T) => void;
  /** An option's screen reader label. */
  optionLabel: (option: T) => string;
  renderOption: (option: T, isSelected: boolean) => React.ReactNode;
  testID: string;
  optionTestID: (option: T) => string;
}

/** A row that opens its options below it, in the same card. */
function Picker<T extends string>({
  Icon,
  label,
  value,
  options,
  selected,
  onSelect,
  optionLabel,
  renderOption,
  testID,
  optionTestID,
}: PickerProps<T>) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const rowStyle = useRowStyle();
  const [open, setOpen] = useState(false);

  return (
    <View testID={testID}>
      <Pressable
        style={(state: InteractionState) => [styles.row, ...rowStyle(state)]}
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        aria-expanded={open}
      >
        <View style={styles.rowLeft}>
          <Icon color={colors.muted} size={16} />
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{value}</Text>
          {open
            ? <ChevronUp color={colors.muted} size={16} />
            : <ChevronDown color={colors.muted} size={16} />}
        </View>
      </Pressable>

      {open && (
        <View accessibilityRole="radiogroup" accessibilityLabel={label}>
          {options.map((option) => {
            const isSelected = option === selected;
            return (
              <React.Fragment key={option}>
                <ListSeparator inset={OPTION_INSET} />
                <Pressable
                  style={(state: InteractionState) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    ...rowStyle(state),
                  ]}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  testID={optionTestID(option)}
                  accessibilityRole="radio"
                  aria-checked={isSelected}
                  accessibilityLabel={optionLabel(option)}
                >
                  {renderOption(option, isSelected)}
                  {isSelected && <View style={styles.selectedDot} />}
                </Pressable>
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function AboutScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const rowStyle = useRowStyle();
  const column = useTextColumn();
  const { language, setLanguage } = useLanguageStore();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();

  const currentLang = resolveLanguage(language ?? i18n.language);
  // A language's own name comes from its own locale file, the other from the interface's.
  const namesOf = (code: SupportedLanguage) =>
    languageNames(t(`language.${code}`, { lng: code }), t(`language.${code}`));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          column={column}
          eyebrow={t("tabs.about")}
          title="Kancha"
          subtitle={t("about.tagline")}
          trailing={
            <View style={styles.logoBox}>
              <Image
                source={require("../../../../assets/images/icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          }
        />

        <View style={[styles.body, column]}>
          <ListGroup title={t("about.preferences")} testID="about-preferences">
            <Picker
              Icon={SunMoon}
              label={t("theme.label")}
              value={t(`theme.${themeMode}`)}
              options={THEMES.map((theme) => theme.mode)}
              selected={themeMode}
              onSelect={setThemeMode}
              optionLabel={(mode) => t(`theme.${mode}`)}
              renderOption={(mode, isSelected) => {
                const ThemeIcon = THEMES.find((theme) => theme.mode === mode)?.Icon ?? Monitor;
                return (
                  <>
                    <ThemeIcon color={isSelected ? colors.red : colors.muted} size={18} />
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {t(`theme.${mode}`)}
                    </Text>
                  </>
                );
              }}
              testID="about-theme"
              optionTestID={(mode) => `theme-option-${mode}`}
            />
            <Picker
              Icon={Globe}
              label={t("language.label")}
              value={namesOf(currentLang).name}
              options={LANGUAGES}
              selected={currentLang}
              onSelect={setLanguage}
              optionLabel={(code) => namesOf(code).label}
              renderOption={(code, isSelected) => {
                const names = namesOf(code);
                return (
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {names.name}
                    {names.localized
                      ? <Text style={styles.optionSecondary}>{" · "}{names.localized}</Text>
                      : null}
                  </Text>
                );
              }}
              testID="about-language"
              optionTestID={(code) => `language-option-${code}`}
            />
          </ListGroup>

          <ListGroup title={t("about.application")} testID="about-application">
            <View style={styles.row} testID="about-version">
              <Text style={styles.rowLabel}>{t("about.version")}</Text>
              <Text style={styles.rowValue}>{APP_VERSION}</Text>
            </View>

            <Pressable
              style={(state: InteractionState) => [styles.row, ...rowStyle(state)]}
              onPress={() => void Linking.openURL(WEBSITE_URL)}
              testID="about-website"
              accessibilityRole="button"
              accessibilityLabel={`${t("about.website")}, pilotariak.com`}
            >
              <Text style={styles.rowLabel}>{t("about.website")}</Text>
              <View style={styles.rowRight}>
                <Text style={styles.linkText}>pilotariak.com</Text>
                <ExternalLink color={colors.red} size={14} />
              </View>
            </Pressable>

            <View style={styles.row} testID="about-copyright">
              <Text style={styles.rowLabel}>{t("about.copyright")}</Text>
              <Text style={styles.rowValue}>© {COPYRIGHT_YEAR} Pilotariak</Text>
            </View>
          </ListGroup>

          <View style={styles.leaguesSection}>
            <Text style={styles.sectionEyebrow}>{t("about.leagues_eyebrow")}</Text>
            <Text style={styles.sectionTitle}>{t("about.leagues_title")}</Text>
            <Text style={styles.sectionDescription}>
              {t("about.leagues_description", { count: supportedLeagues.length })}
            </Text>

            <View style={styles.leagueList}>
              {supportedLeagues.map((league) => (
                <View
                  key={league.id}
                  style={styles.leagueCard}
                  testID={`about-league-${league.id}`}
                >
                  <LeagueIcon league={league} />
                  <Text style={styles.leagueName}>{league.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.redFill },
    scroll: { backgroundColor: c.cream },
    content: { paddingBottom: 120 },
    body: { paddingHorizontal: 20, paddingTop: 24, gap: 32 },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: c.white,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 8,
    },
    logo: { width: 52, height: 52 },
    row: {
      paddingHorizontal: ROW_INSET,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    rowPressed: {
      backgroundColor: c.cream,
    },
    focusRingInside: {
      outlineOffset: -2,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
    },
    // placeholder, not muted: muted on white is 4.3:1 in the light theme.
    rowLabel: {
      color: c.placeholder,
      fontSize: 14,
      fontWeight: "600",
    },
    rowValue: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "700",
      flexShrink: 1,
      textAlign: "right",
    },
    linkText: {
      color: c.red,
      fontSize: 15,
      fontWeight: "700",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: OPTION_INSET,
      paddingRight: ROW_INSET,
      paddingVertical: 14,
      gap: 12,
    },
    optionSelected: {
      backgroundColor: c.redSoft,
    },
    optionText: {
      flex: 1,
      color: c.ink,
      fontSize: 15,
      fontWeight: "600",
    },
    optionTextSelected: {
      color: c.red,
      fontWeight: "800",
    },
    optionSecondary: {
      color: c.placeholder,
      fontWeight: "600",
    },
    selectedDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.red,
    },
    leaguesSection: {
      gap: 12,
    },
    sectionEyebrow: {
      color: c.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.4,
    },
    sectionTitle: {
      color: c.ink,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.8,
      marginTop: -4,
    },
    sectionDescription: {
      color: c.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    leagueList: {
      gap: 10,
    },
    leagueCard: {
      borderRadius: 20,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    leagueName: {
      color: c.ink,
      fontSize: 14,
      fontWeight: "700",
      flex: 1,
    },
  });
