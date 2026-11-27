const AES_256_KEY_BYTES = 32;
const AES_GCM_IV_BYTES = 12;
const AES_GCM_TAG_BYTES = 16;
const MAX_PLAINTEXT_BYTES = 1024 * 1024;
const MAX_AAD_BYTES = 1024;
const HEX_PATTERN = /^(?:[0-9a-f]{2})+$/i;

function encodeHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function decodeHex(value: string, fieldName: string): Uint8Array {
  if (!HEX_PATTERN.test(value)) {
    throw new Error(`${fieldName} harus berupa string heksadesimal dengan panjang genap.`);
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function encodeAndValidateText(value: string, fieldName: string, maxBytes: number): Uint8Array {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${fieldName} tidak boleh kosong.`);
  }

  const encoded = new TextEncoder().encode(value);
  if (encoded.length > maxBytes) {
    throw new Error(`${fieldName} melebihi batas ${maxBytes} byte.`);
  }
  return encoded;
}

function validateKey(key: CryptoKey, usage: KeyUsage): void {
  if (
    !key
    || key.type !== "secret"
    || key.algorithm.name !== "AES-GCM"
    || !("length" in key.algorithm)
    || key.algorithm.length !== AES_256_KEY_BYTES * 8
    || !key.usages.includes(usage)
  ) {
    throw new Error(`Kunci AES-GCM 256-bit dengan izin ${usage} wajib digunakan.`);
  }
}

export async function generateSHA256Hash(inputText: string): Promise<string> {
  if (typeof inputText !== "string" || inputText.length === 0) {
    throw new Error("Input teks tidak boleh kosong.");
  }

  const data = new TextEncoder().encode(inputText);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

export async function importAES256Key(keyHex: string): Promise<CryptoKey> {
  if (typeof keyHex !== "string" || !/^[0-9a-f]{64}$/i.test(keyHex)) {
    throw new Error("Kunci AES-256 harus tepat 32 byte (64 karakter hex).");
  }

  return crypto.subtle.importKey(
    "raw",
    decodeHex(keyHex, "Kunci"),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptDataAES(
  plainText: string,
  key: CryptoKey,
  aad: string,
): Promise<{ cipherTextHex: string; ivHex: string }> {
  const plaintextBytes = encodeAndValidateText(plainText, "Teks mentah", MAX_PLAINTEXT_BYTES);
  const aadBytes = encodeAndValidateText(aad, "AAD", MAX_AAD_BYTES);
  validateKey(key, "encrypt");

  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aadBytes, tagLength: AES_GCM_TAG_BYTES * 8 },
    key,
    plaintextBytes,
  );

  return {
    cipherTextHex: encodeHex(new Uint8Array(encryptedBuffer)),
    ivHex: encodeHex(iv),
  };
}

export async function decryptDataAES(
  cipherTextHex: string,
  ivHex: string,
  key: CryptoKey,
  aad: string,
): Promise<string> {
  if (typeof ivHex !== "string" || !/^[0-9a-f]{24}$/i.test(ivHex)) {
    throw new Error(`IV AES-GCM harus tepat ${AES_GCM_IV_BYTES} byte (24 karakter hex).`);
  }
  if (typeof cipherTextHex !== "string" || !HEX_PATTERN.test(cipherTextHex)) {
    throw new Error("Ciphertext harus berupa string heksadesimal dengan panjang genap.");
  }
  if (cipherTextHex.length < AES_GCM_TAG_BYTES * 2) {
    throw new Error("Ciphertext tidak memuat tag autentikasi AES-GCM yang lengkap.");
  }

  const aadBytes = encodeAndValidateText(aad, "AAD", MAX_AAD_BYTES);
  validateKey(key, "decrypt");

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: decodeHex(ivHex, "IV"),
      additionalData: aadBytes,
      tagLength: AES_GCM_TAG_BYTES * 8,
    },
    key,
    decodeHex(cipherTextHex, "Ciphertext"),
  );

  return new TextDecoder("utf-8", { fatal: true }).decode(decryptedBuffer);
}
