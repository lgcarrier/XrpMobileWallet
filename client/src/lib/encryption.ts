import { Wallet } from "xrpl";

const STORAGE_KEY = "encrypted_wallet";

export function encryptWallet(wallet: Wallet, password: string): string {
  const data = {
    seed: wallet.seed,
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey
  };
  
  // In a production app, use a proper encryption library
  // This is just for demonstration
  const encrypted = btoa(JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY, encrypted);
  return encrypted;
}

export function decryptWallet(password: string): Wallet | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  
  try {
    // In a production app, use a proper decryption library
    const data = JSON.parse(atob(encrypted));
    return Wallet.fromSeed(data.seed);
  } catch (e) {
    return null;
  }
}

export function hasStoredWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearStoredWallet() {
  localStorage.removeItem(STORAGE_KEY);
}
