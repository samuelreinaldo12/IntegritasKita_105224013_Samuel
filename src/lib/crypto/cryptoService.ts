// 1. Hashing SHA-256
export async function generateSHA256Hash(inputText: string): Promise<string> {
  if (!inputText) {
    throw new Error("Input teks tidak boleh kosong.");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(inputText);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// 2. Enkripsi AES-256-GCM
export async function encryptDataAES(plainText: string, secretKey: string): Promise<{ cipherTextHex: string; ivHex: string }> {
  if (!plainText) throw new Error("Teks mentah kosong.");
  if (!secretKey || secretKey.length < 16) throw new Error("Kunci rahasia minimal 16 karakter.");

  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyData = encoder.encode(secretKey.padEnd(32, "0").slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt"]);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoder.encode(plainText)
  );

  const cipherTextHex = Array.from(new Uint8Array(encryptedBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, "0")).join("");

  return { cipherTextHex, ivHex };
}

// 3. Dekripsi AES-256-GCM
export async function decryptDataAES(cipherTextHex: string, ivHex: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey.padEnd(32, "0").slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["decrypt"]);

  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const cipherTextBuffer = new Uint8Array(cipherTextHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

  const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, cipherTextBuffer);
  return new TextDecoder().decode(decryptedBuffer);
}