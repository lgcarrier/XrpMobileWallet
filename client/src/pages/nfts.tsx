import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { decryptWallet } from "@/lib/encryption";
import { getNFTs, createSellOffer, burnNFT } from "@/lib/nft";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface NFTListProps {
  address: string;
}

function NFTList({ address }: NFTListProps) {
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
        <Card key={nft.NFTokenID}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="font-medium">Token ID: {nft.NFTokenID}</div>
              <div className="text-sm text-muted-foreground">
                Serial: {nft.nft_serial}
              </div>
              <div className="flex gap-2 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedNFT(nft)}
                    >
                      Sell
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Sell Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        type="number"
                        placeholder="Price in XRP"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                      />
                      <Button 
                        className="w-full"
                        onClick={() => handleCreateOffer(nft.NFTokenID)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Create Offer"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="destructive"
                  onClick={() => handleBurn(nft.NFTokenID)}
                  disabled={isSubmitting}
                >
                  Burn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function NFTs() {
  const [, setLocation] = useLocation();
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const wallet = decryptWallet("");
    if (!wallet) {
      setLocation("/");
      return;
    }
    setAddress(wallet.address);
  }, [setLocation]);

  if (!address) return null;

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-20">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My NFTs</CardTitle>
              <CardDescription>Manage your NFT collection</CardDescription>
            </div>
            <Button onClick={() => setLocation("/mint-nft")}>
              <Plus className="h-4 w-4 mr-2" />
              Mint NFT
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <NFTList address={address} />
        </CardContent>
      </Card>
    </div>
  );
}
