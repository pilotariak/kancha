import React, { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  PixelRatio,
  Platform,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { Check, Trophy } from "@/components/icons";
import { KanchaLogo } from "@/components/KanchaLogo";
import { KanchaColorsLight as c } from "@/constants/colors";
import {
  CARD_SIZE,
  displayLink,
  type ShareCardData,
  type ShareCardTeam,
} from "@/features/share/share-card";
import { shareCardImage } from "@/features/share/share-image";
import { logger } from "@/utils/logger";

/** Text at the card's own size: a larger system text size would push it out of the image. */
function CardText(props: TextProps) {
  return <Text {...props} allowFontScaling={false} />;
}

type CardStyles = ReturnType<typeof makeStyles>;

const LOGO_SIZE = 88;

function TeamRow({ team, even, styles, unit }: {
  team: ShareCardTeam;
  /** Neither team won: no mark, and both teams in the same weight. */
  even: boolean;
  styles: CardStyles;
  unit: number;
}) {
  const won = !even && team.winner;
  const lost = !even && !team.winner;
  return (
    <View style={styles.team}>
      <View style={styles.winnerSlot}>
        {won ? <Check color={c.green} size={56 * unit} strokeWidth={3} /> : null}
      </View>
      <View style={styles.teamInfo}>
        <CardText
          style={[styles.name, won && styles.nameWon, lost && styles.nameLost]}
          numberOfLines={2}
        >
          {team.name}
        </CardText>
        {team.club ? <CardText style={styles.club} numberOfLines={2}>{team.club}</CardText> : null}
      </View>
      <View style={styles.points}>
        {team.points.map((points, i) => (
          <CardText
            key={i}
            style={[styles.point, won && styles.pointWon, lost && styles.pointLost]}
          >
            {points}
          </CardText>
        ))}
      </View>
    </View>
  );
}

/**
 * The image of a result to share, 1080 × 1350 px once captured (DESIGN.md, Share card). It is
 * laid out `width` wide, scaled from its pixel size, and always takes the light palette: the
 * image is the same whatever the app's theme.
 */
export function ShareCard({ data, width }: { data: ShareCardData; width: number }) {
  const unit = width / CARD_SIZE.width;
  const styles = useMemo(() => makeStyles(unit), [unit]);
  const even = !data.teams.some((team) => team.winner);
  const final = data.round?.final ?? false;

  return (
    <View style={styles.card}>
      <View style={styles.band}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <View style={styles.logoScale}>
              <KanchaLogo size={LOGO_SIZE} variant="on-dark" />
            </View>
          </View>
          <CardText style={styles.wordmark}>Kancha</CardText>
        </View>
        <CardText style={styles.eyebrow} numberOfLines={1}>{data.eyebrow}</CardText>
        <CardText style={styles.title} numberOfLines={2}>{data.title}</CardText>
        {data.subtitle
          ? <CardText style={styles.subtitle} numberOfLines={1}>{data.subtitle}</CardText>
          : null}
      </View>

      <View style={styles.body}>
        <View style={styles.meta}>
          {data.round
            ? (
              <View style={[styles.round, final && styles.roundFinal]}>
                {final ? <Trophy color={c.amber} size={32 * unit} /> : null}
                <CardText style={styles.roundLabel}>{data.round.label}</CardText>
              </View>
            )
            : null}
          {data.date ? <CardText style={styles.date}>{data.date}</CardText> : null}
        </View>

        <View style={[styles.match, final && styles.matchFinal]}>
          <TeamRow team={data.teams[0]} even={even} styles={styles} unit={unit} />
          <View style={styles.divider} />
          <TeamRow team={data.teams[1]} even={even} styles={styles} unit={unit} />
        </View>

        <View style={styles.spacer} />
        <CardText style={styles.linkLabel}>{data.linkLabel}</CardText>
        <CardText style={styles.link} numberOfLines={2}>{displayLink(data.link)}</CardText>
      </View>
    </View>
  );
}

/**
 * Shares cards as images. `share(data)` mounts the card off screen, captures it once laid out,
 * opens the share sheet (or the browser's share or download), then unmounts it. Render `card`
 * anywhere in the screen: it takes no room. A `share` while another card is on its way does
 * nothing, so the Share buttons never need disabling: a disabled button would lose the keyboard
 * focus.
 */
export function useShareCard(): { share: (data: ShareCardData) => void; card: ReactNode } {
  const { t } = useTranslation();
  const [data, setData] = useState<ShareCardData | null>(null);
  const viewRef = useRef<View>(null);
  const started = useRef(false);

  const share = useCallback((next: ShareCardData) => {
    setData((current) => current ?? next);
  }, []);

  const capture = useCallback(() => {
    const view = viewRef.current;
    if (!view || !data || started.current) return;
    started.current = true;
    // One frame more, so the logo and text are painted before the capture reads them.
    requestAnimationFrame(() => {
      shareCardImage(view, data.fileName, t("share.dialog_title"))
        .catch((error: unknown) => {
          logger.warn("Sharing the card failed", error);
          // Alert does nothing on web, where the download fallback leaves little to fail.
          if (Platform.OS !== "web") Alert.alert(t("share.error"));
        })
        .finally(() => {
          started.current = false;
          setData(null);
        });
    });
  }, [data, t]);

  // Laid out at the size that the screen's pixel ratio turns into the card's pixels, so the
  // capture needs no scaling.
  const ratio = PixelRatio.get();
  const width = CARD_SIZE.width / ratio;
  const card = data
    ? (
      <View
        ref={viewRef}
        collapsable={false}
        onLayout={capture}
        // Off screen rather than transparent: a transparent view captures as a blank image.
        style={{
          position: "absolute",
          top: 0,
          left: -10000,
          width,
          height: CARD_SIZE.height / ratio,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <ShareCard data={data} width={width} />
      </View>
    )
    : null;

  return { share, card };
}

/**
 * Sizes are the image's pixels, times `unit`. Plain objects, not StyleSheet.create: on web,
 * react-native-web writes them as inline styles. html2canvas, which captures the card there,
 * copies the app's stylesheet with the server-rendered rules last, and those then override the
 * classes created in the browser; an inline style wins over both.
 */
function makeStyles(unit: number) {
  const px = (n: number) => n * unit;
  return ({
    card: { width: px(1080), height: px(1350), backgroundColor: c.cream, overflow: "hidden" },

    // The red band: the brand, then the competition, the specialty and the category.
    band: {
      backgroundColor: c.redFill,
      paddingHorizontal: px(80),
      paddingTop: px(56),
      paddingBottom: px(56),
      borderBottomLeftRadius: px(72),
      borderBottomRightRadius: px(72),
    },
    brand: { flexDirection: "row", alignItems: "center", gap: px(24), marginBottom: px(36) },
    // KanchaLogo's strokes follow its size: it is drawn at its image size, then scaled, so the
    // K is as bold at every pixel ratio.
    logo: { width: px(LOGO_SIZE), height: px(LOGO_SIZE) },
    logoScale: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      transform: [{ scale: unit }],
      transformOrigin: "top left",
    },
    wordmark: { color: "#FFFFFF", fontSize: px(44), fontWeight: "900" },
    eyebrow: {
      color: c.onRedStrong,
      fontSize: px(30),
      fontWeight: "800",
      letterSpacing: px(4),
      textTransform: "uppercase",
    },
    title: {
      color: "#FFFFFF",
      fontSize: px(56),
      lineHeight: px(62),
      fontWeight: "900",
      marginTop: px(14),
    },
    subtitle: {
      color: c.onRedStrong,
      fontSize: px(38),
      lineHeight: px(44),
      fontWeight: "700",
      marginTop: px(10),
    },

    // The match: the round and the date, the teams, and the link at the bottom.
    body: { flex: 1, paddingHorizontal: px(80), paddingTop: px(48), paddingBottom: px(64) },
    meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: px(24) },
    round: {
      flexDirection: "row",
      alignItems: "center",
      gap: px(12),
      paddingHorizontal: px(28),
      paddingVertical: px(14),
      borderRadius: px(60),
      borderWidth: px(3),
      borderColor: c.line,
      backgroundColor: c.white,
    },
    roundFinal: { backgroundColor: c.amberBg, borderColor: "rgba(200,144,10,0.4)" },
    roundLabel: {
      color: c.ink,
      fontSize: px(30),
      fontWeight: "800",
      letterSpacing: px(2),
      textTransform: "uppercase",
    },
    date: { color: c.ink, fontSize: px(34), fontWeight: "700" },
    match: {
      marginTop: px(32),
      paddingHorizontal: px(44),
      borderRadius: px(48),
      borderWidth: px(3),
      borderColor: c.line,
      backgroundColor: c.white,
    },
    matchFinal: { borderWidth: px(6), borderColor: c.red },
    team: { flexDirection: "row", alignItems: "center", gap: px(24), paddingVertical: px(28) },
    winnerSlot: { width: px(56), alignItems: "center" },
    teamInfo: { flex: 1 },
    name: { color: c.ink, fontSize: px(44), lineHeight: px(50), fontWeight: "700" },
    nameWon: { fontWeight: "800" },
    nameLost: { fontWeight: "600" },
    club: {
      color: c.muted,
      fontSize: px(30),
      lineHeight: px(36),
      fontWeight: "600",
      marginTop: px(6),
    },
    points: { flexDirection: "row", gap: px(28) },
    point: {
      color: c.ink,
      fontSize: px(92),
      lineHeight: px(100),
      fontWeight: "700",
      minWidth: px(110),
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    pointWon: { fontWeight: "900" },
    pointLost: { color: c.muted, fontWeight: "400" },
    divider: { height: px(3), backgroundColor: c.line },
    spacer: { flex: 1, minHeight: px(32) },
    linkLabel: { color: c.muted, fontSize: px(30), fontWeight: "600", marginBottom: px(8) },
    link: { color: c.ink, fontSize: px(34), lineHeight: px(44), fontWeight: "700" },
  }) satisfies Record<string, ViewStyle | TextStyle>;
}
