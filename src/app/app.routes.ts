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
import { PublicLayout } from './layouts/public-layout/public-layout';

const loadAdminPlaceholder = () =>
  import('./features/admin/module-placeholder/admin-module-placeholder').then(
    ({ AdminModulePlaceholder }) => AdminModulePlaceholder,
  );

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
        path: 'proyectos/:id',
        loadComponent: () =>
          import('./features/admin/projects/detail/admin-project-detail').then(
            ({ AdminProjectDetail }) => AdminProjectDetail,
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
        loadComponent: loadAdminPlaceholder,
        data: { title: 'Unidades de negocio' },
      },
      { path: 'empresa', loadComponent: loadAdminPlaceholder, data: { title: 'Empresa' } },
      { path: 'landing', loadComponent: loadAdminPlaceholder, data: { title: 'Landing' } },
      {
        path: 'configuracion',
        loadComponent: loadAdminPlaceholder,
        data: { title: 'Configuración' },
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
      { path: 'isadecor/catalogo', component: Catalog },
      { path: 'isadecor/cotizacion', component: Quote },
      { path: 'isadecor/productos/:slug', component: ProductDetail },
      { path: 'isadecor', component: IsadecorHome },
    ],
  },
];
