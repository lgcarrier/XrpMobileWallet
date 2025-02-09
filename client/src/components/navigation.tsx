import { Link, useLocation } from "wouter";
import { Wallet, Home, Send, Settings, QrCode, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { decryptWallet } from "@/lib/encryption";

export function Navigation() {
  const [location] = useLocation();
  const { type } = decryptWallet("");

  const links = [
    { href: "/wallet", icon: Home, label: "Home" },
    { href: "/send", icon: Send, label: "Send", requiresFull: true },
    { href: "/receive", icon: QrCode, label: "Receive" },
    { href: "/nfts", icon: Image, label: "NFTs", requiresFull: true },
    { href: "/settings", icon: Settings, label: "Settings" }
  ].filter(link => !link.requiresFull || type === "full");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="container flex justify-around py-2">
        {links.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <a className={cn(
              "flex flex-col items-center p-2 text-sm",
              location === href ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="h-6 w-6 mb-1" />
              <span>{label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}