import Constants from "expo-constants";
import { Platform, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

const ANDROID_TEST_ID = "ca-app-pub-3940256099942544/6300978111";
const IOS_TEST_ID = "ca-app-pub-3940256099942544/2934735716";
const AD_UNIT_ID = Platform.OS === "ios" ? IOS_TEST_ID : ANDROID_TEST_ID;

const isExpoGo = Constants.appOwnership === "expo";

let AdMobBanner: React.ComponentType<any> | null = null;
let AdMobBannerSize: Record<string, string> | null = null;

if (!isExpoGo) {
  try {
    const admob = require("react-native-google-mobile-ads");
    admob.mobileAds().initialize();
    AdMobBanner = admob.BannerAd;
    AdMobBannerSize = admob.BannerAdSize;
  } catch {}
}

export function AdBanner() {
  if (!AdMobBanner || !AdMobBannerSize) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Advertisement</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AdMobBanner
        unitId={AD_UNIT_ID}
        size={AdMobBannerSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: Colors.light.soft,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingVertical: 4,
  },
  placeholder: {
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  placeholderText: {
    fontSize: 11,
    color: "#aaa",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
});
