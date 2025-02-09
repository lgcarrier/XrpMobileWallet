import { useState } from "react";
import { useLocation } from "wouter";
import { decryptWallet } from "@/lib/encryption";
import { sendXRP } from "@/lib/xrpl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Send() {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!destination || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const wallet = decryptWallet("");
    if (!wallet) {
      setLocation("/");
      return;
    }

    setIsLoading(true);
    try {
      await sendXRP(wallet, destination, (parseFloat(amount) * 1000000).toString());
      toast({
        title: "Success",
        description: "Transaction sent successfully",
      });
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send transaction",
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
          <CardTitle>Send XRP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Destination address"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount (XRP)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send XRP"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
