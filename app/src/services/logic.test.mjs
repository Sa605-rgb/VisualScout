import test from "node:test";
import assert from "node:assert/strict";

import { apiBaseUrl } from "./baseUrl.js";
import { errorMessage } from "./errors.js";
import { money, shortDate } from "../format.js";

test("api uses the Expo host so a phone can reach this PC", () => {
  assert.equal(apiBaseUrl("192.168.0.104:8081", "android"), "http://192.168.0.104:8000");
  assert.equal(apiBaseUrl("localhost:8081", "web"), "http://localhost:8000");
});

test("api falls back when Expo has no host", () => {
  assert.equal(apiBaseUrl(null, "android"), "http://10.0.2.2:8000");
  assert.equal(apiBaseUrl(null, "web"), "http://127.0.0.1:8000");
});

test("error text comes from the API", () => {
  assert.equal(
    errorMessage({ response: { data: { detail: "Wrong email or password" } } }),
    "Wrong email or password",
  );
  assert.equal(
    errorMessage({ message: "Network Error" }),
    "Cannot reach the API. Start the backend, then reload.",
  );
  assert.equal(errorMessage({}), "Something went wrong.");
});

test("money and dates format for the cart and orders table", () => {
  assert.equal(money(200), "Rs. 200");
  assert.equal(money(200.5), "Rs. 200.50");
  assert.equal(money("nope"), "Rs. 0");
  assert.equal(shortDate("2026-10-23T15:36:00"), "23/10/2026");
  assert.equal(shortDate("not-a-date"), "");
});
