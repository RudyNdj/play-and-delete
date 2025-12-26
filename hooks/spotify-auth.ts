import {
  AuthRequestConfig,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { useEffect } from "react";

const SCOPES = ["playlist-modify-private", "playlist-modify-public"];

const REDIRECT_URI = makeRedirectUri();

export function useSpotifyAuth() {
  const authRequestConfig: AuthRequestConfig = {
    responseType: "code",
    clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
  };

  const [request, response, promptAsync] = useAuthRequest(authRequestConfig, {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
  });

  useEffect(() => {
    console.log("Auth Request:", request);
    console.log(request?.url)
    console.log("Auth Response:", response);
  }, [request, response]);

  return { request, response, promptAsync };
}