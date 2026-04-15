import { router, Stack } from "expo-router";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronRight,
  MapPin,
  Plus,
  UserCheck,
  X,
} from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KanchaBackground } from "@/components/KanchaBackground";
import { PressableScale } from "@/components/PressableScale";
import { StatusPill } from "@/components/StatusPill";
import { KanchaColors } from "@/constants/colors";

type PlayerStatus = "ok" | "ko" | "disponible";

interface SlotPlayer {
  id: string;
  name: string;
  status: PlayerStatus;
  selected: boolean;
}

const STEP_TITLES = ["Période", "Fréquence", "Joueurs", "Statuts", "Sélection", "Résumé"] as const;

const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;

const STATUS_OPTIONS: { value: PlayerStatus; label: string; tone: "green" | "red" | "amber" }[] = [
  { value: "ok", label: "OK", tone: "green" },
  { value: "ko", label: "KO", tone: "red" },
  { value: "disponible", label: "Dispo", tone: "amber" },
];

export default function NewSlotScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  // Step 0 — Période
  const [seasonName, setSeasonName] = useState("Saison 2025–2026");
  const [startDate, setStartDate] = useState("Septembre 2025");
  const [endDate, setEndDate] = useState("Août 2026");

  // Step 1 — Fréquence
  const [weekday, setWeekday] = useState("Jeudi");
  const [timeFrom, setTimeFrom] = useState("18:00");
  const [timeTo, setTimeTo] = useState("20:00");
  const [venue, setVenue] = useState("Fronton municipal, Biarritz");

  // Step 2 — Joueurs
  const [players, setPlayers] = useState<SlotPlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const playerInputRef = useRef<TextInput>(null);

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers((prev) => [
      ...prev,
      { id: String(Date.now()), name, status: "ok", selected: false },
    ]);
    setNewPlayerName("");
    playerInputRef.current?.focus();
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const setStatus = (id: string, status: PlayerStatus) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const toggleSelected = (id: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  };

  const goNext = () => setCurrentStep((s) => (s < STEP_TITLES.length - 1 ? s + 1 : s));

  const goBack = () => setCurrentStep((s) => (s > 0 ? s - 1 : s));

  const isLastStep = currentStep === STEP_TITLES.length - 1;

  const nextLabel = useMemo(() => {
    if (isLastStep) return "Créer le slot";
    if (currentStep === 2 && players.length === 0) return "Passer";
    return "Continuer";
  }, [currentStep, isLastStep, players.length]);

  const handleConfirm = () => {
    router.replace("/(tabs)/slot");
  };

  return (
    <KanchaBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID="new-slot-screen"
        >
          {/* ── Hero ── */}
          <View style={styles.heroRow}>
            {currentStep > 0 && (
              <PressableScale onPress={goBack}>
                <View style={styles.backBtn}>
                  <ArrowLeft color={KanchaColors.white} size={20} />
                </View>
              </PressableScale>
            )}
            <View style={styles.heroText}>
              <Text style={styles.title}>Nouveau slot</Text>
              <Text style={styles.subtitle}>
                Configurez votre créneau récurrent pas à pas.
              </Text>
            </View>
          </View>

          {/* ── Step indicator ── */}
          <View style={styles.stepsRow}>
            {STEP_TITLES.map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    index === currentStep ? styles.stepCircleActive : null,
                    index < currentStep ? styles.stepCircleDone : null,
                  ]}
                >
                  {index < currentStep ? <Check color={KanchaColors.red} size={14} /> : (
                    <Text
                      style={[
                        styles.stepText,
                        index === currentStep ? styles.stepTextActive : null,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    index === currentStep ? styles.stepLabelActive : null,
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Form card ── */}
          <View style={styles.formCard}>
            {/* STEP 0 — Période */}
            {currentStep === 0 && (
              <>
                <Text style={styles.stepHeading}>Quelle est la période ?</Text>

                <Text style={styles.label}>Nom de la saison</Text>
                <TextInput
                  value={seasonName}
                  onChangeText={setSeasonName}
                  style={styles.input}
                  testID="input-season-name"
                />

                <Text style={styles.label}>Date de début</Text>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  style={styles.input}
                  placeholder="ex : Septembre 2025"
                  placeholderTextColor={KanchaColors.muted}
                  testID="input-start-date"
                />

                <Text style={styles.label}>Date de fin</Text>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  style={styles.input}
                  placeholder="ex : Août 2026"
                  placeholderTextColor={KanchaColors.muted}
                  testID="input-end-date"
                />

                <View style={styles.previewBox}>
                  <CalendarClock color={KanchaColors.red} size={16} />
                  <Text style={styles.previewText}>
                    {seasonName || "—"} · {startDate || "?"} → {endDate || "?"}
                  </Text>
                </View>
              </>
            )}

            {/* STEP 1 — Fréquence */}
            {currentStep === 1 && (
              <>
                <Text style={styles.stepHeading}>À quelle fréquence ?</Text>

                <Text style={styles.label}>Jour de la semaine</Text>
                <View style={styles.chipsWrap}>
                  {WEEKDAYS.map((day) => (
                    <PressableScale key={day} onPress={() => setWeekday(day)}>
                      <View
                        style={[
                          styles.chip,
                          day === weekday ? styles.chipActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            day === weekday ? styles.chipTextActive : null,
                          ]}
                        >
                          {day.slice(0, 3)}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>

                <Text style={styles.label}>Horaire</Text>
                <View style={styles.timeRow}>
                  <TextInput
                    value={timeFrom}
                    onChangeText={setTimeFrom}
                    style={[styles.input, styles.inputHalf]}
                    placeholder="18:00"
                    placeholderTextColor={KanchaColors.muted}
                    testID="input-time-from"
                  />
                  <Text style={styles.timeSep}>→</Text>
                  <TextInput
                    value={timeTo}
                    onChangeText={setTimeTo}
                    style={[styles.input, styles.inputHalf]}
                    placeholder="20:00"
                    placeholderTextColor={KanchaColors.muted}
                    testID="input-time-to"
                  />
                </View>

                <Text style={styles.label}>Lieu</Text>
                <View style={styles.inputWithIcon}>
                  <MapPin color={KanchaColors.muted} size={16} />
                  <TextInput
                    value={venue}
                    onChangeText={setVenue}
                    style={styles.inputFlexible}
                    placeholder="Fronton municipal…"
                    placeholderTextColor={KanchaColors.muted}
                    testID="input-venue"
                  />
                </View>

                <View style={styles.previewBox}>
                  <CalendarClock color={KanchaColors.red} size={16} />
                  <Text style={styles.previewText}>
                    {`${weekday}s · ${timeFrom || "?"} – ${timeTo || "?"}`}
                  </Text>
                </View>
              </>
            )}

            {/* STEP 2 — Joueurs */}
            {currentStep === 2 && (
              <>
                <Text style={styles.stepHeading}>
                  {`Ajoutez vos joueurs (${players.length})`}
                </Text>

                <View style={styles.inputWithIcon}>
                  <TextInput
                    ref={playerInputRef}
                    value={newPlayerName}
                    onChangeText={setNewPlayerName}
                    style={styles.inputFlexible}
                    placeholder="Nom du joueur…"
                    placeholderTextColor={KanchaColors.muted}
                    onSubmitEditing={addPlayer}
                    returnKeyType="done"
                    testID="input-player-name"
                  />
                  <PressableScale onPress={addPlayer}>
                    <View style={styles.addBtn}>
                      <Plus color={KanchaColors.white} size={16} />
                    </View>
                  </PressableScale>
                </View>

                {players.length === 0 && (
                  <Text style={styles.emptyHint}>
                    Entrez un nom et appuyez sur + pour ajouter un joueur.
                  </Text>
                )}

                {players.map((p) => (
                  <View key={p.id} style={styles.playerRow}>
                    <View style={styles.playerInitial}>
                      <Text style={styles.playerInitialText}>{p.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <PressableScale onPress={() => removePlayer(p.id)}>
                      <View style={styles.removeBtn}>
                        <X color={KanchaColors.muted} size={14} />
                      </View>
                    </PressableScale>
                  </View>
                ))}
              </>
            )}

            {/* STEP 3 — Statuts */}
            {currentStep === 3 && (
              <>
                <Text style={styles.stepHeading}>Statut de chaque joueur</Text>
                <Text style={styles.stepHint}>
                  OK = peut jouer · KO = absent · Dispo = disponible si besoin
                </Text>

                {players.length === 0 && <Text style={styles.emptyHint}>Aucun joueur ajouté.</Text>}

                {players.map((p) => (
                  <View key={p.id} style={styles.statusRow}>
                    <View style={styles.playerInitial}>
                      <Text style={styles.playerInitialText}>{p.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <View style={styles.statusChips}>
                      {STATUS_OPTIONS.map((opt) => (
                        <PressableScale
                          key={opt.value}
                          onPress={() => setStatus(p.id, opt.value)}
                        >
                          <View
                            style={[
                              styles.statusChip,
                              p.status === opt.value
                                ? styles.statusChipActive
                                : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusChipText,
                                p.status === opt.value
                                  ? styles.statusChipTextActive
                                  : null,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* STEP 4 — Sélection */}
            {currentStep === 4 && (
              <>
                <Text style={styles.stepHeading}>
                  {`Sélection du jour (${players.filter((p) => p.selected).length})`}
                </Text>
                <Text style={styles.stepHint}>
                  Appuyez pour sélectionner ou désélectionner un joueur.
                </Text>

                {players.length === 0 && <Text style={styles.emptyHint}>Aucun joueur ajouté.</Text>}

                {players.map((p) => (
                  <PressableScale key={p.id} onPress={() => toggleSelected(p.id)}>
                    <View
                      style={[
                        styles.selectionRow,
                        p.selected ? styles.selectionRowActive : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.playerInitial,
                          p.selected ? styles.playerInitialSelected : null,
                        ]}
                      >
                        {p.selected
                          ? <UserCheck color={KanchaColors.white} size={16} />
                          : <Text style={styles.playerInitialText}>{p.name.charAt(0)}</Text>}
                      </View>
                      <Text
                        style={[
                          styles.playerName,
                          p.selected ? styles.playerNameSelected : null,
                        ]}
                        numberOfLines={1}
                      >
                        {p.name}
                      </Text>
                      <StatusPill
                        label={STATUS_OPTIONS.find((o) => o.value === p.status)?.label ?? p.status}
                        tone={STATUS_OPTIONS.find((o) => o.value === p.status)?.tone ?? "soft"}
                      />
                    </View>
                  </PressableScale>
                ))}
              </>
            )}

            {/* STEP 5 — Résumé */}
            {currentStep === 5 && (
              <>
                <Text style={styles.stepHeading}>Récapitulatif</Text>

                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>Saison</Text>
                  <Text style={styles.summaryValue}>{seasonName || "—"}</Text>
                  <Text style={styles.summaryMeta}>
                    {`${startDate || "?"} → ${endDate || "?"}`}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>Créneau</Text>
                  <Text style={styles.summaryValue}>
                    {`${weekday}s · ${timeFrom}–${timeTo}`}
                  </Text>
                  <View style={styles.summaryRow}>
                    <MapPin color={KanchaColors.muted} size={13} />
                    <Text style={styles.summaryMeta}>{venue || "—"}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>
                    {`Joueurs (${players.length})`}
                  </Text>
                  <View style={styles.summaryPlayers}>
                    {players.map((p) => (
                      <View key={p.id} style={styles.summaryPlayer}>
                        <Text style={styles.summaryPlayerName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <StatusPill
                          label={STATUS_OPTIONS.find((o) => o.value === p.status)?.label
                            ?? p.status}
                          tone={STATUS_OPTIONS.find((o) => o.value === p.status)?.tone ?? "soft"}
                        />
                        {p.selected && <UserCheck color={KanchaColors.green} size={14} />}
                      </View>
                    ))}
                    {players.length === 0 && <Text style={styles.emptyHint}>Aucun joueur.</Text>}
                  </View>
                </View>
              </>
            )}

            {/* ── CTA ── */}
            <PressableScale
              onPress={isLastStep ? handleConfirm : goNext}
              testID="new-slot-continue"
            >
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{nextLabel}</Text>
                {isLastStep
                  ? <Check color={KanchaColors.ink} size={18} />
                  : <ChevronRight color={KanchaColors.ink} size={18} />}
              </View>
            </PressableScale>
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

  heroRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  heroText: { flex: 1, gap: 6 },
  title: { color: KanchaColors.white, fontSize: 32, fontWeight: "900" },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 20,
  },

  stepsRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  stepItem: { flex: 1, alignItems: "center", gap: 6 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: { backgroundColor: KanchaColors.white },
  stepCircleDone: { backgroundColor: "#F6C0C9" },
  stepText: { color: KanchaColors.white, fontSize: 13, fontWeight: "800" },
  stepTextActive: { color: KanchaColors.red },
  stepLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  stepLabelActive: { color: KanchaColors.white },

  formCard: {
    borderRadius: 24,
    backgroundColor: KanchaColors.card,
    padding: 18,
    borderWidth: 1,
    borderColor: KanchaColors.line,
    gap: 14,
  },
  stepHeading: {
    color: KanchaColors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  stepHint: {
    color: KanchaColors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -6,
  },

  label: {
    color: "#8E857C",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    backgroundColor: KanchaColors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: KanchaColors.ink,
    fontWeight: "600",
  },
  inputHalf: { flex: 1 },
  inputWithIcon: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    backgroundColor: KanchaColors.white,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputFlexible: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: KanchaColors.ink,
    fontWeight: "600",
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeSep: { color: KanchaColors.muted, fontSize: 16, fontWeight: "700" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    backgroundColor: KanchaColors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipActive: { backgroundColor: KanchaColors.redSoft, borderColor: "#F1B9C4" },
  chipText: { color: KanchaColors.ink, fontSize: 14, fontWeight: "700" },
  chipTextActive: { color: KanchaColors.redDark },

  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: KanchaColors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHint: {
    color: KanchaColors.muted,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: KanchaColors.cream,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  playerInitial: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: KanchaColors.redSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  playerInitialText: { color: KanchaColors.red, fontSize: 14, fontWeight: "900" },
  playerInitialSelected: { backgroundColor: KanchaColors.green },
  playerName: { flex: 1, color: KanchaColors.ink, fontSize: 15, fontWeight: "700" },
  playerNameSelected: { color: KanchaColors.green },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFE8DE",
    alignItems: "center",
    justifyContent: "center",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: KanchaColors.cream,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusChips: { flexDirection: "row", gap: 6 },
  statusChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    backgroundColor: KanchaColors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipActive: { backgroundColor: KanchaColors.ink, borderColor: KanchaColors.ink },
  statusChipText: { color: KanchaColors.muted, fontSize: 12, fontWeight: "700" },
  statusChipTextActive: { color: KanchaColors.white },

  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: KanchaColors.cream,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectionRowActive: {
    backgroundColor: KanchaColors.greenSoft,
    borderColor: "#B8E0D0",
  },

  previewBox: {
    borderRadius: 14,
    backgroundColor: "#F5EEE6",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  previewText: { color: KanchaColors.ink, fontSize: 14, fontWeight: "700", flex: 1 },

  divider: { height: 1, backgroundColor: KanchaColors.line },

  summarySection: { gap: 6 },
  summaryLabel: {
    color: "#8E857C",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  summaryValue: { color: KanchaColors.ink, fontSize: 17, fontWeight: "900" },
  summaryMeta: { color: KanchaColors.muted, fontSize: 13 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryPlayers: { gap: 8 },
  summaryPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: KanchaColors.cream,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryPlayerName: {
    flex: 1,
    color: KanchaColors.ink,
    fontSize: 14,
    fontWeight: "700",
  },

  ctaButton: {
    borderRadius: 16,
    backgroundColor: KanchaColors.white,
    borderWidth: 1,
    borderColor: "#D8CFC6",
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  ctaText: { color: KanchaColors.ink, fontSize: 16, fontWeight: "800" },
});
