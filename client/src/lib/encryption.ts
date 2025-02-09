import { Wallet } from "xrpl";

const STORAGE_KEY = "encrypted_wallet";
const READ_ONLY_KEY = "read_only";

interface StoredWallet {
  type: 'full' | 'readonly';
  data: {
    seed?: string;
    address: string;
    publicKey: string;
    privateKey?: string;
  };
}

export function encryptWallet(wallet: Wallet, password: string, type: 'full' | 'readonly' = 'full'): string {
  const data: StoredWallet = {
    type,
    data: {
      address: wallet.address,
      publicKey: wallet.publicKey,
    }
  };

  if (type === 'full') {
    data.data.seed = wallet.seed;
    data.data.privateKey = wallet.privateKey;
  }

  // In a production app, use a proper encryption library
  // This is just for demonstration
  const encrypted = btoa(JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY, encrypted);
  localStorage.setItem(READ_ONLY_KEY, type === 'readonly' ? 'true' : 'false');
  return encrypted;
}

export function decryptWallet(password: string): Wallet | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;

  try {
    // In a production app, use a proper decryption library
    const storedWallet: StoredWallet = JSON.parse(atob(encrypted));

    if (storedWallet.type === 'readonly') {
      return new Wallet(storedWallet.data.publicKey);
    }

    return Wallet.fromSeed(storedWallet.data.seed!);
  } catch (e) {
    console.error("Error decrypting wallet:", e);
    return null;
  }
}

export function hasStoredWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function isReadOnlyWallet(): boolean {
  return localStorage.getItem(READ_ONLY_KEY) === 'true';
}

export function clearStoredWallet() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(READ_ONLY_KEY);
}