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
  if (ipfsHash.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${ipfsHash.replace('ipfs://', '')}`;
  }
  if (ipfsHash.startsWith('https://') || ipfsHash.startsWith('http://')) {
    return ipfsHash;
  }
  // Assume it's a direct IPFS hash
  return `https://ipfs.io/ipfs/${ipfsHash}`;
}

// Helper function to decode hex/base64 data
function decodeData(data: string): string {
  try {
    // First try to decode as hex
    if (/^[0-9A-F]+$/i.test(data) && data.length % 2 === 0) {
      return Buffer.from(data, 'hex').toString('utf8');
    }
    // Then try base64
    return atob(data);
  } catch (error) {
    console.error('Error decoding data:', error);
    return data;
  }
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
    const decodedUri = decodeData(response.result.uri);
    console.log('Decoded URI:', decodedUri);

    // Handle data URLs
    if (decodedUri.startsWith('data:application/json')) {
      const json = decodedUri.substring(decodedUri.indexOf(',') + 1);
      try {
        const metadata = JSON.parse(decodeURIComponent(json));
        console.log('Parsed metadata from data URL:', metadata);

        // Ensure image URL is properly formatted
        if (metadata.image) {
          metadata.image = ipfsToHttp(metadata.image);
        }

        return metadata;
      } catch (error) {
        console.error('Error parsing data URL JSON:', error);
        return null;
      }
    }

    // Handle IPFS or HTTP URLs
    const url = decodedUri.startsWith('ipfs://') ? ipfsToHttp(decodedUri) : decodedUri;
    console.log('Fetching from URL:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const metadata = await response.json();
      console.log('Fetched metadata:', metadata);

      // Ensure image URL is properly formatted
      if (metadata.image) {
        metadata.image = ipfsToHttp(metadata.image);
      }

      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
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