import { AppIcon } from "@/components/AppIcon";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGarden } from "@/context/GardenContext";
import { useLanguage } from "@/context/LanguageContext";
import { getCompanionsForPlants, getZoneSuggestions } from "@/data/plants";
import { getPlantName } from "@/translations/plant-names";
import CompanionCard from "@/components/CompanionCard";
import ZoneBadge from "@/components/ZoneBadge";

export default function CompanionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gardens } = useGarden();
  const { lang, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const garden = gardens.find(g => g.id === id);

  const companions = useMemo(() => {
    if (!garden) return [];
    return getCompanionsForPlants(
      garden.plantIds,
      garden.includeHerbs,
      garden.includeVegetables,
      garden.zone
    );
  }, [garden]);

  const zoneSuggestions = useMemo(() => {
    if (!garden || garden.zone === null) return [];
    return getZoneSuggestions(garden.zone, garden.plantIds);
  }, [garden]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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

  const emptyText = garden.plantIds.length === 0
    ? t("no_companions_no_plants")
    : garden.zone !== null
    ? t("no_companions_zone")
    : t("no_companions_no_zone");

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{t("companion_flowers")}</Text>
          <Text style={styles.subtitle}>{garden.name}</Text>
        </View>
        <ZoneBadge zone={garden.zone} />
      </View>

      {companions.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{companions.length}</Text>
            <Text style={styles.statLabel}>{t("companions_found")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{companions.filter(c => c.benefitType === "pest-control").length}</Text>
            <Text style={styles.statLabel}>{t("pest_control")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{companions.filter(c => c.benefitType === "pollination").length}</Text>
            <Text style={styles.statLabel}>{t("pollination")}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={companions}
        keyExtractor={item => item.plant.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppIcon name="flower-outline" size={48} color={Colors.light.border} />
            <Text style={styles.emptyTitle}>{t("no_companions")}</Text>
            <Text style={styles.emptyText}>{emptyText}</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.emptyBtnText}>{t("back_to_garden")}</Text>
            </TouchableOpacity>
            {zoneSuggestions.length > 0 && (
              <View style={styles.suggestSection}>
                <View style={styles.suggestHeader}>
                  <AppIcon name="sunny" size={16} color={Colors.light.primary} />
                  <Text style={styles.suggestTitle}>{t("zone_suggestions_title")}</Text>
                </View>
                {zoneSuggestions.map(plant => (
                  <View key={plant.id} style={styles.suggestCard}>
                    <View style={styles.suggestIconWrap}>
                      <AppIcon name={plant.icon} size={20} color={Colors.light.primary} />
                    </View>
                    <View style={styles.suggestInfo}>
                      <Text style={styles.suggestName}>{getPlantName(plant, lang)}</Text>
                      <Text style={styles.suggestDesc} numberOfLines={2}>{plant.description}</Text>
                    </View>
                    <View style={styles.suggestZoneBadge}>
                      <Text style={styles.suggestZoneText}>
                        {plant.zones[0]}–{plant.zones[plant.zones.length - 1]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CompanionCard
            plant={item.plant}
            benefit={item.benefit}
            benefitType={item.benefitType}
          />
        )}
      />
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
  headerCenter: { flex: 1 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  statsRow: {
    flexDirection: "row", backgroundColor: Colors.light.card, marginHorizontal: 16,
    borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.light.border,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.primary },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center" },
  statDivider: { width: 1, backgroundColor: Colors.light.border },
  list: { paddingHorizontal: 16 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 20 },
  emptyBtn: { marginTop: 8, backgroundColor: Colors.light.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  suggestSection: { width: "100%", marginTop: 28, gap: 10 },
  suggestHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  suggestTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  suggestCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.light.card, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.light.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  suggestIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.light.softGreen,
    alignItems: "center", justifyContent: "center",
  },
  suggestInfo: { flex: 1 },
  suggestName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 2 },
  suggestDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 16 },
  suggestZoneBadge: {
    backgroundColor: Colors.light.softGreen, paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8,
  },
  suggestZoneText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.light.primary },
});
