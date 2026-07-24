import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const {
    signIn,
    isSigningIn,
    authError,
    clearAuthError,
  } = useAuth();

  const canSubmit =
    username.trim().length > 0 &&
    password.trim().length > 0 &&
    !isSigningIn;

  function handleUsernameChange(value) {
    setUsername(value);

    if (authError) {
      clearAuthError();
    }
  }

  function handlePasswordChange(value) {
    setPassword(value);

    if (authError) {
      clearAuthError();
    }
  }

  async function handleSignIn() {
    if (!canSubmit) {
      return;
    }

    await signIn(username, password);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.appName}>
              SubstationWatch
            </Text>

            <Text style={styles.subtitle}>
              Monitor critical assets and active
              alarms.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              Username
            </Text>

            <TextInput
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="Enter username"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSigningIn}
              style={styles.input}
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSigningIn}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              style={styles.input}
            />

            {authError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {authError}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSignIn}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.signInButton,
                !canSubmit &&
                  styles.signInButtonDisabled,
                pressed &&
                  canSubmit &&
                  styles.buttonPressed,
              ]}
            >
              {isSigningIn ? (
                <ActivityIndicator
                  color="#ffffff"
                />
              ) : (
                <Text style={styles.signInButtonText}>
                  Sign In
                </Text>
              )}
            </Pressable>

            <Text style={styles.testHint}>
              Test login: use any username and
              password. Use “wrong” as the password
              to test an error.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  keyboardContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  header: {
    marginBottom: 32,
  },

  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
  },

  form: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  label: {
    marginBottom: 7,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 9,
  },

  errorContainer: {
    marginBottom: 16,
    padding: 11,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    textAlign: "center",
  },

  signInButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 9,
  },

  signInButtonDisabled: {
    backgroundColor: "#94a3b8",
  },

  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.7,
  },

  testHint: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});