import { AppIcon } from "@/components/AppIcon";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGarden } from "@/context/GardenContext";
import { useLanguage } from "@/context/LanguageContext";
import { PLANTS, Plant } from "@/data/plants";
import { getPlantName } from "@/translations/plant-names";

const TYPE_COLOR: Record<Plant["type"], string> = {
  flower: "#C4634A",
  herb: Colors.light.primary,
  vegetable: "#7A6A55",
};
const TYPE_BG: Record<Plant["type"], string> = {
  flower: Colors.light.softPink,
  herb: Colors.light.softGreen,
  vegetable: Colors.light.soft,
};

export default function AddPlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gardens, addPlantToGarden, removePlantFromGarden, customPlants, addCustomPlant, removeCustomPlant } = useGarden();
  const { t, lang } = useLanguage();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Plant["type"]>("all");

  const [modalVisible, setModalVisible] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<Plant["type"]>("flower");
  const nameInputRef = useRef<TextInput>(null);

  const [deleteTarget, setDeleteTarget] = useState<Plant | null>(null);

  const garden = gardens.find(g => g.id === id);
  const existingIds = new Set(garden?.plantIds ?? []);

  const allPlants = useMemo(() => [...customPlants, ...PLANTS], [customPlants]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allPlants
      .filter(p => {
        if (filter !== "all" && p.type !== filter) return false;
        if (q && !p.name.toLowerCase().includes(q) && !getPlantName(p, lang).toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => getPlantName(a, lang).localeCompare(getPlantName(b, lang)));
  }, [search, filter, allPlants, lang]);

  const handleToggle = (plant: Plant) => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (existingIds.has(plant.id)) {
      removePlantFromGarden(id, plant.id);
    } else {
      addPlantToGarden(id, plant.id);
    }
  };

  const openModal = () => {
    setCustomName(search);
    setCustomType("flower");
    setModalVisible(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleCreateCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const plant = addCustomPlant(trimmed, customType);
    addPlantToGarden(id, plant.id);
    setModalVisible(false);
    setCustomName("");
    setSearch("");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 20;

  const filterLabels: Record<string, string> = {
    all: t("filter_all"),
    flower: t("filter_flowers"),
    herb: t("filter_herbs"),
    vegetable: t("filter_vegetables"),
  };

  const typeLabel: Record<Plant["type"], string> = {
    flower: t("type_flower"),
    herb: t("type_herb"),
    vegetable: t("type_vegetable"),
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("add_plants")}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <AppIcon name="search" size={18} color={Colors.light.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_plants")}
          placeholderTextColor={Colors.light.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <AppIcon name="close-circle" size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Add custom plant button */}
      <TouchableOpacity style={styles.addCustomRow} onPress={openModal}>
        <View style={styles.addCustomIcon}>
          <AppIcon name="add" size={16} color={Colors.light.primary} />
        </View>
        <Text style={styles.addCustomLabel}>{t("add_custom_banner")}</Text>
        <AppIcon name="chevron-forward" size={14} color={Colors.light.textSecondary} />
      </TouchableOpacity>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(["all", "flower", "herb", "vegetable"] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {filterLabels[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plant List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppIcon name="search-outline" size={36} color={Colors.light.border} />
            <Text style={styles.emptyText}>{t("no_plants_found")}</Text>
            <TouchableOpacity style={styles.emptyCreateBtn} onPress={openModal}>
              <AppIcon name="add-circle-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.emptyCreateText}>
                {t("create_named", { name: search || t("add_custom_plant") })}
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const added = existingIds.has(item.id);
          const isCustom = item.id.startsWith("custom_");
          return (
            <View style={[styles.row, added && styles.rowAdded]}>
              <View style={[styles.typeIcon, { backgroundColor: TYPE_BG[item.type] }]}>
                <AppIcon
                  name={item.icon as string}
                  size={20}
                  color={TYPE_COLOR[item.type]}
                />
              </View>
              <View style={styles.rowInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.plantName}>{getPlantName(item, lang)}</Text>
                  {isCustom && (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>{t("custom_badge")}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.plantType, { color: TYPE_COLOR[item.type] }]}>
                  {typeLabel[item.type]}
                </Text>
              </View>
              {isCustom && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setDeleteTarget(item)}
                >
                  <AppIcon name="trash-outline" size={17} color={Colors.light.danger} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.addBtn, added && styles.addBtnAdded]}
                onPress={() => handleToggle(item)}
              >
                <AppIcon
                  name={added ? "remove" : "add"}
                  size={18}
                  color={added ? Colors.light.danger : "#fff"}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Delete Custom Plant Confirmation Modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable style={styles.centeredOverlay} onPress={() => setDeleteTarget(null)}>
          <Pressable style={styles.deleteModalCard} onPress={e => e.stopPropagation()}>
            <View style={styles.deleteModalIcon}>
              <AppIcon name="trash" size={28} color={Colors.light.danger} />
            </View>
            <Text style={styles.deleteModalTitle}>{t("delete_custom_plant")}</Text>
            <Text style={styles.deleteModalBody}>
              {t("delete_custom_body", { name: deleteTarget?.name ?? "" })}
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteModalCancel}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.deleteModalCancelText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirm}
                onPress={() => {
                  if (deleteTarget) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    removeCustomPlant(deleteTarget.id);
                  }
                  setDeleteTarget(null);
                }}
              >
                <AppIcon name="trash-outline" size={16} color="#fff" />
                <Text style={styles.deleteModalConfirmText}>{t("delete")}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom Plant Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.kvWrapper}
          >
            <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("add_custom_plant")}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                  <AppIcon name="close" size={20} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>{t("plant_name")}</Text>
              <View style={styles.modalInputRow}>
                <TextInput
                  ref={nameInputRef}
                  style={styles.modalInput}
                  placeholder={t("plant_name_placeholder")}
                  placeholderTextColor={Colors.light.textSecondary}
                  value={customName}
                  onChangeText={setCustomName}
                  returnKeyType="done"
                  onSubmitEditing={handleCreateCustom}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>

              <Text style={[styles.modalLabel, { marginTop: 16 }]}>{t("type_label")}</Text>
              <View style={styles.typePills}>
                {(["flower", "herb", "vegetable"] as const).map(tp => (
                  <TouchableOpacity
                    key={tp}
                    style={[
                      styles.typePill,
                      { borderColor: TYPE_COLOR[tp], backgroundColor: customType === tp ? TYPE_COLOR[tp] : TYPE_BG[tp] },
                    ]}
                    onPress={() => setCustomType(tp)}
                  >
                    <AppIcon
                      name={tp === "flower" ? "flower" : tp === "herb" ? "leaf" : "nutrition"}
                      size={14}
                      color={customType === tp ? "#fff" : TYPE_COLOR[tp]}
                    />
                    <Text style={[styles.typePillText, { color: customType === tp ? "#fff" : TYPE_COLOR[tp] }]}>
                      {typeLabel[tp]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalHint}>{t("custom_plant_hint")}</Text>

              <TouchableOpacity
                style={[styles.modalSaveBtn, !customName.trim() && styles.modalSaveBtnDisabled]}
                onPress={handleCreateCustom}
                disabled={!customName.trim()}
              >
                <AppIcon name="add-circle" size={18} color="#fff" />
                <Text style={styles.modalSaveText}>{t("add_to_garden")}</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.soft },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  searchRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.card,
    borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, height: 46,
    borderWidth: 1, borderColor: Colors.light.border, gap: 8, marginBottom: 12,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.text },
  addCustomRow: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12,
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.light.softGreen,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.light.border, gap: 8,
  },
  addCustomIcon: {
    width: 22, height: 22, borderRadius: 6, backgroundColor: Colors.light.card,
    borderWidth: 1, borderColor: Colors.light.border, alignItems: "center", justifyContent: "center",
  },
  addCustomLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.light.primary },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.light.card, borderWidth: 1, borderColor: Colors.light.border,
  },
  filterBtnActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  filterTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16 },
  row: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.card,
    borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.light.border, gap: 12,
  },
  rowAdded: { borderColor: Colors.light.primary, backgroundColor: Colors.light.softGreen },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  plantName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  customBadge: { backgroundColor: Colors.light.accentLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  customBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.light.accent },
  plantType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.light.primary,
    alignItems: "center", justifyContent: "center",
  },
  addBtnAdded: { backgroundColor: Colors.light.dangerLight, borderWidth: 1, borderColor: Colors.light.danger },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.light.dangerLight,
    borderWidth: 1, borderColor: Colors.light.danger, alignItems: "center", justifyContent: "center",
  },
  deleteModalCard: {
    backgroundColor: Colors.light.card, borderRadius: 20,
    marginHorizontal: 24, padding: 24, alignItems: "center", gap: 8,
  },
  deleteModalIcon: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.light.dangerLight,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  deleteModalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text, textAlign: "center" },
  deleteModalBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 8 },
  deleteModalActions: { flexDirection: "row", gap: 12, marginTop: 4, width: "100%" },
  deleteModalCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: Colors.light.soft,
    borderWidth: 1, borderColor: Colors.light.border, alignItems: "center",
  },
  deleteModalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  deleteModalConfirm: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 13, borderRadius: 12, backgroundColor: Colors.light.danger,
  },
  deleteModalConfirmText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  empty: { alignItems: "center", paddingTop: 48, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  emptyCreateBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4,
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.light.softGreen,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.light.border,
  },
  emptyCreateText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.primary },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  centeredOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center" },
  kvWrapper: { flex: 1, justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: Colors.light.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 4,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  modalTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  modalClose: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.light.soft, alignItems: "center", justifyContent: "center" },
  modalLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  modalInputRow: {
    backgroundColor: Colors.light.soft, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.light.border, paddingHorizontal: 14, height: 50, justifyContent: "center",
  },
  modalInput: { fontSize: 16, fontFamily: "Inter_400Regular", color: Colors.light.text },
  typePills: { flexDirection: "row", gap: 10, marginBottom: 4 },
  typePill: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
  },
  typePillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 17, marginTop: 12, marginBottom: 4 },
  modalSaveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.light.primary, borderRadius: 14, paddingVertical: 15, marginTop: 16,
  },
  modalSaveBtnDisabled: { backgroundColor: Colors.light.border },
  modalSaveText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
