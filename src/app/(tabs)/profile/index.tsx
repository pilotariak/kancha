import { Award, BellRing, ChevronRight, ShieldCheck, Star } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { SectionHeader } from "@/components/SectionHeader";
import { KanchaColors } from "@/constants/colors";
import { profileShortcuts } from "@/mocks/kancha-data";

export default function ProfileScreen() {
  return (
    <KanchaBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="profile-screen"
        >
          <View style={styles.heroCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>PM</Text>
            </View>
            <Text style={styles.name}>Pilotariak Team</Text>
            <Text style={styles.role}>Club operations · Bayonne</Text>
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Award color={KanchaColors.white} size={14} />
                <Text style={styles.badgeText}>6 active tournaments</Text>
              </View>
              <View style={styles.badge}>
                <ShieldCheck color={KanchaColors.white} size={14} />
                <Text style={styles.badgeText}>Verified club</Text>
              </View>
            </View>
          </View>

          <SectionHeader
            eyebrow="Workspace"
            title="Club settings"
            subtitle="Identity, notifications, and team operations at a glance."
          />
          <View style={styles.list}>
            {profileShortcuts.map((item, index) => (
              <PressableScale
                key={item.id}
                style={styles.itemWrap}
                testID={`profile-item-${item.id}`}
              >
                <View style={styles.item}>
                  <View
                    style={[
                      styles.iconBubble,
                      index % 2 === 0 ? styles.iconRed : styles.iconDark,
                    ]}
                  >
                    {index === 0
                      ? <Star color={KanchaColors.white} size={16} />
                      : index === 1
                      ? <Award color={KanchaColors.white} size={16} />
                      : index === 2
                      ? <BellRing color={KanchaColors.white} size={16} />
                      : <ShieldCheck color={KanchaColors.white} size={16} />}
                  </View>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDetail}>{item.detail}</Text>
                  </View>
                  <ChevronRight color={KanchaColors.muted} size={18} />
                </View>
              </PressableScale>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KanchaBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 22,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: KanchaColors.red,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: KanchaColors.white, fontSize: 28, fontWeight: "900" },
  name: { color: KanchaColors.white, fontSize: 28, fontWeight: "900" },
  role: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  badgesRow: { width: "100%", gap: 10, marginTop: 8 },
  badge: {
    borderRadius: 16,
    backgroundColor: "rgba(18,18,18,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  badgeText: { color: KanchaColors.white, fontSize: 13, fontWeight: "700" },
  list: { gap: 12 },
  itemWrap: { borderRadius: 20 },
  item: {
    borderRadius: 20,
    backgroundColor: KanchaColors.white,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRed: { backgroundColor: KanchaColors.red },
  iconDark: { backgroundColor: "#1E1E1E" },
  itemCopy: { flex: 1, gap: 4 },
  itemTitle: { color: KanchaColors.ink, fontSize: 16, fontWeight: "800" },
  itemDetail: { color: KanchaColors.muted, fontSize: 13, lineHeight: 18 },
});
