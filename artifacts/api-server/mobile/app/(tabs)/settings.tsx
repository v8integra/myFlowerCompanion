import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGarden } from "@/context/GardenContext";

const STATE_ZONES: Record<string, number> = {
  AL: 8, AK: 4, AZ: 9, AR: 7, CA: 9, CO: 5, CT: 6, DE: 7, FL: 9, GA: 8,
  HI: 12, ID: 6, IL: 5, IN: 5, IA: 5, KS: 6, KY: 6, LA: 9, ME: 5, MD: 7,
  MA: 6, MI: 6, MN: 4, MS: 8, MO: 6, MT: 4, NE: 5, NV: 7, NH: 5, NJ: 7,
  NM: 7, NY: 6, NC: 7, ND: 3, OH: 6, OK: 7, OR: 8, PA: 6, RI: 6, SC: 8,
  SD: 4, TN: 7, TX: 8, UT: 6, VT: 5, VA: 7, WA: 8, WV: 6, WI: 5, WY: 5,
  DC: 7,
};

const STATE_NAME_TO_ABBR: Record<string, string> = {
  ALABAMA: "AL", ALASKA: "AK", ARIZONA: "AZ", ARKANSAS: "AR", CALIFORNIA: "CA",
  COLORADO: "CO", CONNECTICUT: "CT", DELAWARE: "DE", FLORIDA: "FL", GEORGIA: "GA",
  HAWAII: "HI", IDAHO: "ID", ILLINOIS: "IL", INDIANA: "IN", IOWA: "IA",
  KANSAS: "KS", KENTUCKY: "KY", LOUISIANA: "LA", MAINE: "ME", MARYLAND: "MD",
  MASSACHUSETTS: "MA", MICHIGAN: "MI", MINNESOTA: "MN", MISSISSIPPI: "MS",
  MISSOURI: "MO", MONTANA: "MT", NEBRASKA: "NE", NEVADA: "NV",
  "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ", "NEW MEXICO": "NM", "NEW YORK": "NY",
  "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND", OHIO: "OH", OKLAHOMA: "OK",
  OREGON: "OR", PENNSYLVANIA: "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
  "SOUTH DAKOTA": "SD", TENNESSEE: "TN", TEXAS: "TX", UTAH: "UT", VERMONT: "VT",
  VIRGINIA: "VA", WASHINGTON: "WA", "WEST VIRGINIA": "WV", WISCONSIN: "WI",
  WYOMING: "WY", "DISTRICT OF COLUMBIA": "DC",
};

