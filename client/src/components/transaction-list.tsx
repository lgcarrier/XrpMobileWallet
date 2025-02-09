import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/xrpl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface TransactionListProps {
  address: string;
}

export function TransactionList({ address }: TransactionListProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", address],
    queryFn: () => getTransactions(address)
  });

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions?.map((tx: any) => {
          const isSent = tx.tx.Account === address;
          const amount = tx.tx.Amount;
          
          return (
            <div key={tx.tx.hash} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isSent ? "bg-red-100" : "bg-green-100"}`}>
                  {isSent ? (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {isSent ? "Sent" : "Received"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(tx.tx.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="font-medium">
                {parseFloat(amount) / 1000000} XRP
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
