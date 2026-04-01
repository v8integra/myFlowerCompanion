import { Ionicons } from "@expo/vector-icons";
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
import { getCompanionsForPlants } from "@/data/plants";
import CompanionCard from "@/components/CompanionCard";
import ZoneBadge from "@/components/ZoneBadge";

export default function CompanionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gardens } = useGarden();
  const { t } = useLanguage();
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
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
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
            <Ionicons name="flower-outline" size={48} color={Colors.light.border} />
            <Text style={styles.emptyTitle}>{t("no_companions")}</Text>
            <Text style={styles.emptyText}>{emptyText}</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.emptyBtnText}>{t("back_to_garden")}</Text>
            </TouchableOpacity>
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
});
