import { Routes } from '@angular/router';
import { Catalog } from './features/isadecor/catalog/catalog';
import { Home as IsadecorHome } from './features/isadecor/home/home';
import { ProductDetail } from './features/isadecor/product-detail/product-detail';
import { Quote } from './features/isadecor/quote/quote';
import { About } from './features/isanorte/about/about';
import { Contact } from './features/isanorte/contact/contact';
import { Home as IsanorteHome } from './features/isanorte/home/home';
import { Projects } from './features/isanorte/projects/projects';
import { Services } from './features/isanorte/services/services';
import { IsadecorLayout } from './layouts/isadecor-layout/isadecor-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(({ AdminLayout }) => AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard').then(
            ({ AdminDashboard }) => AdminDashboard,
          ),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories').then(
            ({ AdminCategories }) => AdminCategories,
          ),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/products/admin-products').then(
            ({ AdminProducts }) => AdminProducts,
          ),
      },
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./features/admin/quotes/admin-quotes').then(({ AdminQuotes }) => AdminQuotes),
      },
      {
        path: 'proyectos',
        loadComponent: () =>
          import('./features/admin/projects/admin-projects').then(
            ({ AdminProjects }) => AdminProjects,
          ),
      },

      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/admin/services/admin-services').then(
            ({ AdminServices }) => AdminServices,
          ),
      },
      {
        path: 'unidades-negocio',
        loadComponent: () =>
          import('./features/admin/business-units/admin-business-units').then(
            ({ AdminBusinessUnits }) => AdminBusinessUnits,
          ),
      },
      {
        path: 'empresa',
        loadComponent: () =>
          import('./features/admin/company/admin-company').then(({ AdminCompany }) => AdminCompany),
      },
      {
        path: 'landing',
        loadComponent: () =>
          import('./features/admin/landing/admin-landing').then(({ AdminLanding }) => AdminLanding),
        data: { title: 'Landing' },
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/admin/site-config/admin-site-config').then(
            ({ AdminSiteConfig }) => AdminSiteConfig,
          ),
      },
      {
        path: 'contenido',
        loadComponent: () =>
          import('./features/admin/content/admin-content').then(({ AdminContent }) => AdminContent),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./features/admin/contact/admin-contact').then(({ AdminContact }) => AdminContact),
      },
    ],
  },
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: IsanorteHome },
      { path: 'nosotros', component: About },
      { path: 'servicios', component: Services },
      { path: 'proyectos', component: Projects },
      { path: 'contacto', component: Contact },
    ],
  },
  {
    path: 'isadecor',
    component: IsadecorLayout,
    children: [
      { path: '', component: IsadecorHome },
      { path: 'catalogo', component: Catalog },
      { path: 'cotizacion', component: Quote },
      { path: 'productos/:slug', component: ProductDetail },
    ],
  },
];
