import { useEffect } from "react";
import { useLocation } from "wouter";
import { hasStoredWallet } from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (hasStoredWallet()) {
      setLocation("/wallet");
    }
  }, [setLocation]);

  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen flex items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Welcome to XRP Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => setLocation("/create-wallet")}
          >
            Create New Wallet
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => setLocation("/import-wallet")}
          >
            Import Existing Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
