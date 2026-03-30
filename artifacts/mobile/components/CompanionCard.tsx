import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { Plant } from "@/data/plants";

type BenefitType = "pest-control" | "pollination" | "soil" | "growth" | "general";

interface CompanionCardProps {
  plant: Plant;
  benefit: string;
  benefitType: BenefitType;
}

const BENEFIT_CONFIG: Record<BenefitType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  "pest-control": { icon: "shield-checkmark", color: "#C4634A", bg: Colors.light.softPink, label: "Pest Control" },
  "pollination": { icon: "flower", color: Colors.light.primary, bg: Colors.light.softGreen, label: "Pollination" },
  "soil": { icon: "earth", color: "#7A6A55", bg: Colors.light.soft, label: "Soil Health" },
  "growth": { icon: "trending-up", color: "#4A7C8A", bg: "#EBF5F7", label: "Growth Boost" },
  "general": { icon: "leaf", color: Colors.light.primaryDark, bg: Colors.light.softGreen, label: "General" },
};

const TYPE_LABEL: Record<Plant["type"], string> = {
  flower: "Flower",
  herb: "Herb",
  vegetable: "Vegetable",
};

export default function CompanionCard({ plant, benefit, benefitType }: CompanionCardProps) {
  const config = BENEFIT_CONFIG[benefitType];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.plantType}>{TYPE_LABEL[plant.type]}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={styles.benefit}>{benefit}</Text>
      <Text style={styles.description}>{plant.description}</Text>
      <View style={styles.zoneRow}>
        <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
        <Text style={styles.zoneText}>Zones {plant.zones[0]}–{plant.zones[plant.zones.length - 1]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  plantType: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  benefit: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  zoneText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
