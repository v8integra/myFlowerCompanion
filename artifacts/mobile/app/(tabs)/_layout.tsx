import { AppIcon } from "@/components/AppIcon";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";

export default function TabLayout() {
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? "#000" : "#fff",
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: isDark ? "#333" : "#ccc",
          elevation: 0,
          height: isWeb ? 84 : undefined,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: isDark ? "#000" : "#fff" },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab_gardens"),
          tabBarIcon: ({ color }) => (
            <AppIcon name="leaf" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tab_zone"),
          tabBarIcon: ({ color }) => (
            <AppIcon name="location" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: t("tab_care"),
          tabBarIcon: ({ color }) => (
            <AppIcon name="heart-circle-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t("tab_about"),
          tabBarIcon: ({ color }) => (
            <AppIcon name="information-circle-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
