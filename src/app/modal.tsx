import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BellRing, X } from "lucide-react-native";
import React from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";

export default function ModalScreen() {
  return (
    <Modal
      animationType="fade"
      transparent
      visible
      onRequestClose={() => router.back()}
    >
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
          testID="alerts-modal"
        >
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <BellRing color={KanchaColors.white} size={18} />
            </View>
            <PressableScale onPress={() => router.back()}>
              <View style={styles.closeButton}>
                <X color={KanchaColors.ink} size={16} />
              </View>
            </PressableScale>
          </View>
          <Text style={styles.title}>Club alerts</Text>
          <Text style={styles.description}>
            Court 2 needs a score confirmation before the evening update is published.
          </Text>
          <View style={styles.alertItem}>
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>Txapelketa 2026</Text>
              <Text style={styles.alertMeta}>
                Pool A · Match sheet missing referee signature
              </Text>
            </View>
            <StatusPill label="Action" tone="red" />
          </View>
          <View style={styles.alertItem}>
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>Pilotariak Open</Text>
              <Text style={styles.alertMeta}>
                10 teams seeded · scheduling preview generated
              </Text>
            </View>
            <StatusPill label="Ready" tone="green" />
          </View>
        </Pressable>
      </Pressable>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,10,10,0.54)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 28,
    backgroundColor: KanchaColors.card,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: KanchaColors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EFE7DE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: KanchaColors.ink, fontSize: 24, fontWeight: "900" },
  description: { color: KanchaColors.muted, fontSize: 14, lineHeight: 20 },
  alertItem: {
    borderRadius: 18,
    backgroundColor: KanchaColors.white,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    padding: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  alertCopy: { flex: 1, gap: 4 },
  alertTitle: { color: KanchaColors.ink, fontSize: 16, fontWeight: "800" },
  alertMeta: { color: "#71675E", fontSize: 13, lineHeight: 18 },
});
