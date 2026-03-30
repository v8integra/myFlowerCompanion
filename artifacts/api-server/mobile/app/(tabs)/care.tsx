import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { PLANTS, Plant } from "@/data/plants";
import { CARE_GUIDES, CareGuide } from "@/data/care";

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
const TYPE_LABEL: Record<Plant["type"], string> = {
  flower: "Flower",
  herb: "Herb",
  vegetable: "Vegetable",
};

const SUN_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Full Sun": "sunny",
  "Part Shade to Full Sun": "partly-sunny",
  "Full Sun to Part Shade": "partly-sunny",
  "Part Shade to Full Shade": "cloudy",
  "Full Shade": "cloud",
};

const DIFF_COLOR = { Easy: Colors.light.success, Moderate: Colors.light.warning, Expert: Colors.light.danger };
const DIFF_BG = { Easy: Colors.light.successLight, Moderate: Colors.light.warningLight, Expert: Colors.light.dangerLight };

function CareModal({ plant, guide, onClose }: { plant: Plant; guide: CareGuide; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const sunIcon = SUN_ICON[guide.sun] ?? "partly-sunny";
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIconBg, { backgroundColor: TYPE_BG[plant.type] }]}>
              <Ionicons name={plant.icon as keyof typeof Ionicons.glyphMap} size={24} color={TYPE_COLOR[plant.type]} />
            </View>
            <View style={styles.sheetTitleCol}>
              <Text style={styles.sheetTitle}>{plant.name}</Text>
              <Text style={[styles.sheetType, { color: TYPE_COLOR[plant.type] }]}>{TYPE_LABEL[plant.type]}</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: DIFF_BG[guide.difficulty] }]}>
              <Text style={[styles.diffText, { color: DIFF_COLOR[guide.difficulty] }]}>{guide.difficulty}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
            <View style={styles.infoGrid}>
              <InfoCell icon="sunny-outline" label="Sunlight" value={guide.sun} />
              <InfoCell icon="water-outline" label="Water" value={guide.water} />
              <InfoCell icon="earth-outline" label="Soil" value={guide.soil} />
              <InfoCell icon="resize-outline" label="Spacing" value={guide.spacing} />
              <InfoCell icon="arrow-up-outline" label="Height" value={guide.height} />
              <InfoCell icon="calendar-outline" label="Bloom Time" value={guide.bloomTime} />
            </View>
            <Text style={styles.tipsTitle}>Care Tips</Text>
            {guide.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipBullet}>
                  <Text style={styles.tipBulletText}>{i + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
            <View style={styles.descCard}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.descText}>{plant.description}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoCell({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <Ionicons name={icon} size={16} color={Colors.light.primary} />
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={styles.infoCellValue}>{value}</Text>
    </View>
  );
}

export default function CareScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Plant["type"]>("all");
  const [selected, setSelected] = useState<{ plant: Plant; guide: CareGuide } | null>(null);

  const sortedPlants = useMemo(() => [...PLANTS].sort((a, b) => a.name.localeCompare(b.name)), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sortedPlants.filter(p => {
      if (filter !== "all" && p.type !== filter) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filter, sortedPlants]);

  const topPad = Platform.OS === "web" ? 20 : insets.top + 16;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Care</Text>
        <Text style={styles.subtitle}>{PLANTS.length} plants in database</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.light.textSecondary} />
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
              {f === "all" ? "All" : f === "flower" ? "Flowers" : f === "herb" ? "Herbs" : "Vegetables"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 20 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No plants found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const guide = CARE_GUIDES[item.id];
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => guide && setSelected({ plant: item, guide })}
              activeOpacity={0.7}
            >
              <View style={[styles.typeIcon, { backgroundColor: TYPE_BG[item.type] }]}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={TYPE_COLOR[item.type]} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.plantName}>{item.name}</Text>
                <Text style={[styles.plantType, { color: TYPE_COLOR[item.type] }]}>{TYPE_LABEL[item.type]}</Text>
              </View>
              {guide ? (
                <View style={[styles.diffPill, { backgroundColor: DIFF_BG[guide.difficulty] }]}>
                  <Text style={[styles.diffPillText, { color: DIFF_COLOR[guide.difficulty] }]}>{guide.difficulty}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
            </TouchableOpacity>
          );
        }}
      />

      {selected && (
        <CareModal plant={selected.plant} guide={selected.guide} onClose={() => setSelected(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.soft },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.light.text },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  searchRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.card,
    borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, height: 46,
    borderWidth: 1, borderColor: Colors.light.border, gap: 8, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.text },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.light.card, borderWidth: 1, borderColor: Colors.light.border },
  filterBtnActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  filterTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16 },
  row: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.card,
    borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.light.border, gap: 12,
  },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  plantName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  plantType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  diffPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffPillText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.light.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", paddingHorizontal: 20 },
  sheetHandle: { width: 36, height: 4, backgroundColor: Colors.light.border, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  sheetIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sheetTitleCol: { flex: 1 },
  sheetTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.text },
  sheetType: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  diffText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  sheetScroll: { paddingBottom: 24 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  infoCell: {
    width: "47%", backgroundColor: Colors.light.soft, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.light.border, gap: 4,
  },
  infoCellLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 4 },
  infoCellValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  tipsTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 12 },
  tipRow: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  tipBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.light.softGreen, alignItems: "center", justifyContent: "center", marginTop: 1 },
  tipBulletText: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.light.primary },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 20 },
  descCard: {
    flexDirection: "row", gap: 8, backgroundColor: Colors.light.softGreen, borderRadius: 12,
    padding: 14, marginTop: 8, borderWidth: 1, borderColor: Colors.light.border, alignItems: "flex-start",
  },
  descText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 19 },
});