function estimateZoneFromZip(zip: string): number | null {
  const prefix = parseInt(zip.substring(0, 3), 10);
  if (isNaN(prefix)) return null;

  // Alaska
  if (prefix >= 995 && prefix <= 999) return 4;
  // Hawaii
  if (prefix >= 967 && prefix <= 968) return 12;
  // Washington (western)
  if (prefix >= 980 && prefix <= 986) return 8;
  // Washington (eastern)
  if (prefix >= 987 && prefix <= 994) return 6;
  // Oregon (western/coastal)
  if (prefix >= 970 && prefix <= 974) return 9;
  // Oregon (eastern)
  if (prefix >= 975 && prefix <= 979) return 6;
  // Northern California
  if (prefix >= 940 && prefix <= 961) return 9;
  // Southern California
  if (prefix >= 900 && prefix <= 939) return 10;
  // Nevada (Las Vegas)
  if (prefix >= 889 && prefix <= 891) return 9;
  // Nevada (rest)
  if (prefix >= 892 && prefix <= 898) return 7;
  // Arizona
  if (prefix >= 850 && prefix <= 865) return 9;
  // New Mexico
  if (prefix >= 870 && prefix <= 884) return 7;
  // Utah
  if (prefix >= 840 && prefix <= 847) return 6;
  // Idaho
  if (prefix >= 832 && prefix <= 838) return 6;
  // Montana
  if (prefix >= 590 && prefix <= 599) return 4;
  // Wyoming
  if (prefix >= 820 && prefix <= 831) return 5;
  // Colorado
  if (prefix >= 800 && prefix <= 816) return 5;
  // Texas (south / Gulf Coast)
  if (prefix >= 785 && prefix <= 799) return 9;
  // Texas (central)
  if (prefix >= 760 && prefix <= 784) return 8;
  // Texas (north / panhandle)
  if (prefix >= 750 && prefix <= 759) return 7;
  // Oklahoma
  if (prefix >= 730 && prefix <= 749) return 7;
  // Arkansas
  if (prefix >= 716 && prefix <= 729) return 7;
  // Louisiana
  if (prefix >= 700 && prefix <= 715) return 9;
  // Mississippi
  if (prefix >= 386 && prefix <= 397) return 8;
  // Alabama
  if (prefix >= 350 && prefix <= 369) return 8;
  // Tennessee
  if (prefix >= 370 && prefix <= 385) return 7;
  // Georgia
  if (prefix >= 300 && prefix <= 319) return 8;
  // Florida (south)
  if (prefix >= 330 && prefix <= 349) return 10;
  // Florida (north)
  if (prefix >= 320 && prefix <= 329) return 9;
  // South Carolina
  if (prefix >= 290 && prefix <= 299) return 8;
  // North Carolina
  if (prefix >= 270 && prefix <= 289) return 7;
  // Virginia
  if (prefix >= 220 && prefix <= 246) return 7;
  // West Virginia
  if (prefix >= 247 && prefix <= 268) return 6;
  // DC / Maryland
  if (prefix >= 200 && prefix <= 219) return 7;
  // Delaware
  if (prefix >= 197 && prefix <= 199) return 7;
  // Pennsylvania
  if (prefix >= 150 && prefix <= 196) return 6;
  // New York (city area)
  if (prefix >= 100 && prefix <= 119) return 7;
  // New York (upstate)
  if (prefix >= 120 && prefix <= 149) return 5;
  // New Jersey
  if (prefix >= 70 && prefix <= 89) return 7;
  // Connecticut
  if (prefix >= 60 && prefix <= 69) return 6;
  // Rhode Island
  if (prefix >= 28 && prefix <= 29) return 6;
  // Massachusetts
  if (prefix >= 10 && prefix <= 27) return 6;
  // Vermont
  if (prefix >= 50 && prefix <= 59) return 5;
  // New Hampshire
  if (prefix >= 30 && prefix <= 38) return 5;
  // Maine
  if (prefix >= 39 && prefix <= 49) return 5;
  // Kansas
  if (prefix >= 660 && prefix <= 679) return 6;
  // Nebraska
  if (prefix >= 680 && prefix <= 693) return 5;
  // South Dakota
  if (prefix >= 570 && prefix <= 577) return 4;
  // North Dakota
  if (prefix >= 580 && prefix <= 588) return 3;
  // Minnesota
  if (prefix >= 550 && prefix <= 567) return 4;
  // Iowa
  if (prefix >= 500 && prefix <= 528) return 5;
  // Missouri
  if (prefix >= 630 && prefix <= 658) return 6;
  // Wisconsin
  if (prefix >= 530 && prefix <= 549) return 5;
  // Michigan
  if (prefix >= 480 && prefix <= 499) return 6;
  // Illinois
  if (prefix >= 600 && prefix <= 629) return 5;
  // Indiana
  if (prefix >= 460 && prefix <= 479) return 5;
  // Ohio
  if (prefix >= 430 && prefix <= 459) return 6;
  // Kentucky
  if (prefix >= 400 && prefix <= 427) return 6;

  return null;
}

const ZONES = Array.from({ length: 13 }, (_, i) => i + 1);

