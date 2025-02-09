import { useState } from "react";
import { useLocation } from "wouter";
import { encryptWallet } from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AddReadonlyWallet() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      encryptWallet(address, "", "readonly");
      toast({
        title: "Success",
        description: "Read-only wallet added successfully",
      });
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid wallet address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen flex items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Add Read-only Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter XRP wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Wallet"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation("/")}
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
