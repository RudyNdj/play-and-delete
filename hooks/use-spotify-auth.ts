import {
  exchangeCodeForToken,
  getSpotifyAccessToken,
  logoutSpotify,
  SPOTIFY_SCOPES
} from "@/spotify/auth";
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery
} from "expo-auth-session";
import { useEffect, useState } from "react";

export function useSpotifyAuth() {
  const discovery = useAutoDiscovery("https://accounts.spotify.com/");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
      scopes: SPOTIFY_SCOPES,
      redirectUri: makeRedirectUri(),
    },
    discovery
  );

  // When spotify auth response is received
  useEffect(() => {
    async function handleAuthResponse() {
      if (response?.type === "success") {
        // The user has successfully authenticated
        // Now we can exchange the authorization code for an access token
        const { code } = response.params;

        const tokenReponse = await exchangeCodeForToken(
          code,
          request?.codeVerifier!,
          discovery!
        );

        // Store the tokens securely
        setAccessToken(tokenReponse.accessToken);
      }
    }
    handleAuthResponse();
  }, [response]);

  // Load stored access token on mount
  useEffect(() => {
    async function loadToken() {
      if (!discovery) return;
      const token = await getSpotifyAccessToken(discovery);
      if (token) setAccessToken(token);
    }
    loadToken();
  }, [discovery]);

  return {
    login: () => promptAsync(),
    logout: async () => {
      await logoutSpotify();
      setAccessToken(null);
    },
    accessToken,
    isAuthenticated: !!accessToken,
  };
}

