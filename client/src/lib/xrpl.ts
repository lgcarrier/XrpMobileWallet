import { Client, Wallet, Payment, SubscribeRequest } from "xrpl";

let client: Client | null = null;
const MAINNET_SERVER = "wss://xrplcluster.com";
const TESTNET_SERVER = "wss://s.altnet.rippletest.net:51233";

export async function getClient(forceNetwork?: "mainnet" | "testnet") {
  // Close existing client if network is being switched
  if (client && forceNetwork) {
    await client.disconnect();
    client = null;
  }

  if (!client) {
    const server = forceNetwork === "testnet" ? TESTNET_SERVER : MAINNET_SERVER;
    client = new Client(server);
    await client.connect();
  }
  return client;
}

export async function createWallet() {
  const client = await getClient("testnet"); // Always use testnet for wallet creation
  const { wallet } = await client.fundWallet();
  return wallet;
}

export async function getBalance(address: string) {
  const client = await getClient();
  const response = await client.getXrpBalance(address);
  return response;
}

export async function getTransactions(address: string) {
  const client = await getClient();
  const response = await client.request({
    command: "account_tx",
    account: address,
    limit: 20
  });
  return response.result.transactions;
}

export async function sendXRP(wallet: Wallet, destination: string, amount: string) {
  const client = await getClient();
  const payment: Payment = {
    TransactionType: "Payment",
    Account: wallet.address,
    Amount: amount,
    Destination: destination
  };

  const prepared = await client.autofill(payment);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  return result;
}

export function subscribeToAccount(address: string, callback: (tx: any) => void) {
  getClient().then(client => {
    const request: SubscribeRequest = {
      command: "subscribe",
      accounts: [address]
    };
    client.request(request);
    client.on("transaction", callback);
  });
}

export function importWallet(seed: string) {
  return Wallet.fromSeed(seed);
}