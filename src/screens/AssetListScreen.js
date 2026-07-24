import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { fetchAssets, subscribeToUpdates} from '../api/mockApi';
import StatusBadge from "../components/StatusBadge";
import { getAssetStatus} from "../utils/assetStatus";
import { useAcknowledgements } from "../context/AcknowledgementContext";

export default function AssetListScreen({ navigation }) {
    // three states: assets, loading and error
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const { isAcknowledged } = useAcknowledgements();
    
    async function loadAssets() {
        setLoading(true);
        setError(null);
        try {
            const fetchedAssets = await fetchAssets();
            setAssets(fetchedAssets);
        } catch (requestError) {
            const message = requestError instanceof Error ?
                requestError.message 
                : "Failed to load assets.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAssets();
    }, []); // [] is the dependency array, 
            // execute only once when component first shows up on the screen

    // subscribe the real-time update
    useEffect(() => {
        const unsubscribe = subscribeToUpdates((updates) => {
            const updatesById = new Map(
                updates.map((updates) => [updates.id, updates])
            );

            setAssets((previousAssets) => {
                return previousAssets.map((asset) => {
                    const update = updatesById.get(asset.id);

                    if (!update) {
                        return asset;
                    }

                    return {
                        ...asset,
                        ...update,
                    };
                });
            });
        });
        // Clean up interval when component is removed
        return unsubscribe;
    }, []);

    // derived data calculated in assets
    const statusCounts = assets.reduce(
        (counts, asset) => {
            const status = getAssetStatus(asset);
            counts[status] += 1;
            return counts;
        },
        {
            ALARM: 0,
            WARNING: 0,
            NORMAL: 0,
        }
    );

    const acknowledgedAlarmCount = assets.reduce(
        (count, asset) => {
            const status = getAssetStatus(asset);

            if (status === "ALARM" && isAcknowledged(asset.id)) {
                return count + 1;
            }

            return count
        }, 
        0
    );

    // 1. loading screen
    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb"/>
                <Text style={styles.message}>Loading assets...</Text>
            </SafeAreaView>
        );
    }
    // 2. error screen
    if (error) {
        return(
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.errorTitle}>Could not load assets</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <Pressable
                    onPress={loadAssets} // onPress={loadAssets()} is wrong
                    style={({ pressed }) => [
                        styles.retryButton,
                        pressed && styles.buttonPressed,
                    ]}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </Pressable>
            </SafeAreaView>
        )
    }
    // 3. Success Screen
    // When assets are empty, ListEmptyComponent is shown on screen
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={assets}
                keyExtractor={(item)=>item.id}
                contentContainerStyle={
                    assets.length === 0 ? styles.emptyListContainer : styles.listContainer
                }
                ListHeaderComponent={
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            {statusCounts.ALARM} Alarms
                            {" | "}
                            {statusCounts.WARNING} Warnings
                            {" | "}
                            {statusCounts.NORMAL} Normal
                        </Text>

                        <Text style={styles.ackSummaryText}>
                            {acknowledgedAlarmCount} alarm
                            {acknowledgedAlarmCount === 1
                            ? ""
                            : "s"}{""}
                            acknowledged
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    console.log("rendering row:", item.id);
                    const status = getAssetStatus(item);
                    const acknowledged = isAcknowledged(item.id);

                    return (
                        <Pressable
                            onPress={() => 
                                navigation.navigate("AssetDetail", {
                                    assetId:item.id,
                                })
                            }
                            style={({ pressed }) => [
                                styles.assetRow,
                                acknowledged && styles.acknowledgedAssetRow,
                                pressed && styles.assetRowPressed,
                            ]}
                         >
                            <View style={styles.assetInformation}>
                                <Text style={styles.assetName}>
                                    {item.name}
                                </Text>

                                <Text style={styles.assetSite}>
                                {item.site}
                                </Text>

                                {acknowledged ? (
                                    <Text style={styles.ackText}>
                                        ACKNOWLEDGED
                                    </Text>
                                ): null}
                            </View>

                            <View style={styles.rightColumn}>
                                <Text style={styles.temperature}>
                                    {item.temperature.toFixed(1)}°C
                                    </Text>

                                    <StatusBadge status={status} />
                            </View>
                    </Pressable> 
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.message}>No assets found.</Text>
                    </View>
    }
    />
        </SafeAreaView>
    )
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
  
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
  
    emptyListContainer: {
      flexGrow: 1,
      paddingHorizontal: 16,
    },
  
    summaryContainer: {
      marginBottom: 14,
      padding: 14,
      backgroundColor: "#e2e8f0",
      borderRadius: 10,
    },
  
    summaryText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#334155",
      textAlign: "center",
    },
  
    ackSummaryText: {
      marginTop: 6,
      fontSize: 13,
      color: "#475569",
      textAlign: "center",
    },
  
    assetRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      padding: 16,
      backgroundColor: "#ffffff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
  
    acknowledgedAssetRow: {
      backgroundColor: "#f8fafc",
      borderColor: "#94a3b8",
    },
  
    assetRowPressed: {
      opacity: 0.65,
    },
  
    assetInformation: {
      flex: 1,
      marginRight: 12,
    },
  
    assetName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#0f172a",
    },
  
    assetSite: {
      marginTop: 4,
      fontSize: 14,
      color: "#64748b",
    },
  
    ackText: {
      marginTop: 7,
      fontSize: 12,
      fontWeight: "700",
      color: "#475569",
    },
  
    rightColumn: {
      alignItems: "flex-end",
    },
  
    temperature: {
      fontSize: 17,
      fontWeight: "700",
      color: "#1d4ed8",
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