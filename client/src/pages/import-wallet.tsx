import { useState } from "react";
import { useLocation } from "wouter";
import { importWallet } from "@/lib/xrpl";
import { encryptWallet } from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ImportWallet() {
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!key || (!isReadOnly && !password)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let wallet;
      if (isReadOnly) {
        // For read-only, the key should be a public key
        wallet = new Wallet(key); // Assuming Wallet constructor exists and handles public keys
      } else {
        // For full access, the key should be a seed
        wallet = importWallet(key);
      }

      encryptWallet(wallet, password, isReadOnly ? 'readonly' : 'full');
      toast({
        title: "Success",
        description: "Wallet imported successfully",
      });
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Error",
        description: isReadOnly ? "Invalid public key" : "Invalid seed phrase",
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
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="read-only">Read-only Mode</Label>
            <Switch
              id="read-only"
              checked={isReadOnly}
              onCheckedChange={setIsReadOnly}
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder={isReadOnly ? "Enter public key" : "Enter seed phrase"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {!isReadOnly && (
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
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