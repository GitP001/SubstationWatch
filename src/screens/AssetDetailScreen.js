import { useEffect, useState } from "react";
import { 
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet, 
    Text, 
    View 
} from "react-native";
import { fetchAssetDetail } from "../api/mockApi";
import StatusBadge from "../components/StatusBadge";
import { useAcknowledgements } from "../context/AcknowledgementContext";
import { getAssetStatus } from "../utils/assetStatus";

export default function AssetDetailScreen({ route }) {
    const { assetId } = route.params;

    const [asset, setAsset] = useState(null); // null because no detailed data was received initially
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        acknowledge,
        unacknowledge,
        isAcknowledged,
      } = useAcknowledgements();

    async function loadAssetDetail() {
        setLoading(true);
        setError(null);

        try {
            const fetchedAsset = await fetchAssetDetail(assetId);
            setAsset(fetchedAsset);
        } catch (requestError) {
            const message =
            requestError instanceof Error
                ? requestError.message
                : "Failed to load asset details.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAssetDetail();
    }, [assetId]); // re-execute when assetId changes

    // 1. Loading Screen
    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.message}>
                    Loading asset details...
                </Text>
            </SafeAreaView>
        );
    }

    // 2. Error Screen
    if (error) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.errorTitle}>
                    Could not load asset
                </Text>
                <Text style={styles.errorMessage}>
                    {error}
                </Text>
                
                <Pressable
                    onPress={loadAssetDetail}
                    style={({ pressed }) => [
                        styles.retryButton,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text style={styles.retryButtonText}>
                        Retry
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }
    if (!asset) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.message}>
                    Asset data is unavailable.
                </Text>
            </SafeAreaView>
        );
    }
    
    const status = getAssetStatus(asset);
    const acknowledged = isAcknowledged(assetId);

    const hasActiveAlert = status === "ALARM" || status === "WARNING";

    // Success Screen
    // Note that FlatList is not neccesary here
    return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <View style={styles.titleRow}>
                <View style={styles.titleInformation}>
                  <Text style={styles.assetName}>
                    {asset.name}
                  </Text>
    
                  <Text style={styles.metaText}>
                    Type: {asset.type}
                  </Text>
    
                  <Text style={styles.metaText}>
                    Site: {asset.site}
                  </Text>
                </View>
    
                <StatusBadge status={status} />
              </View>
            </View>
    
            <View style={styles.temperatureCard}>
              <Text style={styles.sectionLabel}>
                Current Temperature
              </Text>
    
              <Text style={styles.currentTemperature}>
                {asset.temperature.toFixed(1)}°C
              </Text>
            </View>
    
            {acknowledged ? (
              <View style={styles.acknowledgedCard}>
                <Text style={styles.acknowledgedTitle}>
                  Acknowledged
                </Text>
    
                <Text style={styles.acknowledgedDescription}>
                  An operator has confirmed this alert.
                </Text>
    
                <Pressable
                  onPress={() => unacknowledge(assetId)}
                  style={({ pressed }) => [
                    styles.clearAckButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.clearAckButtonText}>
                    Clear Acknowledgement
                  </Text>
                </Pressable>
              </View>
            ) : hasActiveAlert ? (
              <Pressable
                onPress={() => acknowledge(assetId)}
                style={({ pressed }) => [
                  styles.acknowledgeButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.acknowledgeButtonText}>
                  Acknowledge Alert
                </Text>
              </Pressable>
            ) : (
              <View style={styles.normalMessage}>
                <Text style={styles.normalMessageText}>
                  This asset currently has no active warning
                  or alarm.
                </Text>
              </View>
            )}
    
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Thresholds
              </Text>
    
              <View style={styles.thresholdRow}>
                <Text style={styles.thresholdLabel}>
                  Warning
                </Text>
    
                <Text style={styles.warningValue}>
                  {asset.thresholds.warning}°C
                </Text>
              </View>
    
              <View style={styles.thresholdRow}>
                <Text style={styles.thresholdLabel}>
                  Alarm
                </Text>
    
                <Text style={styles.alarmValue}>
                  {asset.thresholds.alarm}°C
                </Text>
              </View>
            </View>
    
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Temperature History
              </Text>
    
              {asset.history.map((reading) => (
                <View
                  key={reading.timestamp}
                  style={styles.historyRow}
                >
                  <Text style={styles.historyTime}>
                    {formatTime(reading.timestamp)}
                  </Text>
    
                  <Text style={styles.historyValue}>
                    {reading.value.toFixed(1)}°C
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f8fafc",
    },
  
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: "#f8fafc",
    },
  
    content: {
      padding: 16,
      paddingBottom: 32,
    },
  
    card: {
      marginBottom: 16,
      padding: 18,
      backgroundColor: "#ffffff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
  
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
  
    titleInformation: {
      flex: 1,
      marginRight: 12,
    },
  
    temperatureCard: {
      marginBottom: 16,
      padding: 24,
      alignItems: "center",
      backgroundColor: "#eff6ff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#bfdbfe",
    },
  
    assetName: {
      marginBottom: 10,
      fontSize: 24,
      fontWeight: "700",
      color: "#0f172a",
    },
  
    metaText: {
      marginTop: 4,
      fontSize: 15,
      color: "#64748b",
    },
  
    sectionLabel: {
      marginBottom: 8,
      fontSize: 15,
      fontWeight: "600",
      color: "#475569",
    },
  
    currentTemperature: {
      fontSize: 42,
      fontWeight: "800",
      color: "#1d4ed8",
    },
  
    acknowledgeButton: {
      marginBottom: 16,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: "#dc2626",
      borderRadius: 10,
    },
  
    acknowledgeButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
  
    acknowledgedCard: {
      marginBottom: 16,
      padding: 18,
      backgroundColor: "#f1f5f9",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#94a3b8",
    },
  
    acknowledgedTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#334155",
    },
  
    acknowledgedDescription: {
      marginTop: 6,
      marginBottom: 14,
      color: "#64748b",
    },
  
    clearAckButton: {
      paddingVertical: 11,
      backgroundColor: "#475569",
      borderRadius: 8,
    },
  
    clearAckButtonText: {
      color: "#ffffff",
      fontWeight: "700",
      textAlign: "center",
    },
  
    normalMessage: {
      marginBottom: 16,
      padding: 14,
      backgroundColor: "#dcfce7",
      borderRadius: 10,
    },
  
    normalMessageText: {
      color: "#166534",
      textAlign: "center",
    },
  
    sectionTitle: {
      marginBottom: 14,
      fontSize: 18,
      fontWeight: "700",
      color: "#0f172a",
    },
  
    thresholdRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
  
    thresholdLabel: {
      fontSize: 16,
      color: "#475569",
    },
  
    warningValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#d97706",
    },
  
    alarmValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#dc2626",
    },
  
    historyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "#cbd5e1",
    },
  
    historyTime: {
      fontSize: 15,
      color: "#64748b",
    },
  
    historyValue: {
      fontSize: 15,
      fontWeight: "700",
      color: "#0f172a",
    },
  
    message: {
      marginTop: 12,
      fontSize: 16,
      color: "#475569",
    },
  
    errorTitle: {
      marginBottom: 8,
      fontSize: 20,
      fontWeight: "700",
      color: "#b91c1c",
    },
  
    errorMessage: {
      marginBottom: 18,
      fontSize: 15,
      color: "#64748b",
      textAlign: "center",
    },
  
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: "#2563eb",
      borderRadius: 8,
    },
  
    retryButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
  
    buttonPressed: {
      opacity: 0.7,
    },
  });