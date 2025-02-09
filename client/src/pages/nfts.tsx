import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { decryptWallet } from "@/lib/encryption";
import { getNFTs, createSellOffer, burnNFT, fetchNFTMetadata, type NFTMetadata } from "@/lib/nft";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const ipfsToHttp = (ipfsHash: string) => {
  if (!ipfsHash) return '';
  return `https://ipfs.io/ipfs/${ipfsHash.replace('ipfs://', '')}`;
};

interface NFTCardProps {
  nft: any;
  address: string;
  type: "full" | "readonly";
  onCreateOffer: (tokenId: string) => void;
  onBurn: (tokenId: string) => void;
  isSubmitting: boolean;
}

function NFTCard({ nft, address, type, onCreateOffer, onBurn, isSubmitting }: NFTCardProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetadata() {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Loading metadata for NFT:', nft);
        if (!nft.URI) {
          setError('No URI available');
          return;
        }
        const data = await fetchNFTMetadata(nft.URI);
        if (data) {
          console.log('Loaded metadata:', data);
          setMetadata(data);
        } else {
          setError('Failed to load metadata');
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
        setError('Error loading NFT data');
      } finally {
        setIsLoading(false);
      }
    }
    loadMetadata();
  }, [nft.URI]);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative bg-muted">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : metadata?.image ? (
          <div className="relative w-full h-full">
            <img
              src={ipfsToHttp(metadata.image)}
              alt={metadata.name || 'NFT'}
              className="object-cover w-full h-full"
              onError={(e) => {
                console.error('Error loading image:', e);
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = ''; // Clear the source to show fallback
                setError('Failed to load image');
              }}
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-90">
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {error || 'No image available'}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">
              {metadata?.name || `NFT #${nft.NFTokenID?.slice(-6)}`}
            </h3>
            {metadata?.collection && (
              <Badge variant="secondary" className="truncate max-w-[150px]">
                {metadata.collection.name}
              </Badge>
            )}
          </div>

          {metadata?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {metadata.description}
            </p>
          )}

          {metadata?.attributes && metadata.attributes.length > 0 && (
            <div className="grid grid-cols-2 gap-1 mt-2">
              {metadata.attributes.slice(0, 4).map((attr, index) => (
                <div key={index} className="text-xs">
                  <span className="text-muted-foreground">{attr.trait_type}:</span>{' '}
                  <span className="font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          )}

          {type === "full" && (
            <div className="flex gap-2 mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => onCreateOffer(nft.NFTokenID)}>
                    Sell
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button
                variant="destructive"
                onClick={() => onBurn(nft.NFTokenID)}
                disabled={isSubmitting}
              >
                Burn
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface NFTListProps {
  address: string;
  type: "full" | "readonly";
}

function NFTList({ address, type }: NFTListProps) {
  const { data: nfts, isLoading } = useQuery({
    queryKey: ["nfts", address],
    queryFn: () => getNFTs(address)
  });
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreateOffer = async (tokenId: string) => {
    if (!sellPrice) {
      toast({
        title: "Error",
        description: "Please enter a sell price",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createSellOffer(address, tokenId, sellPrice);
      toast({
        title: "Success",
        description: "Sell offer created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["nfts", address] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sell offer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setSelectedNFT(null);
    }
  };

  const handleBurn = async (tokenId: string) => {
    setIsSubmitting(true);
    try {
      await burnNFT(address, tokenId);
      toast({
        title: "Success",
        description: "NFT burned successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["nfts", address] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to burn NFT",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {nfts?.map((nft: any) => (
        <NFTCard key={nft.NFTokenID} nft={nft} address={address} type={type} onCreateOffer={handleCreateOffer} onBurn={handleBurn} isSubmitting={isSubmitting} />
      ))}
    </div>
  );
}

export default function NFTs() {
  const [, setLocation] = useLocation();
  const [address, setAddress] = useState<string>("");
  const [walletType, setWalletType] = useState<"full" | "readonly">("full");

  useEffect(() => {
    const { address, type } = decryptWallet("");
    if (!address) {
      setLocation("/");
      return;
    }
    setAddress(address);
    setWalletType(type);
  }, [setLocation]);

  if (!address) return null;

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-20">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My NFTs</CardTitle>
              <CardDescription>
                {walletType === "readonly" ? "View NFT collection" : "Manage your NFT collection"}
              </CardDescription>
            </div>
            {walletType === "full" && (
              <Button onClick={() => setLocation("/mint-nft")}>
                <Plus className="h-4 w-4 mr-2" />
                Mint NFT
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <NFTList address={address} type={walletType} />
        </CardContent>
      </Card>
    </div>
  );
}