import { AppIcon } from "@/components/AppIcon";
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
import { useLanguage } from "@/context/LanguageContext";
import { PLANTS, Plant } from "@/data/plants";
import { CARE_GUIDES, CareGuide } from "@/data/care";
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

const SUN_ICON: Record<string, string> = {
  "Full Sun": "sunny",
  "Part Shade to Full Sun": "partly-sunny",
  "Full Sun to Part Shade": "partly-sunny",
  "Part Shade to Full Shade": "cloudy",
  "Full Shade": "cloud",
};

const DIFF_COLOR = { Easy: Colors.light.success, Moderate: Colors.light.warning, Expert: Colors.light.danger };
const DIFF_BG = { Easy: Colors.light.successLight, Moderate: Colors.light.warningLight, Expert: Colors.light.dangerLight };

function formatZones(zones: number[], allZonesLabel: string, zoneRange: (min: number, max: number) => string, zoneSingle: (n: number) => string): string {
  if (!zones || zones.length === 0) return allZonesLabel;
  const sorted = [...zones].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (min === max) return zoneSingle(min);
  return zoneRange(min, max);
}

function buildZoneLabels(zones: number[]): number[] {
  if (!zones || zones.length === 0) return [];
  return [...zones].sort((a, b) => a - b);
}

function InfoCell({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <AppIcon name={icon} size={16} color={Colors.light.primary} />
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={styles.infoCellValue}>{value}</Text>
    </View>
  );
}

