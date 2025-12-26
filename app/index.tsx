import { useSpotifyAuth } from "@/hooks/spotify-auth";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { login, logout, isAuthenticated, accessToken } = useSpotifyAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play and delete</Text>
      {!isAuthenticated && (
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Connect to Spotify</Text>
        </TouchableOpacity>
      )}

      {isAuthenticated && (
        <>
          <Text>Connected to Spotify</Text>
          <Text>Token preview: {accessToken?.slice(0, 10)}...</Text>
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    textTransform: "capitalize",
    fontSize: 24,
  },
  button: {
    backgroundColor: "#1ED760",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
