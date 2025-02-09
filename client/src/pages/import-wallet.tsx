import { useState } from "react";
import { useLocation } from "wouter";
import { importWallet } from "@/lib/xrpl";
import { encryptWallet } from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type WalletMode = "readonly" | "full";

export default function ImportWallet() {
  const [mode, setMode] = useState<WalletMode>("full");
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!input || (mode === "full" && !password)) {
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
      if (mode === "full") {
        // For full access, import using seed
        wallet = importWallet(input);
      } else {
        // For read-only, just store the address
        if (!input.startsWith('r') || input.length < 25) {
          throw new Error("Invalid XRP address");
        }
        wallet = { address: input, publicKey: "" };
      }

      encryptWallet(wallet, password, mode);
      toast({
        title: "Success",
        description: "Wallet imported successfully",
      });
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Error",
        description: mode === "full" ? "Invalid seed phrase" : "Invalid XRP address",
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
        <CardContent className="space-y-6">
          <RadioGroup
            defaultValue="full"
            value={mode}
            onValueChange={(value) => setMode(value as WalletMode)}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="full"
                id="full"
                className="peer sr-only"
              />
              <Label
                htmlFor="full"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="font-semibold">Full Access</span>
                <span className="text-sm text-muted-foreground">Using seed phrase</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="readonly"
                id="readonly"
                className="peer sr-only"
              />
              <Label
                htmlFor="readonly"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="font-semibold">Read Only</span>
                <span className="text-sm text-muted-foreground">Using address</span>
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showInput ? "text" : "password"}
                placeholder={mode === "full" ? "Enter seed phrase" : "Enter XRP address"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowInput(!showInput)}
                className="absolute right-3 top-2.5"
              >
                {showInput ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {mode === "full" && (
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