function CareModal({ plant, guide, onClose }: { plant: Plant; guide: CareGuide; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const sunIcon = SUN_ICON[guide.sun] ?? "partly-sunny";

  const typeLabel: Record<Plant["type"], string> = {
    flower: t("type_flower"),
    herb: t("type_herb"),
    vegetable: t("type_vegetable"),
  };

  const diffLabel: Record<string, string> = {
    Easy: t("difficulty_easy"),
    Moderate: t("difficulty_moderate"),
    Expert: t("difficulty_expert"),
  };

  const allZonesLabel = t("all_zones");
  const zoneRangeFn = (min: number, max: number) => t("zone_range_fmt", { min, max });
  const zoneSingleFn = (n: number) => t("zone_single_fmt", { n });

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIconBg, { backgroundColor: TYPE_BG[plant.type] }]}>
              <AppIcon name={plant.icon as string} size={24} color={TYPE_COLOR[plant.type]} />
            </View>
            <View style={styles.sheetTitleCol}>
              <Text style={styles.sheetTitle}>{getPlantName(plant, lang)}</Text>
              <Text style={[styles.sheetType, { color: TYPE_COLOR[plant.type] }]}>{typeLabel[plant.type]}</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: DIFF_BG[guide.difficulty as keyof typeof DIFF_BG] ?? DIFF_BG.Easy }]}>
              <Text style={[styles.diffText, { color: DIFF_COLOR[guide.difficulty as keyof typeof DIFF_COLOR] ?? DIFF_COLOR.Easy }]}>
                {diffLabel[guide.difficulty] ?? guide.difficulty}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
            <View style={styles.zoneBar}>
              <View style={styles.zoneBarLeft}>
                <AppIcon name="map-outline" size={16} color={Colors.light.primary} />
                <View>
                  <Text style={styles.zoneBarLabel}>{t("growing_zones")}</Text>
                  <Text style={styles.zoneBarRange}>
                    {formatZones(plant.zones, allZonesLabel, zoneRangeFn, zoneSingleFn)}
                  </Text>
                </View>
              </View>
              <View style={styles.zoneDots}>
                {buildZoneLabels(plant.zones).map(z => (
                  <View key={z} style={styles.zoneDot}>
                    <Text style={styles.zoneDotText}>{z}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.infoGrid}>
              <InfoCell icon="sunny-outline" label={t("sunlight")} value={guide.sun} />
              <InfoCell icon="water-outline" label={t("water")} value={guide.water} />
              <InfoCell icon="earth-outline" label={t("soil")} value={guide.soil} />
              <InfoCell icon="resize-outline" label={t("spacing")} value={guide.spacing} />
              <InfoCell icon="arrow-up-outline" label={t("height")} value={guide.height} />
              <InfoCell icon="calendar-outline" label={t("bloom_time")} value={guide.bloomTime} />
            </View>
            <Text style={styles.tipsTitle}>{t("care_tips")}</Text>
            {guide.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipBullet}>
                  <Text style={styles.tipBulletText}>{i + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
            <View style={styles.descCard}>
              <AppIcon name="information-circle-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.descText}>{plant.description}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function CareScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Plant["type"]>("all");
  const [selected, setSelected] = useState<{ plant: Plant; guide: CareGuide } | null>(null);

  const sortedPlants = useMemo(
    () => [...PLANTS].sort((a, b) => getPlantName(a, lang).localeCompare(getPlantName(b, lang))),
    [lang]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sortedPlants.filter(p => {
      if (filter !== "all" && p.type !== filter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !getPlantName(p, lang).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filter, sortedPlants, lang]);

  const topPad = Platform.OS === "web" ? 20 : insets.top + 16;

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
      <View style={styles.header}>
        <Text style={styles.title}>{t("plant_care")}</Text>
        <Text style={styles.subtitle}>{t("plants_in_db", { n: PLANTS.length })}</Text>
      </View>

      <View style={styles.searchRow}>
        <AppIcon name="search" size={18} color={Colors.light.textSecondary} />
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

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const guide = CARE_GUIDES[item.id];
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => guide && setSelected({ plant: item, guide })}
            >
              <View style={[styles.iconBg, { backgroundColor: TYPE_BG[item.type] }]}>
                <AppIcon name={item.icon as string} size={22} color={TYPE_COLOR[item.type]} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.plantName}>{getPlantName(item, lang)}</Text>
                <Text style={[styles.plantType, { color: TYPE_COLOR[item.type] }]}>{typeLabel[item.type]}</Text>
              </View>
              {guide && (
                <View style={[styles.diffBadgeSmall, { backgroundColor: DIFF_BG[guide.difficulty as keyof typeof DIFF_BG] ?? DIFF_BG.Easy }]}>
                  <Text style={[styles.diffTextSmall, { color: DIFF_COLOR[guide.difficulty as keyof typeof DIFF_COLOR] ?? DIFF_COLOR.Easy }]}>
                    {guide.difficulty}
                  </Text>
                </View>
              )}
              <AppIcon name="chevron-forward" size={16} color={Colors.light.border} />
            </Pressable>
          );
        }}
      />

      {selected && (
        <CareModal
          plant={selected.plant}
          guide={selected.guide}
          onClose={() => setSelected(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.soft },
  header: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  searchRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.card,
    borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, height: 46,
    borderWidth: 1, borderColor: Colors.light.border, gap: 8, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.text },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 10 },
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
    borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1,
    borderColor: Colors.light.border, gap: 12,
  },
  rowPressed: { opacity: 0.85 },
  iconBg: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  plantName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  plantType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  diffBadgeSmall: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffTextSmall: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.light.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "90%", paddingTop: 12,
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: Colors.light.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  sheetIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sheetTitleCol: { flex: 1 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  sheetType: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  diffText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.light.soft, alignItems: "center", justifyContent: "center" },
  sheetScroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 16 },
  zoneBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.light.soft, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.light.border,
  },
  zoneBarLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  zoneBarLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  zoneBarRange: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  zoneDots: { flexDirection: "row", flexWrap: "wrap", gap: 4, maxWidth: 140, justifyContent: "flex-end" },
  zoneDot: {
    backgroundColor: Colors.light.primaryLight, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  zoneDotText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.light.primary },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoCell: {
    width: "47%", backgroundColor: Colors.light.soft, borderRadius: 12,
    padding: 12, gap: 4, borderWidth: 1, borderColor: Colors.light.border,
  },
  infoCellLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  infoCellValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  tipsTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  tipRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipBullet: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.light.primary,
    alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
  },
  tipBulletText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 20 },
  descCard: {
    flexDirection: "row", gap: 10, backgroundColor: Colors.light.soft,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.light.border,
  },
  descText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 19 },
});
