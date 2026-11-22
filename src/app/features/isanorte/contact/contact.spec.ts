import { NgTemplateOutlet } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PublicSiteCompany } from '../../../data/models/public-content/public-site.model';
import {
  PublicPageContent,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { Alert } from '../../../shared/components/alert/alert';
import { LocationMap } from '../../../shared/components/location-map/location-map';
import { Card } from '../../../shared/components/card/card';
import { Contact } from './contact';
import { ContactForm } from './contact-form/contact-form';
import { PublicContactFacade } from './public-contact.facade';

class PublicContactFacadeStub {
  readonly content = signal<PublicPageContent | null>({
    pagina: PublicPageType.CONTACTO,
    eyebrow: 'CONTACTO API',
    titulo: 'Título API',
    introduccion: 'Introducción API',
    descripcion: 'Descripción API',
    imagenUrl: null,
    imagenAlt: null,
    imagenFondoUrl: null,
    tags: [],
  });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nombre = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly empresa = signal('');
  readonly mensaje = signal('');
  readonly nombreTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);
  readonly empresaTouched = signal(false);
  readonly ubicacion = signal('');
  readonly ubicacionTouched = signal(false);
  readonly ubicacionError = signal<string | undefined>(undefined);
  readonly consentimiento = signal(false);
  readonly consentimientoTouched = signal(false);
  readonly consentimientoError = signal<string | undefined>(undefined);
  readonly mensajeTouched = signal(false);
  readonly nombreError = signal<string | undefined>(undefined);
  readonly emailError = signal<string | undefined>(undefined);
  readonly telefonoError = signal<string | undefined>(undefined);
  readonly empresaError = signal<string | undefined>(undefined);
  readonly mensajeError = signal<string | undefined>(undefined);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);
  submitCalls = 0;

  load(): void {}
  submit(): void {
    this.submitCalls += 1;
  }
  dismissSubmitSuccess(): void {
    this.submitSuccess.set(false);
  }
}

class PublicSiteFacadeStub {
  readonly company = signal<PublicSiteCompany | null>({
    nombreComercial: 'ISANORTE API',
    direccion: 'Dirección API',
    ciudad: 'Ciudad API',
    telefono: '+51 999 111 222',
    telefonoSecundario: null,
    email: 'invalido',
    emailVentas: null,
    whatsapp: '+51 999 333 444',
    horarioAtencion: null,
    resumenNosotros: null,
  });
  readonly contactEmails = signal<readonly string[]>(['contacto@example.com']);
  readonly contactPhones = signal<readonly string[]>(['+51 999 111 222']);
  readonly address = signal<string | null>('Dirección API');
  readonly city = signal<string | null>('Ciudad API');
  readonly fullAddress = signal('Dirección API, Ciudad API');
  readonly mapEmbedUrl = signal<string | null>(
    'https://www.google.com/maps?q=Direcci%C3%B3n%20API&output=embed',
  );
  readonly mapUrl = signal<string | null>('https://www.google.com/maps?q=Direcci%C3%B3n%20API');
}

describe('Contact', () => {
  let facade: PublicContactFacadeStub;
  let site: PublicSiteFacadeStub;

  beforeEach(async () => {
    facade = new PublicContactFacadeStub();
    site = new PublicSiteFacadeStub();
    await TestBed.configureTestingModule({ imports: [Contact] })
      .overrideComponent(Contact, {
        set: {
          imports: [NgTemplateOutlet, Alert, Card, ContactForm, LocationMap],
          providers: [
            { provide: PublicContactFacade, useValue: facade },
            { provide: PublicSiteFacade, useValue: site },
          ],
        },
      })
      .compileComponents();
  });

  it('renders editorial and presentable company contact data without baseline values', () => {
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Título API');
    expect(element.textContent).toContain('Introducción API');
    expect(element.textContent).toContain('Descripción API');
    expect(element.querySelector('a[href="mailto:contacto@example.com"]')).toBeTruthy();
    expect(element.querySelector('a[href="tel:+51999111222"]')).toBeTruthy();
    expect(element.querySelector('a[href="https://wa.me/51999333444"]')).toBeTruthy();
    expect(element.textContent).toContain('Dirección API, Ciudad API');
    expect(element.textContent).not.toContain('+57 (312) 456-7890');
    expect(element.textContent).not.toContain('cotizaciones@isanorte.com');
  });

  it('hides absent corporate channels and preserves the public form', () => {
    site.company.set(null);
    site.contactEmails.set([]);
    site.contactPhones.set([]);
    site.address.set(null);
    site.city.set(null);
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-contact-channels]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-contact-form]')).toBeTruthy();
  });

  it('submits only through the facade and reflects success and error feedback', () => {
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(facade.submitCalls).toBe(1);

    expect(element.querySelector('button[type="submit"]')?.textContent).toContain('WHATSAPP');

    facade.submitSuccess.set(true);
    fixture.detectChanges();
    expect(element.textContent).toContain('Envía el mensaje desde allí');

    facade.submitSuccess.set(false);
    facade.submitError.set('Error API');
    fixture.detectChanges();
    expect(element.textContent).toContain('Error API');
  });

  it('shows neutral page loading and error while keeping form available after page error', () => {
    facade.loading.set(true);
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-contact-loading]')).toBeTruthy();

    facade.loading.set(false);
    facade.content.set(null);
    facade.error.set('Error editorial');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-contact-page-error]')?.textContent).toContain(
      'Error editorial',
    );
    expect(fixture.nativeElement.querySelector('[data-contact-form]')).toBeTruthy();
  });
});
