import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Car, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PremiumNavbarProps {
  brand: string;
  logoUrl?: string | null;
  logoIcon?: React.ReactNode;
  navItems?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCta?: { label: string; href: string };
}

export default function PremiumNavbar({
  brand,
  logoUrl,
  logoIcon,
  navItems = [],
  ctaLabel,
  ctaHref,
  secondaryCta,
}: PremiumNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        scrolled
          ? "top-3 left-1/2 -translate-x-1/2 max-w-[95%] rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          : "bg-transparent"
      )}
      style={scrolled ? { position: "fixed", left: "50%", transform: "translateX(-50%)" } : undefined}
    >
      <div className={cn("mx-auto px-5 flex items-center justify-between", scrolled ? "h-14" : "h-16 max-w-7xl")}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brand}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-border/30 group-hover:ring-primary/40 transition-all"
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
              {logoIcon || <Car className="h-4.5 w-4.5 text-background" strokeWidth={1.5} />}
            </div>
          )}
          <span className="font-heading font-bold text-sm tracking-tight">{brand}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick || (() => item.href && navigate(item.href))}
              className="relative px-3.5 py-2 text-sm font-medium tracking-tight text-muted-foreground hover:text-foreground transition-colors group"
            >
              {item.label}
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[1.5px] w-0 bg-primary rounded-full transition-all duration-300 group-hover:w-[60%]" />
            </button>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          {secondaryCta && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium tracking-tight text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
          {ctaLabel && ctaHref && (
            <Button
              size="sm"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-95 hover:scale-105 transition-all duration-200 text-sm font-medium tracking-tight px-5"
              asChild
            >
              <Link to={ctaHref}>{ctaLabel}</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] rounded-l-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-bold text-sm tracking-tight">{brand}</span>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMobileOpen(false);
                      if (item.onClick) item.onClick();
                      else if (item.href) navigate(item.href);
                    }}
                    className="text-left px-3 py-2.5 rounded-xl text-sm font-medium tracking-tight text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-8 space-y-2.5">
                {secondaryCta && (
                  <Button variant="secondary" className="w-full rounded-xl" asChild onClick={() => setMobileOpen(false)}>
                    <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                )}
                {ctaLabel && ctaHref && (
                  <Button
                    className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    asChild
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link to={ctaHref}>{ctaLabel}</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
