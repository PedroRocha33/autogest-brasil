import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Car, TrendingUp, Shield, Store } from "lucide-react";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import PremiumFooter from "@/components/shared/PremiumFooter";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceVehicleCard from "@/components/marketplace/MarketplaceVehicleCard";
import MarketplaceVehicleDialog from "@/components/marketplace/MarketplaceVehicleDialog";

interface MarketplaceVehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  km: number | null;
  fuel: string | null;
  sale_price: number | null;
  photos: string[] | null;
  tenant_id: string;
  color: string | null;
  transmission: string | null;
}

interface MarketplaceTenant {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
}

const defaultFilters = {
  search: "",
  brand: "all",
  fuel: "all",
  city: "all",
  priceRange: "all",
  yearRange: "all",
  transmission: "all",
  color: "all",
  sortBy: "recent",
};

export default function Marketplace() {
  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [tenants, setTenants] = useState<MarketplaceTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedVehicle, setSelectedVehicle] = useState<MarketplaceVehicle | null>(null);

  useEffect(() => {
    async function load() {
      const { data: t } = await supabase
        .from("tenants")
        .select("id, name, slug, city, logo_url, address, phone")
        .eq("plan", "marketplace")
        .eq("status", "ativo");

      const tenantList = (t || []) as MarketplaceTenant[];
      setTenants(tenantList);

      if (tenantList.length === 0) {
        setLoading(false);
        return;
      }

      const tenantIds = tenantList.map((t) => t.id);
      const { data: v } = await supabase
        .from("vehicles")
        .select("id, brand, model, version, year, km, fuel, sale_price, photos, tenant_id, color, transmission")
        .eq("status", "Disponível")
        .in("tenant_id", tenantIds)
        .order("created_at", { ascending: false });

      setVehicles((v as MarketplaceVehicle[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const getTenant = (tenantId: string) => tenants.find((t) => t.id === tenantId);

  // Filter options
  const filterOptions = {
    brands: [...new Set(vehicles.map((v) => v.brand))].sort(),
    fuels: [...new Set(vehicles.map((v) => v.fuel).filter(Boolean) as string[])].sort(),
    cities: [...new Set(tenants.map((t) => t.city).filter(Boolean) as string[])].sort(),
    transmissions: [...new Set(vehicles.map((v) => v.transmission).filter(Boolean) as string[])].sort(),
    colors: [...new Set(vehicles.map((v) => v.color).filter(Boolean) as string[])].sort(),
  };

  // Apply filters
  const filtered = vehicles
    .filter((v) => {
      const matchSearch = `${v.brand} ${v.model} ${v.version || ""}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchBrand = filters.brand === "all" || v.brand === filters.brand;
      const matchFuel = filters.fuel === "all" || v.fuel === filters.fuel;
      const matchTransmission = filters.transmission === "all" || v.transmission === filters.transmission;
      const matchColor = filters.color === "all" || v.color === filters.color;
      const tenant = getTenant(v.tenant_id);
      const matchCity = filters.city === "all" || tenant?.city === filters.city;

      let matchPrice = true;
      if (filters.priceRange !== "all" && v.sale_price) {
        const p = Number(v.sale_price);
        if (filters.priceRange === "0-30") matchPrice = p <= 30000;
        else if (filters.priceRange === "30-50") matchPrice = p > 30000 && p <= 50000;
        else if (filters.priceRange === "50-80") matchPrice = p > 50000 && p <= 80000;
        else if (filters.priceRange === "80-120") matchPrice = p > 80000 && p <= 120000;
        else if (filters.priceRange === "120-200") matchPrice = p > 120000 && p <= 200000;
        else if (filters.priceRange === "200+") matchPrice = p > 200000;
      }

      let matchYear = true;
      if (filters.yearRange !== "all") {
        const y = v.year;
        if (filters.yearRange === "2024-2026") matchYear = y >= 2024;
        else if (filters.yearRange === "2020-2023") matchYear = y >= 2020 && y <= 2023;
        else if (filters.yearRange === "2015-2019") matchYear = y >= 2015 && y <= 2019;
        else if (filters.yearRange === "2010-2014") matchYear = y >= 2010 && y <= 2014;
        else if (filters.yearRange === "0-2009") matchYear = y <= 2009;
      }

      return (
        matchSearch &&
        matchBrand &&
        matchFuel &&
        matchCity &&
        matchPrice &&
        matchYear &&
        matchTransmission &&
        matchColor
      );
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price_asc":
          return (a.sale_price || 0) - (b.sale_price || 0);
        case "price_desc":
          return (b.sale_price || 0) - (a.sale_price || 0);
        case "km_asc":
          return (a.km || 0) - (b.km || 0);
        case "year_desc":
          return b.year - a.year;
        default:
          return 0; // already sorted by created_at desc
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 tracking-tight">
            Encontre o carro ideal
            <br />
            <span className="text-primary">na região carbonífera</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-8">
            Compare preços e encontre as melhores ofertas de{" "}
            <span className="text-foreground font-medium">{tenants.length}</span> revendas parceiras.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-lg leading-none">{vehicles.length}</p>
                <p className="text-xs text-muted-foreground">veículos</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-lg leading-none">{tenants.length}</p>
                <p className="text-xs text-muted-foreground">revendas</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-lg leading-none">100%</p>
                <p className="text-xs text-muted-foreground">verificados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MarketplaceFilters
          options={filterOptions}
          values={filters}
          onChange={setFilters}
          totalResults={filtered.length}
          totalVehicles={vehicles.length}
        />
      </div>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Carregando veículos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Car className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-lg font-heading font-semibold mb-1">Nenhum veículo encontrado</p>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros para ver mais resultados.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((v) => {
                const tenant = getTenant(v.tenant_id);
                return (
                  <MarketplaceVehicleCard
                    key={v.id}
                    vehicle={v}
                    tenant={tenant}
                    onClick={() => setSelectedVehicle(v)}
                  />
                );
              })}
            </div>

            <MarketplaceVehicleDialog
              vehicle={selectedVehicle}
              tenant={selectedVehicle ? getTenant(selectedVehicle.tenant_id) : undefined}
              open={!!selectedVehicle}
              onOpenChange={(open) => {
                if (!open) setSelectedVehicle(null);
              }}
            />
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Car className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-sm">Carbo Carros</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Carros na região Carbonífera · Powered by AutoGest
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
