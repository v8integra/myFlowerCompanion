import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { Plant } from "@/data/plants";
import { getPlantName } from "@/translations/plant-names";

interface PlantChipProps {
  plant: Plant;
  onRemove?: () => void;
  compact?: boolean;
}

const TYPE_COLOR: Record<Plant["type"], string> = {
  flower: Colors.light.softPink,
  herb: Colors.light.softGreen,
  vegetable: Colors.light.soft,
};

const TYPE_TEXT_COLOR: Record<Plant["type"], string> = {
  flower: "#C4634A",
  herb: Colors.light.primary,
  vegetable: "#7A6A55",
};

export default function PlantChip({ plant, onRemove, compact = false }: PlantChipProps) {
  const { lang } = useLanguage();
  const bg = TYPE_COLOR[plant.type];
  const textColor = TYPE_TEXT_COLOR[plant.type];
  const displayName = getPlantName(plant, lang);

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove?.();
  };

  return (
    <View style={[styles.chip, { backgroundColor: bg }, compact && styles.compact]}>
      <Text style={[styles.name, { color: textColor }, compact && styles.nameCompact]} numberOfLines={1}>
        {displayName}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={handleRemove} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={compact ? 12 : 14} color={textColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    alignSelf: "flex-start",
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  name: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  nameCompact: {
    fontSize: 11,
  },
  removeBtn: {
    marginLeft: 2,
  },
});
