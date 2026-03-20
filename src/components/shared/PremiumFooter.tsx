import { Link } from "react-router-dom";
import { Car, Mail, MapPin, Phone } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface PremiumFooterProps {
  brand: string;
  logoUrl?: string | null;
  logoIcon?: React.ReactNode;
  description?: string;
  columns?: { title: string; links: FooterLink[] }[];
  contactInfo?: {
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    email?: string | null;
  };
  bottomText?: string;
}

export default function PremiumFooter({
  brand,
  logoUrl,
  logoIcon,
  description,
  columns = [],
  contactInfo,
  bottomText,
}: PremiumFooterProps) {
  const year = new Date().getFullYear();
  const hasContact = contactInfo?.phone || contactInfo?.address || contactInfo?.city || contactInfo?.email;

  return (
    <footer className="border-t border-border bg-card/60">
      <div className="max-w-7xl mx-auto px-5">
        {/* Main grid */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={brand} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-foreground flex items-center justify-center">
                  {logoIcon || <Car className="h-4.5 w-4.5 text-background" strokeWidth={1.5} />}
                </div>
              )}
              <span className="font-heading font-bold text-sm tracking-tight">{brand}</span>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{description}</p>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          {hasContact && (
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Contato</h4>
              <ul className="space-y-2.5">
                {(contactInfo?.address || contactInfo?.city) && (
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" strokeWidth={1.5} />
                    <span>{contactInfo.address || contactInfo.city}{contactInfo.address && contactInfo.city ? ` · ${contactInfo.city}` : ""}</span>
                  </li>
                )}
                {contactInfo?.phone && (
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" strokeWidth={1.5} />
                    <span>{contactInfo.phone}</span>
                  </li>
                )}
                {contactInfo?.email && (
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" strokeWidth={1.5} />
                    <span>{contactInfo.email}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} {brand}. {bottomText || "Todos os direitos reservados."}
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            Powered by <span className="font-medium text-muted-foreground">AutoGest</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
