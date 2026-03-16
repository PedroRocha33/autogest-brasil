import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface FilterOptions {
  brands: string[];
  fuels: string[];
  cities: string[];
  transmissions: string[];
  colors: string[];
}

interface FilterValues {
  search: string;
  brand: string;
  fuel: string;
  city: string;
  priceRange: string;
  yearRange: string;
  transmission: string;
  color: string;
  sortBy: string;
}

interface Props {
  options: FilterOptions;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  totalResults: number;
  totalVehicles: number;
}

export default function MarketplaceFilters({ options, values, onChange, totalResults, totalVehicles }: Props) {
  const [showMore, setShowMore] = useState(false);

  const update = (key: keyof FilterValues, val: string) => {
    onChange({ ...values, [key]: val });
  };

  const activeCount = Object.entries(values).filter(
    ([k, v]) => k !== 'search' && k !== 'sortBy' && v !== 'all'
  ).length;

  const clearAll = () => {
    onChange({
      search: '',
      brand: 'all',
      fuel: 'all',
      city: 'all',
      priceRange: 'all',
      yearRange: 'all',
      transmission: 'all',
      color: 'all',
      sortBy: 'recent',
    });
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-11 bg-card border-border"
            placeholder="Buscar por marca, modelo ou versão..."
            value={values.search}
            onChange={e => update('search', e.target.value)}
          />
        </div>
        <Button
          variant={showMore ? 'default' : 'outline'}
          size="default"
          className="h-11 gap-2"
          onClick={() => setShowMore(!showMore)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Primary filters row */}
      <div className="flex flex-wrap gap-2">
        <Select value={values.brand} onValueChange={v => update('brand', v)}>
          <SelectTrigger className="w-[150px] h-9 text-xs bg-card">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {options.brands.map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={values.priceRange} onValueChange={v => update('priceRange', v)}>
          <SelectTrigger className="w-[160px] h-9 text-xs bg-card">
            <SelectValue placeholder="Faixa de preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer preço</SelectItem>
            <SelectItem value="0-30">Até R$ 30.000</SelectItem>
            <SelectItem value="30-50">R$ 30.000 – 50.000</SelectItem>
            <SelectItem value="50-80">R$ 50.000 – 80.000</SelectItem>
            <SelectItem value="80-120">R$ 80.000 – 120.000</SelectItem>
            <SelectItem value="120-200">R$ 120.000 – 200.000</SelectItem>
            <SelectItem value="200+">Acima de R$ 200.000</SelectItem>
          </SelectContent>
        </Select>

        <Select value={values.yearRange} onValueChange={v => update('yearRange', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            <SelectItem value="2024-2026">2024 – 2026</SelectItem>
            <SelectItem value="2020-2023">2020 – 2023</SelectItem>
            <SelectItem value="2015-2019">2015 – 2019</SelectItem>
            <SelectItem value="2010-2014">2010 – 2014</SelectItem>
            <SelectItem value="0-2009">Até 2009</SelectItem>
          </SelectContent>
        </Select>

        <Select value={values.fuel} onValueChange={v => update('fuel', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
            <SelectValue placeholder="Combustível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {options.fuels.map(f => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {options.cities.length > 0 && (
          <Select value={values.city} onValueChange={v => update('city', v)}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {options.cities.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Extended filters */}
      {showMore && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
          {options.transmissions.length > 0 && (
            <Select value={values.transmission} onValueChange={v => update('transmission', v)}>
              <SelectTrigger className="w-[150px] h-9 text-xs bg-card">
                <SelectValue placeholder="Câmbio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os câmbios</SelectItem>
                {options.transmissions.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {options.colors.length > 0 && (
            <Select value={values.color} onValueChange={v => update('color', v)}>
              <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
                <SelectValue placeholder="Cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cores</SelectItem>
                {options.colors.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Results bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalResults}</span> veículos encontrados
          </p>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={clearAll}>
              <X className="h-3 w-3" /> Limpar filtros
            </Button>
          )}
        </div>
        <Select value={values.sortBy} onValueChange={v => update('sortBy', v)}>
          <SelectTrigger className="w-[160px] h-8 text-xs bg-card">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="price_asc">Menor preço</SelectItem>
            <SelectItem value="price_desc">Maior preço</SelectItem>
            <SelectItem value="km_asc">Menor km</SelectItem>
            <SelectItem value="year_desc">Mais novos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
