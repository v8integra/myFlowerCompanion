import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGarden } from "@/context/GardenContext";
import { PLANTS, Plant } from "@/data/plants";

const TYPE_LABEL: Record<Plant["type"], string> = {
  flower: "Flower",
  herb: "Herb",
  vegetable: "Vegetable",
};

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
  const { gardens, addPlantToGarden } = useGarden();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Plant["type"]>("all");

  const garden = gardens.find(g => g.id === id);
  const existingIds = new Set(garden?.plantIds ?? []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PLANTS.filter(p => {
      if (filter !== "all" && p.type !== filter) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filter]);

  const handleAdd = (plant: Plant) => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addPlantToGarden(id, plant.id);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Plants</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.light.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants..."
          placeholderTextColor={Colors.light.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {(["all", "flower", "herb", "vegetable"] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : TYPE_LABEL[f] + "s"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No plants found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const added = existingIds.has(item.id);
          return (
            <View style={[styles.row, added && styles.rowAdded]}>
              <View style={[styles.typeIcon, { backgroundColor: TYPE_BG[item.type] }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={TYPE_COLOR[item.type]}
                />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.plantName}>{item.name}</Text>
                <Text style={[styles.plantType, { color: TYPE_COLOR[item.type] }]}>
                  {TYPE_LABEL[item.type]}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.addBtn, added && styles.addBtnAdded]}
                onPress={() => !added && handleAdd(item)}
                disabled={added}
              >
                <Ionicons
                  name={added ? "checkmark" : "add"}
                  size={18}
                  color={added ? Colors.light.primary : "#fff"}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
    marginBottom: 12,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  filterTextActive: {
    color: "#fff",
  },
  list: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  rowAdded: {
    opacity: 0.7,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  plantType: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnAdded: {
    backgroundColor: Colors.light.softGreen,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  empty: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
