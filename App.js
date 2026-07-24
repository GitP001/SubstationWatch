import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AssetDetailScreen from "./src/screens/AssetDetailScreen";
import AssetListScreen from "./src/screens/AssetListScreen";
import LoginScreen from "./src/screens/LoginScreen";

import {
  AuthProvider,
  useAuth,
} from "./src/context/AuthContext";

import {
  AcknowledgementProvider,
  useAcknowledgements,
} from "./src/context/AcknowledgementContext";

const Stack = createNativeStackNavigator();

function AppLoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color="#2563eb"
      />

      <Text style={styles.loadingText}>
        Loading SubstationWatch...
      </Text>
    </View>
  );
}

function AppNavigator() {
  const {
    token,
    isAuthLoading,
    signOut,
  } = useAuth();

  const {
    isStorageLoaded,
    storageError,
  } = useAcknowledgements();

  if (isAuthLoading || !isStorageLoaded) {
    return <AppLoadingScreen />;
  }

  return (
    <View style={styles.appContainer}>
      <NavigationContainer>
        <Stack.Navigator>
          {token === null ? (
            <Stack.Group>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen
                name="AssetList"
                component={AssetListScreen}
                options={{
                  title: "Substation Assets",

                  headerRight: () => (
                    <Pressable
                      onPress={signOut}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.signOutButton,
                        pressed &&
                          styles.signOutButtonPressed,
                      ]}
                    >
                      <Text
                        style={styles.signOutButtonText}
                      >
                        Sign Out
                      </Text>
                    </Pressable>
                  ),
                }}
              />

              <Stack.Screen
                name="AssetDetail"
                component={AssetDetailScreen}
                options={{
                  title: "Asset Details",
                }}
              />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {storageError ? (
        <View style={styles.storageErrorContainer}>
          <Text style={styles.storageErrorText}>
            Storage warning: {storageError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AcknowledgementProvider>
        <AppNavigator />
      </AcknowledgementProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#475569",
  },

  signOutButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  signOutButtonPressed: {
    opacity: 0.5,
  },

  signOutButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "700",
  },

  storageErrorContainer: {
    position: "absolute",
    right: 12,
    bottom: 12,
    left: 12,
    padding: 10,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },

  storageErrorText: {
    color: "#b91c1c",
    fontSize: 13,
    textAlign: "center",
  },
});