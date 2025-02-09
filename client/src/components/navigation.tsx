import { Link, useLocation } from "wouter";
import { Wallet, Home, Send, Settings, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/wallet", icon: Home, label: "Home" },
    { href: "/send", icon: Send, label: "Send" },
    { href: "/receive", icon: QrCode, label: "Receive" },
    { href: "/settings", icon: Settings, label: "Settings" }
  ];

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
