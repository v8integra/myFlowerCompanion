import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

interface ZoneBadgeProps {
  zone: number | null;
  onPress?: () => void;
}

export default function ZoneBadge({ zone, onPress }: ZoneBadgeProps) {
  return (
    <TouchableOpacity style={styles.badge} onPress={onPress} disabled={!onPress}>
      <Ionicons name="location" size={14} color={Colors.light.primary} />
      <Text style={styles.text}>{zone !== null ? `Zone ${zone}` : "Set Zone"}</Text>
      {onPress && <Ionicons name="chevron-forward" size={12} color={Colors.light.textSecondary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.primary,
  },
});
