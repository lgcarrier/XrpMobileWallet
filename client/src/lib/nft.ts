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
  collection?: {
    name: string;
  };
}

// Helper function to convert IPFS URI to HTTP URL
function ipfsToHttp(ipfsHash: string): string {
  if (!ipfsHash) return '';
  return `https://ipfs.io/ipfs/${ipfsHash.replace('ipfs://', '')}`;
}

export async function getNFTMetadataFromTokenID(tokenID: string): Promise<NFTMetadata | null> {
  try {
    console.log('Fetching metadata for token:', tokenID);
    const client = await getClient();

    // Get NFT info using NFTokenID
    const response = await client.request({
      command: "nft_info",
      nft_id: tokenID
    });

    console.log('NFT info response:', response);

    if (!response.result?.uri) {
      console.log('No URI found in NFT info');
      return null;
    }

    // Decode the hex-encoded URI
    const hexUri = response.result.uri;
    const decoded = Buffer.from(hexUri, 'hex').toString('utf8');
    console.log('Decoded URI:', decoded);

    // Handle data URLs
    if (decoded.startsWith('data:application/json')) {
      const json = decoded.substring(decoded.indexOf(',') + 1);
      const metadata = JSON.parse(decodeURIComponent(json));
      console.log('Parsed metadata from data URL:', metadata);
      return metadata;
    }

    // Handle IPFS or HTTP URLs
    const url = decoded.startsWith('ipfs://') ? ipfsToHttp(decoded) : decoded;
    console.log('Fetching from URL:', url);

    const response2 = await fetch(url);
    if (!response2.ok) {
      throw new Error(`HTTP error! status: ${response2.status}`);
    }
    const metadata = await response2.json();
    console.log('Fetched metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

export async function getNFTs(account: string) {
  const client = await getClient();

  const response = await client.request({
    command: "account_nfts",
    account: account
  });

  console.log('NFTs response:', response.result.account_nfts);
  return response.result.account_nfts;
}

export async function fetchNFTMetadata(uri: string): Promise<NFTMetadata | null> {
  try {
    console.log('Original URI:', uri);
    const decodedUri = decodeTokenURI(uri);
    console.log('Decoded URI:', decodedUri);

    // Handle data URLs
    if (decodedUri.startsWith('data:application/json')) {
      const json = decodedUri.substring(decodedUri.indexOf(',') + 1);
      const decoded = decodeURIComponent(json);
      console.log('Parsed data URL:', decoded);
      return JSON.parse(decoded);
    }

    // Handle IPFS or HTTP URLs
    const url = ipfsToHttp(decodedUri);
    console.log('Fetching from URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched metadata:', data);
    return data;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

// Helper function to decode hex-encoded URI to string
function decodeTokenURI(uri: string): string {
  try {
    // Remove any 'hex://' prefix if present
    const hexString = uri.replace('hex://', '');

    // Check if the URI is hex-encoded (must be even length and valid hex chars)
    if (hexString.length % 2 === 0 && /^[0-9A-F]+$/i.test(hexString)) {
      const decoded = Buffer.from(hexString, 'hex').toString('utf8');
      console.log('Decoded URI:', decoded);
      return decoded;
    }
    return uri;
  } catch (error) {
    console.error('Error decoding URI:', error);
    return uri;
  }
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


export async function getOffers(tokenId: string) {
  const client = await getClient();

  const response = await client.request({
    command: "nft_sell_offers",
    nft_id: tokenId
  });

  return response.result.offers;
}