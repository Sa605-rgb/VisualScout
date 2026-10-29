import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { apiBaseUrl } from "./baseUrl";

const TOKEN_KEY = "visualscout_token";
let memoryToken = null;

const hostUri =
  Constants.expoGoConfig?.debuggerHost || Constants.expoConfig?.hostUri || null;

export const API_URL = apiBaseUrl(hostUri, Platform.OS);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

export async function loadToken() {
  memoryToken = await AsyncStorage.getItem(TOKEN_KEY);
  return memoryToken;
}

export async function saveToken(token) {
  memoryToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", {
    email: email.trim(),
    password,
  });
  await saveToken(data.access_token);
  return data.access_token;
}

export async function uploadShelf(asset) {
  const form = new FormData();
  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    form.append("file", blob, "shelf.jpg");
  } else {
    form.append("file", {
      uri: asset.uri,
      name: "shelf.jpg",
      type: asset.mimeType || "image/jpeg",
    });
  }
  const { data } = await api.post("/scans", form, { timeout: 120000 });
  return data;
}

export async function registerAccount(name, email, password) {
  await api.post("/auth/register", {
    name: name.trim(),
    email: email.trim(),
    password,
  });
  return login(email, password);
}
