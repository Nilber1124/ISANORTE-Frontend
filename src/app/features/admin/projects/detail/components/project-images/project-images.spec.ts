import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectImageType } from '../../../../../../data/models/project/project-image-type.enum';
import { ProjectImageResponse } from '../../../../../../data/models/project/project-response.model';
import { ProjectImageSubmission, ProjectImages } from './project-images';

const images: ProjectImageResponse[] = [
  {
    id: 'image-1',
    url: 'https://example.com/one.jpg',
    titulo: 'Vista general',
    descripcion: 'Imagen temporal',
    tipo: ProjectImageType.GENERAL,
    esPrincipal: true,
    orden: 1,
  },
  {
    id: 'image-2',
    url: 'https://example.com/two.jpg',
    titulo: 'Antes',
    descripcion: null,
    tipo: ProjectImageType.ANTES,
    esPrincipal: true,
    orden: 2,
  },
];

describe('ProjectImages', () => {
  let fixture: ComponentFixture<ProjectImages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProjectImages] }).compileComponents();
    fixture = TestBed.createComponent(ProjectImages);
    fixture.componentRef.setInput('images', images);
    fixture.detectChanges();
  });

  it('renders image types and allows multiple principal badges', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('General');
    expect(text).toContain('Antes');
    expect(text.match(/Principal/g)).toHaveLength(2);
  });

  it('shows image EmptyState with an add action', () => {
    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay imágenes registradas',
    );
  });

  it('submits required URL, enum, principal and order fields', () => {
    let submission: ProjectImageSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Agregar imagen'))
      ?.click();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const url = element.querySelector('#project-image-url') as HTMLInputElement;
    url.value = 'https://example.com/new.jpg';
    url.dispatchEvent(new Event('input'));
    const type = element.querySelector('#project-image-type') as HTMLSelectElement;
    type.value = ProjectImageType.DESPUES;
    type.dispatchEvent(new Event('change'));
    const order = element.querySelector('#project-image-order') as HTMLInputElement;
    order.value = '3';
    order.dispatchEvent(new Event('input'));
    const principal = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
    principal.click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Guardar imagen'))
      ?.click();

    expect(submission).toEqual({
      imageId: null,
      request: {
        url: 'https://example.com/new.jpg',
        titulo: null,
        descripcion: null,
        tipo: ProjectImageType.DESPUES,
        esPrincipal: true,
        orden: 3,
      },
    });
  });

  it('uses a modal confirmation before emitting delete', () => {
    const deleted: string[] = [];
    fixture.componentInstance.deleted.subscribe((id) => deleted.push(id));
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Eliminar'))
      ?.click();
    fixture.detectChanges();
    expect(deleted).toEqual([]);
    const confirm = Array.from(element.querySelectorAll('button'))
      .filter((button) => button.textContent?.includes('Eliminar imagen'))
      .at(-1);
    confirm?.click();
    expect(deleted).toEqual([images[0].id]);
  });

  it('shows a visual fallback without blocking the form', () => {
    const image = (fixture.nativeElement as HTMLElement).querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Vista previa no disponible',
    );
  });
});
