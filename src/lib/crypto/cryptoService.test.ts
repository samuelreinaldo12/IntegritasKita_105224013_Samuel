import { describe, it, expect } from 'vitest';
import { generateSHA256Hash, encryptDataAES, decryptDataAES } from './cryptoService';

describe('Skenario Uji Komponen Kriptografi', () => {
  it('1. [Positif] Hashing SHA-256 menghasilkan hex 64 karakter', async () => {
    const hash = await generateSHA256Hash('Laporan Korupsi 123');
    expect(hash).toHaveLength(64);
  });

  it('2. [Positif] Enkripsi & Dekripsi AES-256-GCM mengembalikan teks asli', async () => {
    const text = 'Uang suap disembunyikan di lokasi X';
    const key = 'SuperSecretKeyAdmin123!';
    const { cipherTextHex, ivHex } = await encryptDataAES(text, key);
    const decrypted = await decryptDataAES(cipherTextHex, ivHex, key);
    expect(decrypted).toBe(text);
  });

  it('3. [Positif] Source keacakan IV menghasilkan ciphertext unik meski input sama', async () => {
    const key = 'SecretKey1234567890!';
    const res1 = await encryptDataAES('Data Sama', key);
    const res2 = await encryptDataAES('Data Sama', key);
    expect(res1.ivHex).not.toBe(res2.ivHex);
  });

  it('4. [Negatif] Uji Batas: Input teks kosong pada Hashing melempar error', async () => {
    await expect(generateSHA256Hash('')).rejects.toThrow('Input teks tidak boleh kosong.');
  });
});