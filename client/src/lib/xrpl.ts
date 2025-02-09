import { Client, Wallet, Payment, SubscribeRequest } from "xrpl";

let client: Client | null = null;

export async function getClient() {
  if (!client) {
    client = new Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
  }
  return client;
}

export async function createWallet() {
  const client = await getClient();
  const { wallet } = await client.fundWallet();
  return wallet;
}

export async function getBalance(address: string) {
  const client = await getClient();
  const response = await client.getXrpBalance(address);
  return parseFloat(response);
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
