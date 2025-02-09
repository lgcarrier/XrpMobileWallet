import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { decryptWallet } from "@/lib/encryption";
import { BalanceCard } from "@/components/balance-card";
import { TransactionList } from "@/components/transaction-list";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Wallet() {
  const [, setLocation] = useLocation();
  const [address, setAddress] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const wallet = decryptWallet("");
    if (!wallet) {
      setLocation("/");
      return;
    }
    setAddress(wallet.address);
  }, [setLocation]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  if (!address) return null;

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <div className="space-y-6">
        <BalanceCard address={address} />
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="truncate flex-1 text-sm">{address}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <TransactionList address={address} />
      </div>
    </div>
  );
}
