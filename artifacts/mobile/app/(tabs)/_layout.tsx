import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";

function NativeTabLayout() {
  const { t } = useLanguage();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "leaf", selected: "leaf.fill" }} />
        <Label>{t("tab_gardens")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "location", selected: "location.fill" }} />
        <Label>{t("tab_zone")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="care">
        <Icon sf={{ default: "heart.text.square", selected: "heart.text.square.fill" }} />
        <Label>{t("tab_care")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="about">
        <Icon sf={{ default: "info.circle", selected: "info.circle.fill" }} />
        <Label>{t("tab_about")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
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
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="leaf.fill" tintColor={color} size={24} />
            ) : (
              <Ionicons name="leaf" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tab_zone"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="location.fill" tintColor={color} size={24} />
            ) : (
              <Ionicons name="location" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: t("tab_care"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="heart.text.square.fill" tintColor={color} size={24} />
            ) : (
              <Ionicons name="heart-circle-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t("tab_about"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="info.circle.fill" tintColor={color} size={24} />
            ) : (
              <Ionicons name="information-circle-outline" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
