import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { Alert } from '../../../shared/components/alert/alert';
import { LocationMap } from '../../../shared/components/location-map/location-map';
import { Card } from '../../../shared/components/card/card';
import { ContactForm } from './contact-form/contact-form';
import { PublicContactFacade } from './public-contact.facade';

type ContactChannelIcon = 'chat' | 'mail' | 'phone' | 'pin';

interface ContactChannel {
  id: string;
  icon: ContactChannelIcon;
  label: string;
  value: string;
  href: string | null;
}

@Component({
  imports: [NgTemplateOutlet, Alert, Card, ContactForm, LocationMap],
  selector: 'app-isanorte-contact',
  providers: [PublicContactFacade],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly facade = inject(PublicContactFacade);
  readonly site = inject(PublicSiteFacade);
  /** Dirección que se presenta junto al mapa; vacía si la empresa no la tiene cargada. */
  readonly direccion = computed(() => this.site.fullAddress());
  readonly mapEmbedUrl = computed(() => this.site.mapEmbedUrl() ?? '');
  readonly mapUrl = computed(() => this.site.mapUrl() ?? '');
  readonly channels = computed<readonly ContactChannel[]>(() => {
    const channels: ContactChannel[] = [];
    const whatsapp = this.whatsappHref(this.site.company()?.whatsapp ?? null);
    if (whatsapp !== null) {
      channels.push({
        id: 'whatsapp',
        icon: 'chat',
        label: 'WhatsApp',
        value: this.site.company()?.whatsapp?.trim() ?? '',
        href: whatsapp,
      });
    }
    for (const email of this.site.contactEmails()) {
      channels.push({
        id: `email-${email}`,
        icon: 'mail',
        label: 'Correo',
        value: email,
        href: `mailto:${email}`,
      });
    }
    for (const phone of this.site.contactPhones()) {
      const href = this.phoneHref(phone);
      if (href !== null)
        channels.push({
          id: `phone-${phone}`,
          icon: 'phone',
          label: 'Teléfono',
          value: phone,
          href,
        });
    }
    const address = [this.site.address(), this.site.city()]
      .filter((value): value is string => value !== null)
      .join(', ');
    if (address)
      channels.push({ id: 'office', icon: 'pin', label: 'Oficina', value: address, href: null });
    return channels;
  });

  constructor() {
    this.facade.load();
  }

  private phoneHref(value: string): string | null {
    const digits = value.replace(/\D/g, '');
    if (!digits) return null;
    const prefix = value.trim().startsWith('+') ? '+' : '';
    return `tel:${prefix}${digits}`;
  }

  private whatsappHref(value: string | null): string | null {
    const digits = value?.replace(/\D/g, '') ?? '';
    return /^\d{7,15}$/.test(digits) ? `https://wa.me/${digits}` : null;
  }
}
