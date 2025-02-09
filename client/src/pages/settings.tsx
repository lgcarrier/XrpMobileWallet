import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { decryptWallet, clearStoredWallet } from "@/lib/encryption";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Settings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [address, setAddress] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const wallet = decryptWallet("");
    if (!wallet) {
      setLocation("/");
      return;
    }
    setAddress(wallet.address);
  }, [setLocation]);

  const { data: settings } = useQuery<Settings>({
    queryKey: [`/api/settings/${address}`],
    enabled: !!address
  });

  const handleNetworkChange = async (network: "mainnet" | "testnet") => {
    if (!address) return;

    try {
      await apiRequest("PUT", "/api/settings", {
        address,
        preferences: {
          ...settings?.preferences,
          networkType: network
        }
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${address}`] });
      toast({
        title: "Success",
        description: "Network updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update network",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    clearStoredWallet();
    setLocation("/");
  };

  if (!address) return null;

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Network</label>
            <Select
              value={settings?.preferences.networkType}
              onValueChange={handleNetworkChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mainnet">Mainnet</SelectItem>
                <SelectItem value="testnet">Testnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
