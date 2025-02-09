import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/navigation";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CreateWallet from "@/pages/create-wallet";
import ImportWallet from "@/pages/import-wallet";
import AddReadonlyWallet from "@/pages/add-readonly-wallet";
import Wallet from "@/pages/wallet";
import Send from "@/pages/send";
import Receive from "@/pages/receive";
import Settings from "@/pages/settings";
import NFTs from "@/pages/nfts";
import MintNFT from "@/pages/mint-nft";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create-wallet" component={CreateWallet} />
      <Route path="/import-wallet" component={ImportWallet} />
      <Route path="/add-readonly-wallet" component={AddReadonlyWallet} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/send" component={Send} />
      <Route path="/receive" component={Receive} />
      <Route path="/settings" component={Settings} />
      <Route path="/nfts" component={NFTs} />
      <Route path="/mint-nft" component={MintNFT} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Navigation />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;