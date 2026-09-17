import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

export interface ProjectsHeaderData {
  eyebrow: string;
  title: string;
}

export interface ProjectCategory {
  id: string;
  label: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  imageAlt: string;
  categoryId: string;
  order: number;
  published: boolean;
}

export interface ProjectsEmptyStateData {
  title: string;
  description: string;
}

@Component({
  imports: [NgClass, NgTemplateOutlet, Card, EmptyState],
  selector: 'app-isanorte-projects',
  styleUrl: './projects.css',
  templateUrl: './projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  readonly header: ProjectsHeaderData = {
    eyebrow: 'NUESTRAS REFERENCIAS // OBRAS INSIGNIA',
    title: 'Galería Editorial de Proyectos',
  };

  readonly categories: ProjectCategory[] = [
    { id: 'all', label: 'Todas' },
    { id: 'construccion', label: 'Construcción Civil' },
    { id: 'acabados', label: 'Acabados Premium' },
    { id: 'interiores', label: 'Diseño de Interiores' },
    { id: 'corporativo', label: 'Corporativo' },
  ];

  readonly projects: ProjectItem[] = [
    {
      id: 'villa-lomas-alta',
      title: 'Villa Lomas Alta',
      description: 'Estructura expuesta de cipromio y persianas de control.',
      location: 'Bogotá, CO',
      imageUrl: '/images/proyectos-villa-lomas-alta.jpg',
      imageAlt: 'Villa residencial de estructura expuesta en Lomas Altas',
      categoryId: 'construccion',
      order: 1,
      published: true,
    },
    {
      id: 'penthouse-abisal',
      title: 'Penthouse Abisal',
      description: 'Interiorismo residencial de lujo.',
      location: 'Medellín, CO',
      imageUrl: '/images/proyectos-penthouse-abisal.jpg',
      imageAlt: 'Interior de penthouse de lujo con acabados premium',
      categoryId: 'interiores',
      order: 2,
      published: true,
    },
    {
      id: 'oficinas-nexus',
      title: 'Oficinas Nexus',
      description: 'Torre corporativa',
      location: '',
      imageUrl: '/images/proyectos-oficinas-nexus.jpg',
      imageAlt: 'Torre corporativa de oficinas Nexus',
      categoryId: 'corporativo',
      order: 3,
      published: true,
    },
    {
      id: 'clinica-sanitas-norte',
      title: 'Clínica Sanitas Norte',
      description: 'Infraestructura de salud',
      location: '',
      imageUrl: '/images/proyectos-clinica-sanitas-norte.jpg',
      imageAlt: 'Infraestructura hospitalaria de la Clínica Sanitas Norte',
      categoryId: 'construccion',
      order: 4,
      published: true,
    },
    {
      id: 'showroom-isadecor',
      title: 'Showroom ISADECOR',
      description: 'Diseño de interiores',
      location: '',
      imageUrl: '/images/proyectos-showroom-isadecor.jpg',
      imageAlt: 'Showroom de diseño de interiores de ISADECOR',
      categoryId: 'interiores',
      order: 5,
      published: true,
    },
  ];

  readonly emptyState: ProjectsEmptyStateData = {
    title: 'Aún no hay proyectos en esta categoría',
    description: 'Estamos actualizando nuestro portafolio. Muy pronto publicaremos nuevas obras.',
  };

  readonly activeCategory = signal<string>('all');

  readonly filteredProjects = computed(() => {
    const category = this.activeCategory();
    return this.projects
      .filter((project) => project.published)
      .filter((project) => category === 'all' || project.categoryId === category)
      .slice()
      .sort((a, b) => a.order - b.order);
  });

  readonly featuredProjects = computed(() => this.filteredProjects().slice(0, 2));
  readonly secondaryProjects = computed(() => this.filteredProjects().slice(2));

  protected selectCategory(id: string): void {
    this.activeCategory.set(id);
  }
}
