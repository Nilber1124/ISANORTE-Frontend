import { Routes } from '@angular/router';
import { Home as IsanorteHome } from './features/isanorte/home/home';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { authGuard } from './core/auth/auth.guard';
import { clienteGuard } from './core/auth/cliente.guard';

export const routes: Routes = [
  {
    path: 'acceso-interno',
    loadComponent: () =>
      import('./features/auth/internal-access/internal-access').then(
        ({ InternalAccess }) => InternalAccess,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
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
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/orders/admin-orders').then(({ AdminOrders }) => AdminOrders),
      },
      {
        path: 'isadecor-landing',
        loadComponent: () =>
          import('./features/admin/announcements/admin-announcements').then(
            ({ AdminAnnouncements }) => AdminAnnouncements,
          ),
        data: { title: 'Accesos Rápidos ISADECOR' },
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
      {
        path: 'anuncios',
        loadComponent: () =>
          import('./features/admin/announcements/admin-announcements').then(
            ({ AdminAnnouncements }) => AdminAnnouncements,
          ),
        data: { title: 'Anuncios' },
      },
    ],
  },
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: IsanorteHome },
      {
        path: 'nosotros',
        loadComponent: () => import('./features/isanorte/about/about').then(({ About }) => About),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/isanorte/services/services').then(({ Services }) => Services),
      },
      {
        path: 'proyectos',
        loadComponent: () =>
          import('./features/isanorte/projects/projects').then(({ Projects }) => Projects),
      },
      {
        path: 'proyectos/:slug',
        loadComponent: () =>
          import('./features/isanorte/projects/project-detail/project-detail').then(
            ({ ProjectDetail }) => ProjectDetail,
          ),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./features/isanorte/contact/contact').then(({ Contact }) => Contact),
      },
    ],
  },
  {
    path: 'isadecor',
    loadComponent: () =>
      import('./layouts/isadecor-layout/isadecor-layout').then(
        ({ IsadecorLayout }) => IsadecorLayout,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/isadecor/home/home').then(({ Home }) => Home),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/isadecor/catalog/catalog').then(({ Catalog }) => Catalog),
      },
      {
        path: 'catalogos',
        loadComponent: () =>
          import('./features/isadecor/catalogos/catalogos').then(({ Catalogos }) => Catalogos),
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/isadecor/cart/cart').then(({ Cart }) => Cart),
      },
      {
        path: 'cotizacion',
        loadComponent: () => import('./features/isadecor/quote/quote').then(({ Quote }) => Quote),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/isadecor/checkout/checkout').then(({ Checkout }) => Checkout),
        canActivate: [clienteGuard],
      },
      {
        path: 'ingresar',
        loadComponent: () =>
          import('./features/isadecor/cuenta/ingresar/ingresar').then(
            ({ IsadecorIngresar }) => IsadecorIngresar,
          ),
      },
      {
        path: 'mi-cuenta',
        loadComponent: () =>
          import('./features/isadecor/cuenta/mi-cuenta/mi-cuenta').then(
            ({ MiCuenta }) => MiCuenta,
          ),
        canActivate: [clienteGuard],
      },
      {
        path: 'productos/:slug',
        loadComponent: () =>
          import('./features/isadecor/product-detail/product-detail').then(
            ({ ProductDetail }) => ProductDetail,
          ),
      },
    ],
  },
];
