import { useState } from "react";
import { useLocation } from "wouter";
import { importWallet } from "@/lib/xrpl";
import { encryptWallet } from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function ImportWallet() {
  const [seed, setSeed] = useState("");
  const [password, setPassword] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!seed || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const wallet = importWallet(seed);
      encryptWallet(wallet, password);
      toast({
        title: "Success",
        description: "Wallet imported successfully",
      });
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid seed phrase",
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
          <CardTitle className="text-center">Import Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showSeed ? "text" : "password"}
                placeholder="Enter seed phrase"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSeed(!showSeed)}
                className="absolute right-3 top-2.5"
              >
                {showSeed ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleImport}
            disabled={isLoading}
          >
            {isLoading ? "Importing..." : "Import Wallet"}
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
