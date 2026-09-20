import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SocialNetworkResponse } from '../../../data/models/company/company-response.model';
import { PublicLayoutFacade, PublicLayoutResourceState } from '../public-layout.facade';

export interface FooterLink {
  label: string;
  url: string;
}

interface FooterSocial {
  id: string;
  name: string;
  iconText: string;
  url: string | null;
  external: boolean;
}

const PRIMARY_LINKS: readonly FooterLink[] = [
  { label: 'Inicio', url: '/' },
  { label: 'Nosotros', url: '/nosotros' },
  { label: 'Proyectos', url: '/proyectos' },
  { label: 'Contacto', url: '/contacto' },
];

const SAFE_SOCIAL_ICONS: Readonly<Record<string, string>> = {
  facebook: 'FB',
  instagram: 'IG',
  linkedin: 'IN',
  tiktok: 'TT',
  twitter: 'X',
  x: 'X',
  youtube: 'YT',
};

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly facade = inject(PublicLayoutFacade);
  readonly failedLogoUrl = signal<string | null>(null);
  readonly currentYear = new Date().getFullYear();

  readonly companyName = computed(() => {
    const companyName = this.facade.company()?.nombreComercial.trim();
    if (companyName) return companyName;

    const siteTitle = this.facade.siteConfig()?.tituloSitio?.trim();
    if (siteTitle) return siteTitle;

    return this.allowsBrandFallback() ? 'ISANORTE' : null;
  });

  readonly companyDescription = computed(() => {
    const company = this.facade.company();
    if (company) return company.resumenNosotros?.trim() || null;

    return this.allowsCompanyFallback()
      ? 'Transformamos espacios elevando el nivel de infraestructura, diseño, confort y estética, superando tus expectativas.'
      : null;
  });

  readonly logoUrl = computed(() => {
    const siteConfig = this.facade.siteConfig();
    const whiteLogoUrl = this.safeImageUrl(siteConfig?.logoBlancoUrl);
    const regularLogoUrl = this.safeImageUrl(siteConfig?.logoUrl);

    if (whiteLogoUrl && whiteLogoUrl !== this.failedLogoUrl()) return whiteLogoUrl;
    if (regularLogoUrl && regularLogoUrl !== this.failedLogoUrl()) return regularLogoUrl;
    return null;
  });

  readonly isadecorUnit = computed(
    () =>
      this.facade.businessUnits().find((unit) => unit.slug.trim().toLowerCase() === 'isadecor') ??
      null,
  );

  readonly navigation = computed<readonly FooterLink[]>(() => {
    if (this.isadecorUnit() === null && !this.usesFallback(this.facade.businessUnitsState())) {
      return PRIMARY_LINKS;
    }

    return [
      ...PRIMARY_LINKS.slice(0, 2),
      { label: this.isadecorUnit()?.nombre.trim() || 'Catálogo', url: '/isadecor' },
      ...PRIMARY_LINKS.slice(2),
    ];
  });

  readonly serviceLinks: readonly FooterLink[] = [
    { label: 'Todos los servicios', url: '/servicios' },
  ];

  readonly email = computed(() => this.companyField('email', 'hola@isanorte.com'));
  readonly phone = computed(() => this.companyField('telefono', '+593 (0) 999 999 999'));
  readonly whatsapp = computed(() => this.companyField('whatsapp', null));
  readonly address = computed(() => {
    const company = this.facade.company();
    if (company) {
      return (
        [company.direccion?.trim(), company.ciudad?.trim()]
          .filter((value): value is string => Boolean(value))
          .join(', ') || null
      );
    }

    return this.allowsCompanyFallback() ? 'Quito, Ecuador' : null;
  });

  readonly emailHref = computed(() => this.contactHref('mailto', this.email()));
  readonly phoneHref = computed(() => this.contactHref('tel', this.phone()));
  readonly whatsappHref = computed(() => this.safeWhatsappUrl(this.whatsapp()));

  readonly socials = computed<readonly FooterSocial[]>(() => {
    const company = this.facade.company();
    if (!company) {
      return this.allowsCompanyFallback()
        ? [
            this.mapSocial({
              id: 'fallback-instagram',
              nombre: 'Instagram',
              url: '#',
              icono: 'instagram',
              orden: 0,
              activo: true,
            }),
            this.mapSocial({
              id: 'fallback-linkedin',
              nombre: 'LinkedIn',
              url: '#',
              icono: 'linkedin',
              orden: 1,
              activo: true,
            }),
            this.mapSocial({
              id: 'fallback-facebook',
              nombre: 'Facebook',
              url: '#',
              icono: 'facebook',
              orden: 2,
              activo: true,
            }),
          ]
        : [];
    }

    return [...(company.redesSociales ?? [])]
      .filter((social) => social.activo === true)
      .sort(
        (first, second) =>
          (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER),
      )
      .map((social) => this.mapSocial(social));
  });

  readonly copyright = computed(() => {
    const configuredText = this.facade.siteConfig()?.textoPiePagina;
    if (configuredText?.trim()) return configuredText;

    const name = this.companyName();
    return `© ${this.currentYear}${name ? ` ${name}` : ''}.`;
  });

  readonly hasContact = computed(() =>
    Boolean(this.email() || this.phone() || this.whatsapp() || this.address()),
  );

  handleLogoError(): void {
    const logoUrl = this.logoUrl();
    if (logoUrl) this.failedLogoUrl.set(logoUrl);
  }

  private companyField(
    field: 'email' | 'telefono' | 'whatsapp',
    fallback: string | null,
  ): string | null {
    const company = this.facade.company();
    if (company) return company[field]?.trim() || null;
    return this.allowsCompanyFallback() ? fallback : null;
  }

  private mapSocial(social: SocialNetworkResponse): FooterSocial {
    const iconKey = (social.icono?.trim() || social.nombre.trim()).toLowerCase();
    const knownIcon = Object.entries(SAFE_SOCIAL_ICONS).find(([key]) => iconKey.includes(key));
    const url = this.safeLink(social.url);

    return {
      id: social.id,
      name: social.nombre,
      iconText: knownIcon?.[1] ?? social.nombre.trim().slice(0, 2).toUpperCase(),
      url,
      external: url?.startsWith('http://') === true || url?.startsWith('https://') === true,
    };
  }

  private contactHref(scheme: 'mailto' | 'tel', value: string | null): string | null {
    if (!value || /[\u0000-\u001f\u007f]/.test(value)) return null;
    return `${scheme}:${value}`;
  }

  private safeWhatsappUrl(value: string | null): string | null {
    const whatsapp = value?.trim();
    if (!whatsapp || /[\u0000-\u001f\u007f]/.test(whatsapp)) return null;

    try {
      const url = new URL(whatsapp);
      const hostname = url.hostname.toLowerCase();
      if (
        url.protocol === 'https:' &&
        (hostname === 'wa.me' || hostname === 'whatsapp.com' || hostname.endsWith('.whatsapp.com'))
      ) {
        return whatsapp;
      }
    } catch {
      // A formatted phone number is handled below without inventing a country code.
    }

    const digits = whatsapp.replace(/[\s()+.\-]/g, '');
    return /^\d+$/.test(digits) ? `https://wa.me/${digits}` : null;
  }

  private safeLink(value: string): string | null {
    const link = value.trim();
    if (!link) return null;
    if (link.startsWith('/') || link.startsWith('#')) return link;

    try {
      const url = new URL(link);
      return url.protocol === 'http:' || url.protocol === 'https:' ? link : null;
    } catch {
      return null;
    }
  }

  private safeImageUrl(value: string | null | undefined): string | null {
    const imageUrl = value?.trim();
    if (!imageUrl) return null;
    if (imageUrl.startsWith('/')) return imageUrl;

    try {
      const url = new URL(imageUrl);
      return url.protocol === 'http:' || url.protocol === 'https:' ? imageUrl : null;
    } catch {
      return null;
    }
  }

  private allowsCompanyFallback(): boolean {
    return this.facade.hasAmbiguousCompany() || this.usesFallback(this.facade.companyState());
  }

  private allowsBrandFallback(): boolean {
    return (
      this.allowsCompanyFallback() ||
      this.facade.hasAmbiguousSiteConfig() ||
      this.usesFallback(this.facade.siteConfigState())
    );
  }

  private usesFallback(state: PublicLayoutResourceState): boolean {
    return state === 'error' || state === 'ssr-blocked';
  }
}
