import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/xrpl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";

interface TransactionListProps {
  address: string;
}

export function TransactionList({ address }: TransactionListProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", address],
    queryFn: () => getTransactions(address)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions?.map((tx: any) => {
          // Handle transaction data based on the actual XRPL API response
          const transaction = tx.tx || tx;
          const isSent = transaction.Account === address;
          const amount = typeof transaction.Amount === 'string' 
            ? parseFloat(transaction.Amount) / 1000000 
            : 0;

          // Skip non-Payment transactions
          if (transaction.TransactionType !== 'Payment') {
            return null;
          }

          return (
            <div key={transaction.hash} className="flex items-center justify-between">
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
                    {new Date(
                      (transaction.date + 946684800) * 1000
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="font-medium">
                {amount.toFixed(2)} XRP
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}