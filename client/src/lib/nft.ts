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

// Helper function to convert IPFS URI to HTTP URL using multiple gateways
function ipfsToHttp(ipfsHash: string): string {
  if (!ipfsHash) return '';

  // If it's already an HTTP URL, return as is
  if (ipfsHash.startsWith('https://') || ipfsHash.startsWith('http://')) {
    return ipfsHash;
  }

  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '');

  // Try multiple IPFS gateways
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/'
  ];

  // Return the first gateway URL
  return `${gateways[0]}${hash}`;
}

// Helper function to decode hex/base64 data with better error handling
function decodeData(data: string): string {
  try {
    // If empty or not a string, return as is
    if (!data || typeof data !== 'string') {
      console.log('Invalid data to decode:', data);
      return data;
    }

    // Remove any whitespace
    data = data.trim();

    // First try to decode as hex if it looks like hex
    if (/^[0-9A-F]+$/i.test(data) && data.length % 2 === 0) {
      const decoded = Buffer.from(data, 'hex').toString('utf8');
      console.log('Decoded hex data:', decoded);
      return decoded;
    }

    // Then try base64 if it looks like base64
    if (/^[A-Za-z0-9+/=]+$/.test(data)) {
      try {
        const decoded = atob(data);
        console.log('Decoded base64 data:', decoded);
        return decoded;
      } catch {
        // Not valid base64, return as is
        return data;
      }
    }

    // If neither hex nor base64, return as is
    return data;
  } catch (error) {
    console.error('Error decoding data:', error);
    return data;
  }
}

export async function getNFTMetadataFromTokenID(tokenID: string): Promise<NFTMetadata> {
  try {
    console.log('Starting metadata fetch for token:', tokenID);
    let client;
    try {
      client = await getClient();
      console.log('XRPL client connected');
    } catch (error) {
      console.error('Error connecting to XRPL:', error);
      throw new Error('Failed to connect to XRPL');
    }

    let nftInfoResponse;
    try {
      nftInfoResponse = await client.request({
        command: "nft_info",
        nft_id: tokenID
      });
      console.log('NFT info response:', JSON.stringify(nftInfoResponse, null, 2));
    } catch (error) {
      console.error('Error fetching NFT info:', error);
      throw new Error('Failed to fetch NFT info');
    }

    if (!nftInfoResponse?.result?.uri) {
      console.log('No URI found in NFT info:', nftInfoResponse?.result);
      return {
        name: `NFT #${tokenID.slice(-6)}`,
        description: 'No metadata available',
        image: '',
      };
    }

    // Decode the hex-encoded URI
    let decodedUri;
    try {
      decodedUri = decodeData(nftInfoResponse.result.uri);
      console.log('Decoded URI:', decodedUri);
    } catch (error) {
      console.error('Error decoding URI:', error);
      throw new Error('Failed to decode NFT URI');
    }

    // Handle data URLs
    if (decodedUri.startsWith('data:application/json')) {
      try {
        const json = decodedUri.substring(decodedUri.indexOf(',') + 1);
        let metadata = JSON.parse(decodeURIComponent(json));
        console.log('Parsed metadata from data URL:', metadata);

        return {
          name: metadata.name || `NFT #${tokenID.slice(-6)}`,
          description: metadata.description || '',
          image: metadata.image ? ipfsToHttp(metadata.image) : '',
          attributes: metadata.attributes || [],
          collection: metadata.collection || null,
        };
      } catch (error) {
        console.error('Error parsing data URL JSON:', error);
        throw new Error('Failed to parse metadata from data URL');
      }
    }

    // Handle IPFS or HTTP URLs
    const url = decodedUri.startsWith('ipfs://') ? ipfsToHttp(decodedUri) : decodedUri;
    console.log('Fetching metadata from URL:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let metadata = await response.json();
      console.log('Fetched metadata from URL:', metadata);

      return {
        name: metadata.name || `NFT #${tokenID.slice(-6)}`,
        description: metadata.description || '',
        image: metadata.image ? ipfsToHttp(metadata.image) : '',
        attributes: metadata.attributes || [],
        collection: metadata.collection || null,
      };
    } catch (error) {
      console.error('Error fetching metadata from URL:', error);
      throw new Error('Failed to fetch metadata from URL');
    }
  } catch (error) {
    console.error('Error in getNFTMetadataFromTokenID:', error);
    // Instead of returning null, return a fallback metadata object
    return {
      name: `NFT #${tokenID.slice(-6)}`,
      description: `Error loading metadata: ${error.message}`,
      image: '',
    };
  }
}

export async function getNFTs(account: string) {
  try {
    console.log('Fetching NFTs for account:', account);
    const client = await getClient();

    const response = await client.request({
      command: "account_nfts",
      account: account
    });

    console.log('NFTs response:', response.result.account_nfts);
    return response.result.account_nfts;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
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