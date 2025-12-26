import {
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  TokenResponse,
} from "expo-auth-session";
import * as SecureStore from "expo-secure-store";

export const SPOTIFY_SCOPES = [
  "playlist-modify-private",
  "playlist-modify-public",
];

const STORAKE_KEY = {
  ACCESS_TOKEN: "SPOTIFY_ACCESS_TOKEN",
  REFRESH_TOKEN: "SPOTIFY_REFRESH_TOKEN",
  EXPIRES_AT: "SPOTIFY_EXPIRES_AT",
};

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

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  discovery: DiscoveryDocument
) {
  const tokenResponse = await exchangeCodeAsync(
    {
      code,
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
      redirectUri: makeRedirectUri(),
      extraParams: {
        code_verifier: codeVerifier,
      },
    },
    discovery
  );

  await storeTokenData(tokenResponse);
  return tokenResponse;
}

export async function logoutSpotify() {
  await Promise.all(
    Object.values(STORAKE_KEY).map((key) => SecureStore.deleteItemAsync(key))
  );
}

export async function storeTokenData(tokenData: TokenResponse) {
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
