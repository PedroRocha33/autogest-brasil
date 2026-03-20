import PremiumNavbar from "@/components/shared/PremiumNavbar";

export default function MarketplaceHeader() {
  return (
    <PremiumNavbar
      brand="Carbo Carros"
      navItems={[
        { label: "Veículos", onClick: () => document.querySelector("section:nth-of-type(2)")?.scrollIntoView({ behavior: "smooth" }) },
        { label: "Revendas", onClick: () => {} },
      ]}
      ctaLabel="Para Revendas"
      ctaHref="/landing"
    />
  );
}
