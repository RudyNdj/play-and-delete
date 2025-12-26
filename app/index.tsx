import { useSpotifyAuth } from "@/hooks/spotify-auth";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const {promptAsync} = useSpotifyAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play and delete</Text>
      <TouchableOpacity
      style={styles.button}
        onPress={() => {
          console.log("Connect to spotify button pressed");
          promptAsync();
        }}
      >
        <Text style={styles.buttonText}>Connect to Spotify</Text>
      </TouchableOpacity>
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
