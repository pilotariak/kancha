import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight, Trophy } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { KanchaColors } from "@/constants/colors";
import { useCompetition } from "@/hooks/use-competitions";
import { useSpecialties } from "@/hooks/use-specialties";

export default function SpecialtyPickerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: competition, isPending: loadingComp } = useCompetition(id ?? "");
  const { data: specialties, isPending: loadingSpecialties, isError } = useSpecialties();

  function handleSelect(specialtyId: string) {
    router.push(`/(tabs)/competitions/category?id=${id}&specialtyId=${specialtyId}`);
  }

  return (
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="specialty-picker-screen"
        >
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={KanchaColors.white} size={20} />
            <Text style={styles.backLabel}>Competitions</Text>
          </Pressable>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Trophy color={KanchaColors.white} size={20} />
            </View>
            {loadingComp
              ? <ActivityIndicator color={KanchaColors.white} />
              : (
                <>
                  <Text style={styles.heroTitle}>{competition?.name ?? "Competition"}</Text>
                  {(competition?.year != null || competition?.level) && (
                    <Text style={styles.heroMeta}>
                      {[competition?.year, competition?.level].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </>
              )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Choose</Text>
            <Text style={styles.sectionTitle}>Specialty</Text>
            <Text style={styles.sectionSubtitle}>
              Select a specialty to view the results for this competition.
            </Text>
          </View>

          {loadingSpecialties && (
            <View style={styles.centered}>
              <ActivityIndicator color={KanchaColors.white} size="large" />
            </View>
          )}

          {isError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Failed to load specialties.</Text>
            </View>
          )}

          {!loadingSpecialties && !isError && specialties && (
            <View style={styles.list}>
              {specialties.map((s) => (
                <Pressable
                  key={s.id}
                  style={styles.card}
                  onPress={() => handleSelect(s.id)}
                  testID={`specialty-card-${s.id}`}
                >
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <ChevronRight color={KanchaColors.muted} size={18} />
                </Pressable>
              ))}
            </View>
          )}
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  backLabel: {
    color: KanchaColors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: KanchaColors.red,
    padding: 22,
    gap: 10,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: KanchaColors.white, fontSize: 28, fontWeight: "900" },
  heroMeta: { color: "rgba(255,255,255,0.78)", fontSize: 14, fontWeight: "600" },
  section: { gap: 4 },
  sectionEyebrow: {
    color: KanchaColors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  sectionTitle: { color: KanchaColors.ink, fontSize: 28, fontWeight: "900" },
  sectionSubtitle: { color: KanchaColors.muted, fontSize: 14, lineHeight: 20, marginTop: 2 },
  centered: { paddingVertical: 40, alignItems: "center" },
  errorBox: {
    borderRadius: 16,
    backgroundColor: KanchaColors.redSoft,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(200,16,46,0.2)",
  },
  errorText: { color: KanchaColors.redDark, fontSize: 14, fontWeight: "600" },
  list: { gap: 12 },
  card: {
    borderRadius: 20,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { color: KanchaColors.ink, fontSize: 17, fontWeight: "800", flex: 1 },
});
