import { Client, NFTokenMint, NFTokenCreateOffer, NFTokenBurn, NFTokenAcceptOffer } from "xrpl";
import { getClient } from "./xrpl";

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export async function mintNFT(
  account: string,
  uri: string,
  flags: number = 8,
  transferFee: number = 0,
  taxon: number = 0
) {
  const client = await getClient();
  
  const mintTx: NFTokenMint = {
    TransactionType: "NFTokenMint",
    Account: account,
    URI: Buffer.from(uri).toString("hex").toUpperCase(),
    Flags: flags,
    TransferFee: transferFee,
    NFTokenTaxon: taxon
  };

  const prepared = await client.autofill(mintTx);
  const response = await client.submit(prepared);
  return response;
}

export async function createSellOffer(
  account: string,
  tokenId: string,
  amount: string,
  destination?: string
) {
  const client = await getClient();
  
  const offerTx: NFTokenCreateOffer = {
    TransactionType: "NFTokenCreateOffer",
    Account: account,
    NFTokenID: tokenId,
    Amount: amount,
    Flags: destination ? 1 : 0,
    Destination: destination
  };

  const prepared = await client.autofill(offerTx);
  const response = await client.submit(prepared);
  return response;
}

export async function acceptOffer(account: string, offerIndex: string) {
  const client = await getClient();
  
  const acceptTx: NFTokenAcceptOffer = {
    TransactionType: "NFTokenAcceptOffer",
    Account: account,
    NFTokenSellOffer: offerIndex
  };

  const prepared = await client.autofill(acceptTx);
  const response = await client.submit(prepared);
  return response;
}

export async function burnNFT(account: string, tokenId: string) {
  const client = await getClient();
  
  const burnTx: NFTokenBurn = {
    TransactionType: "NFTokenBurn",
    Account: account,
    NFTokenID: tokenId
  };

  const prepared = await client.autofill(burnTx);
  const response = await client.submit(prepared);
  return response;
}

export async function getNFTs(account: string) {
  const client = await getClient();
  
  const response = await client.request({
    command: "account_nfts",
    account: account
  });
  
  return response.result.account_nfts;
}

export async function getOffers(tokenId: string) {
  const client = await getClient();
  
  const response = await client.request({
    command: "nft_sell_offers",
    nft_id: tokenId
  });
  
  return response.result.offers;
}
