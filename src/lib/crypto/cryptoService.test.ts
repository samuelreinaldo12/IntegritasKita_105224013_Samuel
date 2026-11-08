import { describe, expect, it } from "vitest";
import {
  decryptDataAES,
  encryptDataAES,
  generateSHA256Hash,
  importAES256Key,
} from "./cryptoService";

const aad = "IntegritasKita:test:v1:synthetic-report-01";

async function createTestKey(): Promise<CryptoKey> {
  const rawKey = crypto.getRandomValues(new Uint8Array(32));
  const keyHex = Array.from(rawKey, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return importAES256Key(keyHex);
}

describe("Pengujian kriptografi IntegritasKita", () => {
  it("membuat hash SHA-256 64 karakter hex", async () => {
    await expect(generateSHA256Hash("Laporan sintetis")).resolves.toMatch(/^[0-9a-f]{64}$/);
  });

  it("mengenkripsi lalu mendekripsi dengan AES-256-GCM dan AAD yang sama", async () => {
    const key = await createTestKey();
    const plaintext = "Laporan korupsi sintetis untuk pengujian.";
    const encrypted = await encryptDataAES(plaintext, key, aad);

    await expect(decryptDataAES(encrypted.cipherTextHex, encrypted.ivHex, key, aad))
      .resolves.toBe(plaintext);
    expect(encrypted.ivHex).toMatch(/^[0-9a-f]{24}$/);
    expect(encrypted.cipherTextHex).toHaveLength(new TextEncoder().encode(plaintext).length * 2 + 32);
  });

  it("menghasilkan IV dan ciphertext berbeda untuk setiap enkripsi", async () => {
    const key = await createTestKey();
    const first = await encryptDataAES("Laporan sintetis", key, aad);
    const second = await encryptDataAES("Laporan sintetis", key, aad);

    expect(second.ivHex).not.toBe(first.ivHex);
    expect(second.cipherTextHex).not.toBe(first.cipherTextHex);
  });

  it("menolak ciphertext yang telah dimodifikasi", async () => {
    const key = await createTestKey();
    const encrypted = await encryptDataAES("Laporan sintetis", key, aad);
    const changedCiphertext = `${encrypted.cipherTextHex[0] === "0" ? "1" : "0"}${encrypted.cipherTextHex.slice(1)}`;

    await expect(decryptDataAES(changedCiphertext, encrypted.ivHex, key, aad)).rejects.toThrow();
  });

  it("menolak tag autentikasi yang telah dimodifikasi", async () => {
    const key = await createTestKey();
    const encrypted = await encryptDataAES("Laporan sintetis", key, aad);
    const changedTag = `${encrypted.cipherTextHex.slice(0, -1)}${encrypted.cipherTextHex.endsWith("0") ? "1" : "0"}`;

    await expect(decryptDataAES(changedTag, encrypted.ivHex, key, aad)).rejects.toThrow();
  });

  it("menolak kunci yang salah", async () => {
    const key = await createTestKey();
    const wrongKey = await createTestKey();
    const encrypted = await encryptDataAES("Laporan sintetis", key, aad);

    await expect(decryptDataAES(encrypted.cipherTextHex, encrypted.ivHex, wrongKey, aad))
      .rejects.toThrow();
  });

  it("menolak AAD yang berubah", async () => {
    const key = await createTestKey();
    const encrypted = await encryptDataAES("Laporan sintetis", key, aad);

    await expect(decryptDataAES(encrypted.cipherTextHex, encrypted.ivHex, key, `${aad}:changed`))
      .rejects.toThrow();
  });

  it("menolak kunci dan IV dengan panjang atau format yang salah", async () => {
    await expect(importAES256Key("abcd")).rejects.toThrow(/tepat 32 byte/);

    const key = await createTestKey();
    await expect(decryptDataAES("00".repeat(16), "abcd", key, aad))
      .rejects.toThrow(/IV AES-GCM harus tepat 12 byte/);
  });

  it("gagal tertutup untuk plaintext kosong dan AAD kosong", async () => {
    const key = await createTestKey();

    await expect(encryptDataAES("", key, aad)).rejects.toThrow(/Teks mentah tidak boleh kosong/);
    await expect(encryptDataAES("Laporan sintetis", key, "")).rejects.toThrow(/AAD tidak boleh kosong/);
  });
});
