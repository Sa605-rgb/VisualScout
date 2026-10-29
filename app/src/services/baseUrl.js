/**
 * Phone must call the PC, not itself.
 * Expo Go gives the PC address as hostUri, like 192.168.0.104:8081.
 */
export function apiBaseUrl(hostUri, platform) {
  if (hostUri) {
    const host = String(hostUri).split(":")[0];
    if (host) return `http://${host}:8000`;
  }
  if (platform === "android") return "http://10.0.2.2:8000";
  return "http://127.0.0.1:8000";
}
