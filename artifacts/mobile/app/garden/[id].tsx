import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGarden } from "@/context/GardenContext";
import { useLanguage } from "@/context/LanguageContext";
import { PLANTS } from "@/data/plants";
import PlantChip from "@/components/PlantChip";
import ZoneBadge from "@/components/ZoneBadge";

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gardens, updateGarden, removePlantFromGarden, resetGarden, customPlants } = useGarden();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const garden = gardens.find(g => g.id === id);
  if (!garden) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>{t("garden_not_found")}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t("go_back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allPlants = [...customPlants, ...PLANTS];
  const plants = garden.plantIds.map(pid => allPlants.find(p => p.id === pid)).filter(Boolean);

  const handleReset = () => {
    setResetModalVisible(true);
  };

  const confirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    resetGarden(garden.id);
    setResetModalVisible(false);
  };

  const saveName = () => {
    if (nameInput.trim()) {
      updateGarden(garden.id, { name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {editingName ? (
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              onSubmitEditing={saveName}
              onBlur={saveName}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => { setNameInput(garden.name); setEditingName(true); }}>
              <View style={styles.nameRow}>
                <Text style={styles.gardenName}>{garden.name}</Text>
                <Ionicons name="pencil" size={14} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
          disabled={plants.length === 0}
        >
          <Ionicons name="refresh" size={18} color={plants.length === 0 ? Colors.light.border : Colors.light.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.zoneRow}>
          <ZoneBadge
            zone={garden.zone}
            onPress={() => router.push("/(tabs)/settings")}
          />
          {garden.zone !== null && (
            <TouchableOpacity
              style={styles.overrideBtn}
              onPress={() => router.push("/(tabs)/settings")}
            >
              <Text style={styles.overrideText}>{t("change_zone")}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="leaf-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.toggleLabel}>{t("include_herbs")}</Text>
            </View>
            <Switch
              value={garden.includeHerbs}
              onValueChange={v => updateGarden(garden.id, { includeHerbs: v })}
              trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
              thumbColor={garden.includeHerbs ? Colors.light.primary : "#f0f0f0"}
            />
          </View>
          <View style={styles.toggleDivider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="nutrition-outline" size={16} color={Colors.light.accent} />
              <Text style={styles.toggleLabel}>{t("include_vegetables")}</Text>
            </View>
            <Switch
              value={garden.includeVegetables}
              onValueChange={v => updateGarden(garden.id, { includeVegetables: v })}
              trackColor={{ false: Colors.light.border, true: Colors.light.accentLight }}
              thumbColor={garden.includeVegetables ? Colors.light.accent : "#f0f0f0"}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("my_plants")}</Text>
          <TouchableOpacity
            style={styles.addPlantBtn}
            onPress={() => router.push({ pathname: "/garden/add-plant", params: { id: garden.id } })}
          >
            <Ionicons name="add" size={16} color={Colors.light.primary} />
            <Text style={styles.addPlantText}>{t("add_plant")}</Text>
          </TouchableOpacity>
        </View>

        {plants.length === 0 ? (
          <Pressable
            style={styles.emptyPlants}
            onPress={() => router.push({ pathname: "/garden/add-plant", params: { id: garden.id } })}
          >
            <Ionicons name="add-circle-outline" size={32} color={Colors.light.border} />
            <Text style={styles.emptyText}>{t("add_first_plant")}</Text>
            <Text style={styles.emptySubtext}>{t("add_first_plant_sub")}</Text>
          </Pressable>
        ) : (
          <View style={styles.chipGrid}>
            {plants.map(p => p && (
              <PlantChip
                key={p.id}
                plant={p}
                onRemove={() => removePlantFromGarden(garden.id, p.id)}
              />
            ))}
          </View>
        )}

        {plants.length > 0 && (
          <TouchableOpacity
            style={styles.viewCompanionsBtn}
            onPress={() =>
              router.push({ pathname: "/garden/companions", params: { id: garden.id } })
            }
          >
            <Ionicons name="flower" size={20} color="#fff" />
            <Text style={styles.viewCompanionsText}>{t("view_companions")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Reset confirmation modal */}
      <Modal visible={resetModalVisible} transparent animationType="fade" onRequestClose={() => setResetModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconRow}>
              <Ionicons name="refresh-circle" size={32} color={Colors.light.danger} />
            </View>
            <Text style={styles.modalTitle}>{t("reset_garden")}</Text>
            <Text style={styles.modalMessage}>
              {t("reset_garden_confirm", { name: garden.name })}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={confirmReset}>
                <Text style={styles.modalDeleteText}>{t("reset")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.soft },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFound: { fontSize: 16, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },
  back: { fontSize: 14, color: Colors.light.primary, fontFamily: "Inter_500Medium" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4, gap: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  gardenName: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  nameInput: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text,
    borderBottomWidth: 2, borderBottomColor: Colors.light.primary,
    paddingVertical: 2, minWidth: 120, textAlign: "center",
  },
  resetBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, gap: 16 },
  zoneRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  overrideBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.card,
  },
  overrideText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  toggleCard: {
    backgroundColor: Colors.light.card, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.light.border, overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  toggleInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.light.text },
  toggleDivider: { height: 1, backgroundColor: Colors.light.border, marginHorizontal: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  addPlantBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.light.softGreen, borderWidth: 1, borderColor: Colors.light.border,
  },
  addPlantText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.light.primary },
  emptyPlants: {
    alignItems: "center", gap: 8, backgroundColor: Colors.light.card, borderRadius: 16,
    padding: 32, borderWidth: 1, borderColor: Colors.light.border, borderStyle: "dashed",
  },
  emptyText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.textSecondary },
  emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  viewCompanionsBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.light.primary, borderRadius: 16, paddingVertical: 16,
    shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  viewCompanionsText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center", padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.light.card, borderRadius: 20, padding: 24,
    width: "100%", maxWidth: 340,
  },
  modalIconRow: { alignItems: "center", marginBottom: 8 },
  modalTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.light.text, marginBottom: 10, textAlign: "center" },
  modalMessage: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 20, marginBottom: 20, textAlign: "center" },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancelBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.border, alignItems: "center", justifyContent: "center" },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  modalDeleteBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: Colors.light.danger, alignItems: "center", justifyContent: "center" },
  modalDeleteText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