export default function SettingsScreen() {
  const { globalZone, setGlobalZone } = useGarden();
  const insets = useSafeAreaInsets();
  const [locationInput, setLocationInput] = useState("");
  const [detecting, setDetecting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleAutoDetect = async () => {
    setDetecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (Platform.OS === "web") {
        navigator.geolocation?.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            let zone = 6;
            if (lat > 49) zone = 3;
            else if (lat > 45) zone = 4;
            else if (lat > 41) zone = 5;
            else if (lat > 37) zone = 6;
            else if (lat > 33) zone = 7;
            else if (lat > 29) zone = 8;
            else if (lat > 25) zone = 9;
            else zone = 10;
            await setGlobalZone(zone);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setDetecting(false);
            Alert.alert("Zone Detected", `Your planting zone is estimated as Zone ${zone} based on your location.`);
          },
          () => {
            setDetecting(false);
            Alert.alert("Location Unavailable", "Could not detect location. Please enter your zone manually.");
          }
        );
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDetecting(false);
        Alert.alert("Permission Denied", "Location permission is needed for auto-detection. Please enter your zone manually.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      let zone = 6;
      if (lat > 49) zone = 3;
      else if (lat > 45) zone = 4;
      else if (lat > 41) zone = 5;
      else if (lat > 37) zone = 6;
      else if (lat > 33) zone = 7;
      else if (lat > 29) zone = 8;
      else if (lat > 25) zone = 9;
      else zone = 10;
      await setGlobalZone(zone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Zone Detected", `Your planting zone is estimated as Zone ${zone} based on your location.`);
    } catch {
      Alert.alert("Error", "Could not detect location. Please enter your zone manually.");
    } finally {
      setDetecting(false);
    }
  };

  const handleLocationLookup = () => {
    const raw = locationInput.trim();
    if (!raw) return;

    // 1) ZIP code — 5 digits
    if (/^\d{5}$/.test(raw)) {
      const zone = estimateZoneFromZip(raw);
      if (!zone) {
        Alert.alert("Unknown ZIP", "Could not determine zone from that ZIP code. Try selecting manually.");
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGlobalZone(zone);
      Alert.alert("Zone Found", `Zone ${zone} estimated from ZIP ${raw}.`);
      return;
    }

    // 2) City/State or State-only — extract state abbreviation
    let stateAbbr: string | null = null;

    // Match "City, ST" or "City, State Name"
    const commaMatch = raw.match(/,\s*([A-Za-z\s]+)$/);
    if (commaMatch) {
      const part = commaMatch[1].trim().toUpperCase();
      if (STATE_ZONES[part]) {
        stateAbbr = part;
      } else {
        // Try matching full state name
        stateAbbr = STATE_NAME_TO_ABBR[part] ?? null;
      }
    }

    // Just a 2-letter abbreviation or full state name
    if (!stateAbbr) {
      const upper = raw.toUpperCase();
      if (STATE_ZONES[upper]) {
        stateAbbr = upper;
      } else {
        stateAbbr = STATE_NAME_TO_ABBR[upper] ?? null;
      }
    }

    if (stateAbbr && STATE_ZONES[stateAbbr]) {
      const zone = STATE_ZONES[stateAbbr];
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGlobalZone(zone);
      Alert.alert("Zone Found", `Zone ${zone} estimated for ${stateAbbr}.`);
      return;
    }

    Alert.alert(
      "Not Found",
      'Enter a 5-digit ZIP code, a state abbreviation (e.g. "TX"), or "City, ST" (e.g. "Austin, TX").'
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { paddingTop: topPad }]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your growing zone</Text>
        </View>

        {globalZone !== null && (
          <View style={styles.currentZone}>
            <Ionicons name="location" size={24} color={Colors.light.primary} />
            <View style={styles.currentZoneText}>
              <Text style={styles.currentZoneLabel}>Current Zone</Text>
              <Text style={styles.currentZoneValue}>Zone {globalZone}</Text>
            </View>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setGlobalZone(null); }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auto-detect Zone</Text>
          <Text style={styles.sectionDesc}>Use your device location to estimate your USDA planting zone</Text>
          <TouchableOpacity style={styles.detectBtn} onPress={handleAutoDetect} disabled={detecting}>
            {detecting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="navigate" size={18} color="#fff" />
            )}
            <Text style={styles.detectBtnText}>{detecting ? "Detecting..." : "Detect My Zone"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Look Up by ZIP or City</Text>
          <Text style={styles.sectionDesc}>
            Enter a ZIP code, a state abbreviation (e.g. TX), or city and state (e.g. Austin, TX)
          </Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="78701 or Austin, TX"
              placeholderTextColor={Colors.light.textSecondary}
              value={locationInput}
              onChangeText={setLocationInput}
              autoCapitalize="words"
              returnKeyType="search"
              onSubmitEditing={handleLocationLookup}
            />
            <TouchableOpacity style={styles.lookupBtn} onPress={handleLocationLookup}>
              <Text style={styles.lookupText}>Look Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Zone</Text>
          <View style={styles.zoneGrid}>
            {ZONES.map(z => (
              <TouchableOpacity
                key={z}
                style={[styles.zoneBtn, globalZone === z && styles.zoneBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setGlobalZone(z);
                }}
              >
                <Text style={[styles.zoneBtnText, globalZone === z && styles.zoneBtnTextActive]}>
                  {z}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.infoText}>
            USDA Plant Hardiness Zones range from 1 (coldest) to 13 (warmest). Each garden can also have its own zone override.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.soft,
  },
  content: {
    paddingHorizontal: 20,
    gap: 0,
  },
  header: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  currentZone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.softGreen,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  currentZoneText: {
    flex: 1,
  },
  currentZoneLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  currentZoneValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.primary,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: "#fff",
  },
  clearText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  detectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },
  detectBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    backgroundColor: Colors.light.soft,
  },
  lookupBtn: {
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primaryDark,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lookupText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  zoneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  zoneBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.soft,
  },
  zoneBtnActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  zoneBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  zoneBtnTextActive: {
    color: "#fff",
  },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    backgroundColor: Colors.light.soft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
});
