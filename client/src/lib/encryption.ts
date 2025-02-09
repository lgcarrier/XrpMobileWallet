import { Wallet } from "xrpl";

const STORAGE_KEY = "encrypted_wallet";

interface StoredWallet {
  seed?: string;
  address: string;
  publicKey: string;
  privateKey?: string;
  type: "readonly" | "full";
}

export function encryptWallet(wallet: Wallet, password: string, type: "readonly" | "full"): string {
  const data: StoredWallet = {
    address: wallet.address,
    publicKey: wallet.publicKey,
    type
  };

  if (type === "full") {
    data.seed = wallet.seed;
    data.privateKey = wallet.privateKey;
  }

  // In a production app, use a proper encryption library
  // This is just for demonstration
  const encrypted = btoa(JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY, encrypted);
  return encrypted;
}

export function decryptWallet(password: string): { wallet: Wallet | null, type: "readonly" | "full" } {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return { wallet: null, type: "full" };

  try {
    // In a production app, use a proper decryption library
    const data: StoredWallet = JSON.parse(atob(encrypted));

    if (data.type === "full" && data.seed) {
      return { 
        wallet: Wallet.fromSeed(data.seed),
        type: "full"
      };
    } else {
      // For read-only wallets, we only store the address
      return {
        wallet: {
          address: data.address,
          publicKey: data.publicKey
        } as Wallet,
        type: "readonly"
      };
    }
  } catch (e) {
    return { wallet: null, type: "full" };
  }
}

export function hasStoredWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearStoredWallet() {
  localStorage.removeItem(STORAGE_KEY);
}