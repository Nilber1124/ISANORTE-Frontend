import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { InputField } from '../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../shared/components/textarea-field/textarea-field';
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
  imports: [NgTemplateOutlet, Alert, Button, Card, InputField, TextareaField],
  selector: 'app-isanorte-contact',
  providers: [PublicContactFacade],
  styleUrl: './contact.css',
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly facade = inject(PublicContactFacade);
  readonly site = inject(PublicSiteFacade);
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
      channels.push({ id: `email-${email}`, icon: 'mail', label: 'Correo', value: email, href: `mailto:${email}` });
    }
    for (const phone of this.site.contactPhones()) {
      const href = this.phoneHref(phone);
      if (href !== null) channels.push({ id: `phone-${phone}`, icon: 'phone', label: 'Teléfono', value: phone, href });
    }
    const address = [this.site.address(), this.site.city()].filter((value): value is string => value !== null).join(', ');
    if (address) channels.push({ id: 'office', icon: 'pin', label: 'Oficina', value: address, href: null });
    return channels;
  });

  constructor() {
    this.facade.load();
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.facade.submit();
  }

  private phoneHref(value: string): string | null {
    const digits = value.replace(/\D/g, '');
    return digits ? `tel:${value.trim().startsWith('+') ? '+' : ''}${digits}` : null;
  }

  private whatsappHref(value: string | null): string | null {
    const digits = value?.replace(/\D/g, '') ?? '';
    return /^[0-9]{7,15}$/.test(digits) ? `https://wa.me/${digits}` : null;
  }
}
