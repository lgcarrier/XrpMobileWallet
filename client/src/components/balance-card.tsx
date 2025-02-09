import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getBalance } from "@/lib/xrpl";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceCardProps {
  address: string;
}

export function BalanceCard({ address }: BalanceCardProps) {
  const { data: balance, isLoading } = useQuery({
    queryKey: ["balance", address],
    queryFn: () => getBalance(address)
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="text-2xl font-bold">{balance?.toFixed(2)} XRP</div>
          <div className="text-sm text-muted-foreground mt-1">Available Balance</div>
        </div>
      </CardContent>
    </Card>
  );
}
