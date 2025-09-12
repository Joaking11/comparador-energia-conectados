
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.CRYPTO_SECRET_KEY || 'default-key-for-dev';

/**
 * Encripta una contraseña de forma segura
 */
export function encryptPassword(password: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Error encriptando contraseña:', error);
    throw new Error('Error al encriptar credenciales');
  }
}

/**
 * Desencripta una contraseña
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error desencriptando contraseña:', error);
    throw new Error('Error al desencriptar credenciales');
  }
}

/**
 * Genera una clave aleatoria para encriptación
 */
export function generateSecretKey(): string {
  return CryptoJS.lib.WordArray.random(256/8).toString();
}
