import { useEffect, useState } from "react";
import { decryptWallet } from "@/lib/encryption";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

export default function Receive() {
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

    // Generate QR code
    if (wallet.address) {
      QRCode.toCanvas(
        document.getElementById("qr-code") as HTMLCanvasElement,
        wallet.address,
        { 
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          }
        }
      );
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Receive XRP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <canvas id="qr-code" />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              Your XRP Address
            </div>
            <div className="flex items-center gap-2">
              <div className="truncate flex-1 text-sm font-mono bg-muted p-2 rounded">{address}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}