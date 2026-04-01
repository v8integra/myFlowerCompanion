import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { PLANTS } from "@/data/plants";
import { COMPANION_TIPS, COMPANION_TIPS_TITLE } from "@/translations/companion-tips";

const flowerCount = PLANTS.filter(p => p.type === "flower").length;
const herbCount = PLANTS.filter(p => p.type === "herb").length;
const vegCount = PLANTS.filter(p => p.type === "vegetable").length;

const TIP_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  "bug-outline",
  "sunny-outline",
  "water-outline",
  "color-filter-outline",
  "leaf-outline",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Step({ number, title, body }: { number: number; title: string; body: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{number}</Text>
      </View>
      <View style={styles.stepBody}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{body}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const topPad = Platform.OS === "web" ? 20 : insets.top + 16;

  const tips = COMPANION_TIPS[lang];
  const tipsTitle = COMPANION_TIPS_TITLE[lang];

  const benefitTypes = [
    { color: "#D94F4F", bg: "#FDEAEA", label: t("legend_pest_control"), desc: t("legend_pest_desc") },
    { color: "#7B68EE", bg: "#EEEAFF", label: t("legend_pollination"), desc: t("legend_pollination_desc") },
    { color: "#4A7C59", bg: "#EDF5F0", label: t("legend_soil"), desc: t("legend_soil_desc") },
    { color: "#E8845A", bg: "#FEF0EB", label: t("legend_growth"), desc: t("legend_growth_desc") },
    { color: "#6B7E6E", bg: "#F9F4EE", label: t("legend_general"), desc: t("legend_general_desc") },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="flower" size={40} color={Colors.light.primary} />
        </View>
        <Text style={styles.heroTitle}>MyFlowerCompanion</Text>
        <Text style={styles.heroSubtitle}>{t("about_hero")}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{flowerCount}</Text>
          <Text style={styles.statLabel}>{t("stat_flowers")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{herbCount}</Text>
          <Text style={styles.statLabel}>{t("stat_herbs")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{vegCount}</Text>
          <Text style={styles.statLabel}>{t("stat_vegetables")}</Text>
        </View>
      </View>

      {/* What is companion planting */}
      <Section title={t("about_companion_title")}>
        <View style={styles.card}>
          <Text style={styles.bodyText}>{t("about_companion_body1")}</Text>
          <Text style={[styles.bodyText, { marginTop: 10 }]}>{t("about_companion_body2")}</Text>
        </View>
      </Section>

      {/* How to use */}
      <Section title={t("about_howto_title")}>
        <Step number={1} title={t("step1_title")} body={t("step1_body")} />
        <Step number={2} title={t("step2_title")} body={t("step2_body")} />
        <Step number={3} title={t("step3_title")} body={t("step3_body")} />
        <Step number={4} title={t("step4_title")} body={t("step4_body")} />
        <Step number={5} title={t("step5_title")} body={t("step5_body")} />
        <Step number={6} title={t("step6_title")} body={t("step6_body")} />
      </Section>

      {/* Adding custom plants */}
      <Section title={t("about_custom_title")}>
        <View style={styles.card}>
          {[
            { icon: "add-circle-outline" as const, text: t("about_custom_tip1") },
            { icon: "search-outline" as const, text: t("about_custom_tip2") },
            { icon: "create-outline" as const, text: t("about_custom_tip3") },
            { icon: "bookmark-outline" as const, text: t("about_custom_tip4") },
            { icon: "information-circle-outline" as const, text: t("about_custom_tip5") },
          ].map((item, i) => (
            <View key={i} style={[styles.tipRow, i > 0 && styles.tipBorder]}>
              <View style={styles.tipIconBg}>
                <Ionicons name={item.icon} size={16} color={Colors.light.primary} />
              </View>
              <Text style={styles.tipText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Companion planting tips */}
      <Section title={tipsTitle}>
        <View style={styles.card}>
          {tips.map((tip, i) => (
            <View key={i} style={[styles.tipRow, i > 0 && styles.tipBorder]}>
              <View style={styles.tipIconBg}>
                <Ionicons name={TIP_ICONS[i] ?? "leaf-outline"} size={16} color={Colors.light.primary} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Benefit types legend */}
      <Section title={t("about_benefit_title")}>
        <View style={styles.card}>
          {benefitTypes.map((b, i) => (
            <View key={i} style={[styles.benefitRow, i > 0 && styles.tipBorder]}>
              <View style={[styles.benefitDot, { backgroundColor: b.bg, borderColor: b.color }]}>
                <View style={[styles.benefitInner, { backgroundColor: b.color }]} />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={[styles.benefitLabel, { color: b.color }]}>{b.label}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      {/* Version */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>MyFlowerCompanion · Version 1.0</Text>
        <Text style={styles.footerText}>All plant data stored locally on your device</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.soft },
  content: { paddingHorizontal: 20, gap: 24 },
  hero: { alignItems: "center", gap: 10, paddingVertical: 8 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.light.softGreen,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.light.border,
  },
  heroTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.light.text },
  heroSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: Colors.light.card, borderRadius: 16, padding: 14,
    alignItems: "center", borderWidth: 1, borderColor: Colors.light.border,
  },
  statNum: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.light.primary },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  card: { backgroundColor: Colors.light.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.light.border, overflow: "hidden" },
  bodyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 22, padding: 16 },
  step: { flexDirection: "row", gap: 14, marginBottom: 14, alignItems: "flex-start" },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.light.primary,
    alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0,
  },
  stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  stepBody: { flex: 1, backgroundColor: Colors.light.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.light.border },
  stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 4 },
  stepText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 19 },
  tipRow: { flexDirection: "row", gap: 12, padding: 14, alignItems: "flex-start" },
  tipBorder: { borderTopWidth: 1, borderTopColor: Colors.light.border },
  tipIconBg: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.light.softGreen, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 19 },
  benefitRow: { flexDirection: "row", gap: 14, padding: 14, alignItems: "center" },
  benefitDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  benefitInner: { width: 10, height: 10, borderRadius: 5 },
  benefitInfo: { flex: 1 },
  benefitLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  benefitDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 1 },
  footer: { alignItems: "center", gap: 4, paddingTop: 8 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
});
