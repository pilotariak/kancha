import Constants from "expo-constants";
import { Image } from "expo-image";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Monitor,
  Moon,
  Sun,
  SunMoon,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import type { Palette } from "@/constants/colors";
import { LEAGUES } from "@/constants/leagues";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";
import { type SupportedLanguage, useLanguageStore } from "@/store/language-store";
import { type ThemeMode, useThemeStore } from "@/store/theme-store";

const WEBSITE_URL = "https://pilotariak.com";
const APP_VERSION = Constants.expoConfig?.version ?? "—";
const COPYRIGHT_YEAR = new Date().getFullYear();

const LEAGUE_LOGOS: Record<string, string> = {
  lcapb: "https://www.ccapb.net/wp-content/uploads/2016/09/logo1.png",
};

const LANGUAGES: { code: SupportedLanguage; flag: string }[] = [
  { code: "en", flag: "🇬🇧" },
  { code: "fr", flag: "🇫🇷" },
  { code: "es", flag: "🇪🇸" },
  { code: "eu", flag: "🏔️" },
];

type ThemeIcon = React.ComponentType<{ size?: number; color?: string }>;

const THEMES: { mode: ThemeMode; Icon: ThemeIcon }[] = [
  { mode: "system", Icon: Monitor },
  { mode: "light", Icon: Sun },
  { mode: "dark", Icon: Moon },
];

const supportedLeagues = LEAGUES.filter((l) => l.supported);

