import {
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  TokenResponse,
  useAuthRequest,
  useAutoDiscovery,
} from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const SCOPES = ["playlist-modify-private", "playlist-modify-public"];
const STORAKE_KEY = {
  ACCESS_TOKEN: "SPOTIFY_ACCESS_TOKEN",
  REFRESH_TOKEN: "SPOTIFY_REFRESH_TOKEN",
  EXPIRES_AT: "SPOTIFY_EXPIRES_AT",
};

export function useSpotifyAuth() {
  const discovery = useAutoDiscovery("https://accounts.spotify.com/");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
      scopes: SCOPES,
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

        const tokenReponse = await exchangeCodeAsync(
          {
            code,
            clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
            redirectUri: request?.redirectUri!,
            extraParams: {
              code_verifier: request?.codeVerifier!,
            },
          },
          discovery!
        );

        // Store the tokens securely
        await storeTokenData(tokenReponse);
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

async function logoutSpotify() {
  await Promise.all(
    Object.values(STORAKE_KEY).map((key) => SecureStore.deleteItemAsync(key))
  );
}

export async function getSpotifyAccessToken(discovery: DiscoveryDocument) {
  const tokenData = await getStoredToken();

  if (tokenData.accessToken && tokenData.expiresAt) {
    const now = Date.now();
    if (now < tokenData.expiresAt) {
      // Token is still valid
      return tokenData.accessToken;
    }
    // Token has expired, we have to refresh it
    const newTokenResponse = await refreshAsync(
      {
        clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
        refreshToken: tokenData.refreshToken!,
      },
      discovery
    );

    // Store the new token data
    await storeTokenData(newTokenResponse);
    return newTokenResponse.accessToken;
  }

  return null;
}

async function storeTokenData(tokenData: TokenResponse) {
  await SecureStore.setItemAsync(
    STORAKE_KEY.ACCESS_TOKEN,
    tokenData.accessToken!
  );

  await SecureStore.setItemAsync(
    STORAKE_KEY.REFRESH_TOKEN,
    tokenData.refreshToken!
  );

  const expiresAt = (Date.now() + tokenData.expiresIn! * 1000).toString();
  await SecureStore.setItemAsync(STORAKE_KEY.EXPIRES_AT, expiresAt);
}

async function getStoredToken() {
  const [accessToken, refreshToken, expiresAt] = await Promise.all([
    SecureStore.getItemAsync(STORAKE_KEY.ACCESS_TOKEN),
    SecureStore.getItemAsync(STORAKE_KEY.REFRESH_TOKEN),
    SecureStore.getItemAsync(STORAKE_KEY.EXPIRES_AT),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAt ? Number(expiresAt) : null,
  };
}
