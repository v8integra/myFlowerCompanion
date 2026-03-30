import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
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
import { PLANTS } from "@/data/plants";
import PlantChip from "@/components/PlantChip";
import ZoneBadge from "@/components/ZoneBadge";

export default function GardensScreen() {
  const { gardens, createGarden, deleteGarden } = useGarden();
  const insets = useSafeAreaInsets();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const garden = createGarden(newName.trim() || undefined);
    setCreating(false);
    setNewName("");
    router.push({ pathname: "/garden/[id]", params: { id: garden.id } });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteGarden(deleteTarget.id);
    setDeleteTarget(null);
  };

  const topPad = Platform.OS === "web" ? 20 : insets.top + 16;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>MyFlowerCompanion</Text>
          <Text style={styles.subtitle}>Your companion gardens</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setCreating(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {creating && (
        <View style={styles.createCard}>
          <TextInput
            style={styles.input}
            placeholder="Garden name (optional)"
            placeholderTextColor={Colors.light.textSecondary}
            value={newName}
            onChangeText={setNewName}
            autoFocus
            onSubmitEditing={handleCreate}
          />
          <View style={styles.createActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setCreating(false); setNewName(""); }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={gardens}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={48} color={Colors.light.border} />
            <Text style={styles.emptyTitle}>No gardens yet</Text>
            <Text style={styles.emptyText}>Create your first garden to start finding companion flowers</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setCreating(true)}>
              <Text style={styles.emptyBtnText}>Create Garden</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const plants = item.plantIds.map(id => PLANTS.find(p => p.id === id)).filter(Boolean);
          return (
            <View style={styles.cardWrapper}>
              {/* Main tappable card — navigate to garden detail */}
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push({ pathname: "/garden/[id]", params: { id: item.id } })}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardIconBg}>
                    <Ionicons name="flower" size={22} color={Colors.light.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardCount}>
                      {plants.length} {plants.length === 1 ? "plant" : "plants"}
                    </Text>
                  </View>
                  {/* Spacer reserves space for the absolutely-positioned right column */}
                  <View style={styles.cardRightSpacer} />
                </View>
                {plants.length > 0 && (
                  <View style={styles.chipRow}>
                    {plants.slice(0, 4).map(p => p && (
                      <PlantChip key={p.id} plant={p} compact />
                    ))}
                    {plants.length > 4 && (
                      <Text style={styles.more}>+{plants.length - 4} more</Text>
                    )}
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetail}>View garden</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.light.primary} />
                </View>
              </Pressable>

              {/* Right column: zone badge on top, delete button below.
                  Placed OUTSIDE the Pressable so taps don't trigger navigation. */}
              <View style={styles.cardRightCol}>
                <ZoneBadge zone={item.zone} />
                <TouchableOpacity
                  onPress={() => setDeleteTarget({ id: item.id, name: item.name })}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={styles.trashBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.light.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Delete confirmation modal — works in iframes unlike window.confirm() */}
      <Modal visible={deleteTarget !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Garden</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  appName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createCard: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    backgroundColor: Colors.light.soft,
  },
  createActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  createBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  createText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  cardWrapper: {
    marginBottom: 12,
    position: "relative",
  },
  cardRightCol: {
    position: "absolute",
    top: 16,
    right: 16,
    alignItems: "flex-end",
    gap: 10,
  },
  cardRightSpacer: {
    width: 68,
  },
  trashBtn: {
    padding: 2,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  modalDeleteBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDeleteText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  cardCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  more: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    alignSelf: "center",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 10,
    marginTop: 2,
  },
  viewDetail: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.primary,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
