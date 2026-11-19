import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminHomeReviews, AdminReview } from './admin-home-reviews';

const review: AdminReview = {
  id: 'r1',
  nombreCliente: 'Carla',
  calificacion: 4,
  comentario: 'Quedó parejo',
  compraVerificada: true,
  productoNombre: 'Panel WPC',
  fechaCreacion: null,
  mostrarEnHome: false,
  ordenHome: 0,
};

describe('AdminHomeReviews', () => {
  let http: HttpTestingController;

  function create() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AdminHomeReviews);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('lists the reviews with their product', () => {
    const fixture = create();
    http.expectOne('/api/resenas').flush([review]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Carla');
    expect(text).toContain('Panel WPC');
  });

  it('marks a review for the Home and reloads the sorted list', () => {
    const fixture = create();
    http.expectOne('/api/resenas').flush([review]);

    fixture.componentInstance.save(review, { mostrarEnHome: true });

    const patch = http.expectOne('/api/resenas/r1/home');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ mostrarEnHome: true, ordenHome: 0 });
    patch.flush({ ...review, mostrarEnHome: true });
    http.expectOne('/api/resenas').flush([{ ...review, mostrarEnHome: true }]);
  });

  it('never sends a negative or fractional order', () => {
    const fixture = create();
    http.expectOne('/api/resenas').flush([{ ...review, mostrarEnHome: true }]);

    fixture.componentInstance.save({ ...review, mostrarEnHome: true }, { ordenHome: -3.7 });

    expect(http.expectOne('/api/resenas/r1/home').request.body.ordenHome).toBe(0);
  });

  it('shows an error with retry when loading fails', () => {
    const fixture = create();
    http.expectOne('/api/resenas').flush('x', { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No pudimos cargar');
  });
});
