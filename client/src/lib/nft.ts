import { Client, NFTokenMint, NFTokenCreateOffer, NFTokenBurn } from "xrpl";
import { getClient } from "./xrpl";
import { decryptWallet } from "./encryption";

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
    description?: string;
    family?: string;
  };
}

// Helper function to convert a hex-encoded string to a regular string
function hexToString(hex: string): string {
  let str = "";
  try {
    // Remove an optional "0x" prefix and whitespace
    hex = hex.replace(/^0x/, '').trim();

    // Validate hex string
    if (!/^[0-9A-F]+$/i.test(hex) || hex.length % 2 !== 0) {
      console.log('Invalid hex string:', hex);
      return hex;
    }

    // Convert hex to string
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    console.log('Decoded hex string:', str);
    return str;
  } catch (error) {
    console.error('Error decoding hex string:', error);
    return hex;
  }
}

// Helper function to convert IPFS URI to HTTP URL
function ipfsToHttp(uri: string): string {
  if (!uri) return '';

  // If it's already an HTTP URL, return as is
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    // Special handling for filebase.io URLs
    if (uri.includes('ipfs.filebase.io')) {
      const ipfsPath = uri.split('/ipfs/')[1];
      return `https://ipfs.io/ipfs/${ipfsPath}`;
    }
    return uri;
  }

  // If it's an IPFS URI, convert to HTTP URL
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // Handle direct IPFS hash
  if (/^Qm[1-9A-Za-z]{44}/.test(uri) || /^bafy[A-Za-z2-7]{55}/.test(uri)) {
    return `https://ipfs.io/ipfs/${uri}`;
  }

  // If it's a relative path and we have a base IPFS URL
  if (uri.startsWith('/') && uri.includes('ipfs/')) {
    return `https://ipfs.io${uri}`;
  }

  // Return as is if we can't determine the format
  return uri;
}

// Helper function to fetch and normalize metadata
async function fetchMetadata(uri: string): Promise<NFTMetadata> {
  try {
    console.log('Fetching metadata from:', uri);
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched metadata:', data);

    // Handle xSPECTAR collection format
    if (data.schema?.includes('filebase.io')) {
      return {
        name: data.name || 'Untitled NFT',
        description: data.description || '',
        image: data.image ? ipfsToHttp(data.image) : '',
        attributes: data.attributes || [],
        collection: {
          name: data.collection?.name || '',
          family: data.collection?.family || '',
          description: data.collection?.description || ''
        }
      };
    }

    // Handle xSPECTAR alternate format
    if (data.altImageData?.centralisedUri) {
      return {
        name: data.name || 'Untitled NFT',
        description: data.description || '',
        image: data.altImageData.centralisedUri,
        attributes: data.attributes || [],
        collection: {
          name: data.collection?.name || '',
          family: data.collection?.family || '',
          description: data.collection?.description || ''
        }
      };
    }

    // Extract image URL from various possible locations
    let imageUrl = data.image;
    if (!imageUrl && data.properties?.image) {
      imageUrl = data.properties.image.description || data.properties.image;
    }
    if (!imageUrl && data.properties?.files?.[0]?.uri) {
      imageUrl = data.properties.files[0].uri;
    }
    if (!imageUrl && data.alternative_sources?.image?.[0]) {
      imageUrl = data.alternative_sources.image[0];
    }

    // Try to find collection info
    const collection = data.collection || {
      name: data.properties?.collection?.name || data.collection_name,
      description: data.properties?.collection?.description || data.collection_description
    };

    return {
      name: data.name || 'Untitled NFT',
      description: data.description || '',
      image: imageUrl ? ipfsToHttp(imageUrl) : '',
      attributes: data.attributes || data.traits || [],
      collection: collection?.name ? collection : null,
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}

export async function getNFTMetadataFromTokenID(tokenID: string): Promise<NFTMetadata> {
  try {
    console.log('Getting metadata for token:', tokenID);
    const client = await getClient();

    // Get the current wallet's address
    const { address } = decryptWallet("");
    if (!address) {
      throw new Error('No wallet address available');
    }

    // Get NFT info using account_nfts command
    const response = await client.request({
      command: "account_nfts",
      account: address
    });

    console.log('NFTs response:', response);

    // Find the specific NFT
    const nft = response.result.account_nfts.find(
      (n: any) => n.NFTokenID === tokenID
    );

    if (!nft) {
      throw new Error('NFT not found');
    }

    if (!nft.URI) {
      return {
        name: `NFT #${tokenID.slice(-6)}`,
        description: 'No metadata available',
        image: '',
      };
    }

    // Decode the URI
    const decodedUri = hexToString(nft.URI);
    console.log('Decoded URI:', decodedUri);

    // Handle data URLs
    if (decodedUri.startsWith('data:application/json')) {
      try {
        const json = decodedUri.substring(decodedUri.indexOf(',') + 1);
        const metadata = JSON.parse(decodeURIComponent(json));
        return {
          name: metadata.name || `NFT #${tokenID.slice(-6)}`,
          description: metadata.description || '',
          image: metadata.image ? ipfsToHttp(metadata.image) : '',
          attributes: metadata.attributes || [],
          collection: metadata.collection || null,
        };
      } catch (error) {
        console.error('Error parsing data URL:', error);
        throw error;
      }
    }

    // Handle IPFS or HTTP URLs
    const url = ipfsToHttp(decodedUri);
    return await fetchMetadata(url);

  } catch (error) {
    console.error('Error getting NFT metadata:', error);
    return {
      name: `NFT #${tokenID.slice(-6)}`,
      description: error instanceof Error ? error.message : 'Error loading metadata',
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