export default function AboutScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { language, setLanguage } = useLanguageStore();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const currentLang = (language ?? i18n.language ?? "en") as SupportedLanguage;
  const currentEntry = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Image
                source={require("../../../../assets/images/icon.png")}
                style={{ width: 64, height: 64 }}
                contentFit="contain"
              />
            </View>
            <Text style={styles.appName} accessibilityRole="header">Kancha</Text>
            <Text style={styles.tagline}>{t("about.tagline")}</Text>
          </View>

          <View style={styles.cards}>
            <View style={styles.card} testID="about-version">
              <Text style={styles.cardLabel}>{t("about.version")}</Text>
              <Text style={styles.cardValue}>{APP_VERSION}</Text>
            </View>

            <View style={styles.card} testID="about-copyright">
              <Text style={styles.cardLabel}>{t("about.copyright")}</Text>
              <Text style={styles.cardValue}>© {COPYRIGHT_YEAR} Pilotariak</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => void Linking.openURL(WEBSITE_URL)}
              testID="about-website"
              accessibilityRole="button"
              accessibilityLabel={t("about.website")}
            >
              <Text style={styles.cardLabel}>{t("about.website")}</Text>
              <View style={styles.linkRow}>
                <Text style={styles.linkText}>pilotariak.com</Text>
                <ExternalLink color={colors.red} size={14} />
              </View>
            </Pressable>

            {/* Language picker */}
            <View testID="about-language">
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => setPickerOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={t("language.label")}
              >
                <View style={styles.languageLeft}>
                  <Globe color={colors.muted} size={16} />
                  <Text style={styles.cardLabel}>{t("language.label")}</Text>
                </View>
                <View style={styles.linkRow}>
                  <Text style={styles.cardValue}>
                    {currentEntry?.flag} {t(`language.${currentLang}`)}
                  </Text>
                  {pickerOpen
                    ? <ChevronUp color={colors.muted} size={16} />
                    : <ChevronDown color={colors.muted} size={16} />}
                </View>
              </Pressable>

              {pickerOpen && (
                <View style={styles.languageList}>
                  {LANGUAGES.map((lang) => {
                    const isSelected = lang.code === currentLang;
                    return (
                      <Pressable
                        key={lang.code}
                        style={({ pressed }) => [
                          styles.languageOption,
                          isSelected && styles.languageOptionSelected,
                          pressed && styles.cardPressed,
                        ]}
                        onPress={() => {
                          setLanguage(lang.code);
                          setPickerOpen(false);
                        }}
                        testID={`language-option-${lang.code}`}
                        accessibilityRole="button"
                        accessibilityLabel={t(`language.${lang.code}`)}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Text style={styles.languageFlag}>{lang.flag}</Text>
                        <Text
                          style={[
                            styles.languageOptionText,
                            isSelected && styles.languageOptionTextSelected,
                          ]}
                        >
                          {t(`language.${lang.code}`)}
                        </Text>
                        {isSelected && <View style={styles.languageSelectedDot} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Theme picker */}
            <View testID="about-theme">
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => setThemeOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={t("theme.label")}
              >
                <View style={styles.languageLeft}>
                  <SunMoon color={colors.muted} size={16} />
                  <Text style={styles.cardLabel}>{t("theme.label")}</Text>
                </View>
                <View style={styles.linkRow}>
                  <Text style={styles.cardValue}>{t(`theme.${themeMode}`)}</Text>
                  {themeOpen
                    ? <ChevronUp color={colors.muted} size={16} />
                    : <ChevronDown color={colors.muted} size={16} />}
                </View>
              </Pressable>

              {themeOpen && (
                <View style={styles.languageList}>
                  {THEMES.map(({ mode, Icon }) => {
                    const isSelected = mode === themeMode;
                    return (
                      <Pressable
                        key={mode}
                        style={({ pressed }) => [
                          styles.languageOption,
                          isSelected && styles.languageOptionSelected,
                          pressed && styles.cardPressed,
                        ]}
                        onPress={() => {
                          setThemeMode(mode);
                          setThemeOpen(false);
                        }}
                        testID={`theme-option-${mode}`}
                        accessibilityRole="button"
                        accessibilityLabel={t(`theme.${mode}`)}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Icon color={isSelected ? colors.red : colors.muted} size={18} />
                        <Text
                          style={[
                            styles.languageOptionText,
                            isSelected && styles.languageOptionTextSelected,
                          ]}
                        >
                          {t(`theme.${mode}`)}
                        </Text>
                        {isSelected && <View style={styles.languageSelectedDot} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          <View style={styles.leaguesSection}>
            <Text style={styles.sectionEyebrow}>{t("about.leagues_eyebrow")}</Text>
            <Text style={styles.sectionTitle}>{t("about.leagues_title")}</Text>
            <Text style={styles.sectionDescription}>{t("about.leagues_description")}</Text>

            <View style={styles.leagueList}>
              {supportedLeagues.map((league) => {
                const logo = LEAGUE_LOGOS[league.id];
                return (
                  <View
                    key={league.id}
                    style={styles.leagueCard}
                    testID={`about-league-${league.id}`}
                  >
                    {logo && (
                      <Image
                        source={{ uri: logo }}
                        style={styles.leagueLogo}
                        contentFit="contain"
                        transition={200}
                      />
                    )}
                    <Text style={styles.leagueName}>{league.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KanchaBackground>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 120,
      gap: 32,
    },
    hero: {
      alignItems: "center",
      gap: 10,
    },
    logoBox: {
      width: 80,
      height: 80,
      borderRadius: 26,
      backgroundColor: c.white,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 8,
    },
    appName: {
      color: c.ink,
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    tagline: {
      color: c.muted,
      fontSize: 14,
    },
    cards: {
      gap: 10,
    },
    card: {
      borderRadius: 20,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardPressed: {
      backgroundColor: c.cream,
    },
    cardLabel: {
      color: c.muted,
      fontSize: 14,
      fontWeight: "600",
    },
    cardValue: {
      color: c.ink,
      fontSize: 15,
      fontWeight: "700",
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    linkText: {
      color: c.red,
      fontSize: 15,
      fontWeight: "700",
    },
    languageLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    languageList: {
      marginTop: 4,
      borderRadius: 20,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.line,
      overflow: "hidden",
    },
    languageOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    languageOptionSelected: {
      backgroundColor: c.redSoft,
    },
    languageFlag: {
      fontSize: 20,
    },
    languageOptionText: {
      flex: 1,
      color: c.ink,
      fontSize: 15,
      fontWeight: "600",
    },
    languageOptionTextSelected: {
      color: c.red,
      fontWeight: "800",
    },
    languageSelectedDot: {
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
    leagueLogo: {
      width: 48,
      height: 48,
      borderRadius: 8,
    },
    leagueName: {
      color: c.ink,
      fontSize: 14,
      fontWeight: "700",
      flex: 1,
    },
  });
