import { useState } from "react";
import { useLocation } from "wouter";
import { decryptWallet } from "@/lib/encryption";
import { mintNFT } from "@/lib/nft";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { NFTMetadata } from "@/lib/nft";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL"),
  transferFee: z.number().min(0).max(50000),
});

type FormData = z.infer<typeof formSchema>;

export default function MintNFT() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      transferFee: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    const wallet = decryptWallet("");
    if (!wallet) {
      setLocation("/");
      return;
    }

    const metadata: NFTMetadata = {
      name: data.name,
      description: data.description,
      image: data.image,
    };

    // In a production app, you would upload this metadata to IPFS
    // For now, we'll use a data URI
    const uri = `data:application/json,${JSON.stringify(metadata)}`;

    setIsLoading(true);
    try {
      await mintNFT(wallet.address, uri, 8, data.transferFee);
      toast({
        title: "Success",
        description: "NFT minted successfully",
      });
      setLocation("/nfts");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Mint NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="NFT Name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Description"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Image URL"
                {...form.register("image")}
              />
              {form.formState.errors.image && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Transfer Fee (0-50000)"
                {...form.register("transferFee", { valueAsNumber: true })}
              />
              {form.formState.errors.transferFee && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.transferFee.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Minting..." : "Mint NFT"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/nfts")}
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
