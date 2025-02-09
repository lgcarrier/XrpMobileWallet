import { Wallet } from "xrpl";

const STORAGE_KEY = "encrypted_wallet";

interface StoredWallet {
  seed?: string;
  address: string;
  publicKey?: string;
  privateKey?: string;
  type: "full" | "readonly";
}

export function encryptWallet(wallet: Wallet | string, password: string, type: "full" | "readonly" = "full"): string {
  const data: StoredWallet = typeof wallet === "string" ? {
    address: wallet,
    type: "readonly"
  } : {
    seed: wallet.seed,
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    type: "full"
  };

  // In a production app, use a proper encryption library
  // This is just for demonstration
  const encrypted = btoa(JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY, encrypted);
  return encrypted;
}

export function decryptWallet(password: string): { wallet: Wallet | null, address: string, type: "full" | "readonly" } {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return { wallet: null, address: "", type: "full" };

  try {
    // In a production app, use a proper decryption library
    const data: StoredWallet = JSON.parse(atob(encrypted));

    return {
      wallet: data.seed ? Wallet.fromSeed(data.seed) : null,
      address: data.address,
      type: data.type
    };
  } catch (e) {
    return { wallet: null, address: "", type: "full" };
  }
}

export function hasStoredWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearStoredWallet() {
  localStorage.removeItem(STORAGE_KEY);
}