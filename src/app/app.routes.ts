import { Routes } from '@angular/router';
import { Cart } from './features/isadecor/cart/cart';
import { Catalog } from './features/isadecor/catalog/catalog';
import { Catalogos } from './features/isadecor/catalogos/catalogos';
import { Checkout } from './features/isadecor/checkout/checkout';
import { Home as IsadecorHome } from './features/isadecor/home/home';
import { ProductDetail } from './features/isadecor/product-detail/product-detail';
import { Quote } from './features/isadecor/quote/quote';
import { About } from './features/isanorte/about/about';
import { Contact } from './features/isanorte/contact/contact';
import { Home as IsanorteHome } from './features/isanorte/home/home';
import { Projects } from './features/isanorte/projects/projects';
import { ProjectDetail } from './features/isanorte/projects/project-detail/project-detail';
import { Services } from './features/isanorte/services/services';
import { Community } from './features/isadecor/community/community';
import { IsadecorLayout } from './layouts/isadecor-layout/isadecor-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { authGuard } from './core/auth/auth.guard';
import { clienteGuard } from './core/auth/cliente.guard';
import { IsadecorIngresar } from './features/isadecor/cuenta/ingresar/ingresar';
import { MiCuenta } from './features/isadecor/cuenta/mi-cuenta/mi-cuenta';

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
        path: 'ventas',
        loadComponent: () => import('./features/admin/sales/admin-sales').then(({ AdminSales }) => AdminSales),
      },
      // Rutas antiguas: se conservan para no romper enlaces guardados.
      { path: 'isadecor-landing', redirectTo: '/admin', pathMatch: 'full' },
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
      // Ruta antigua («Páginas y SEO»): el SEO ahora es automático y los textos se editan en Landing.
      { path: 'contenido', redirectTo: 'landing', pathMatch: 'full' },
      { path: 'anuncios', redirectTo: '/admin', pathMatch: 'full' },
      {
        path: 'home-isadecor',
        loadComponent: () =>
          import('./features/admin/isadecor-home/admin-isadecor-home').then(
            ({ AdminIsadecorHome }) => AdminIsadecorHome,
          ),
      },
      // Rutas antiguas (una por pantalla): abren la sección correspondiente de la pantalla única.
      { path: 'home-isadecor/resenas', redirectTo: '/admin/home-isadecor?seccion=resenas', pathMatch: 'full' },
      { path: 'home-isadecor/publicaciones', redirectTo: '/admin/home-isadecor?seccion=publicaciones', pathMatch: 'full' },
      { path: 'home-isadecor/hero', redirectTo: '/admin/home-isadecor?seccion=hero', pathMatch: 'full' },
      { path: 'home-isadecor/cinta', redirectTo: '/admin/home-isadecor?seccion=cinta', pathMatch: 'full' },
      { path: 'home-isadecor/promociones', redirectTo: '/admin/home-isadecor?seccion=promociones', pathMatch: 'full' },
      { path: 'home-isadecor/campana', redirectTo: '/admin/home-isadecor?seccion=campana', pathMatch: 'full' },
      { path: 'home-isadecor/servicio', redirectTo: '/admin/home-isadecor?seccion=servicio', pathMatch: 'full' },
      { path: 'home-isadecor/servicio-puntos', redirectTo: '/admin/home-isadecor?seccion=servicio', pathMatch: 'full' },
      { path: 'home-isadecor/secciones', redirectTo: '/admin/home-isadecor?seccion=secciones', pathMatch: 'full' },
      {
        path: 'sitio',
        loadComponent: () =>
          import('./features/admin/web-content/admin-web-content').then(({ AdminWebContent }) => AdminWebContent),
      },
      {
        path: 'sitio/faqs',
        loadComponent: () =>
          import('./features/admin/site-content/admin-site-content').then(
            ({ AdminSiteContent }) => AdminSiteContent,
          ),
        data: { entity: 'faqs', title: 'Preguntas frecuentes' },
      },
      {
        path: 'sitio/equipo',
        loadComponent: () =>
          import('./features/admin/site-content/admin-site-content').then(
            ({ AdminSiteContent }) => AdminSiteContent,
          ),
        data: { entity: 'equipo', title: 'Equipo' },
      },
      {
        path: 'sitio/credenciales',
        loadComponent: () =>
          import('./features/admin/site-content/admin-site-content').then(
            ({ AdminSiteContent }) => AdminSiteContent,
          ),
        data: { entity: 'credenciales', title: 'Credenciales' },
      },
      {
        path: 'sitio/testimonios',
        loadComponent: () =>
          import('./features/admin/site-content/admin-site-content').then(
            ({ AdminSiteContent }) => AdminSiteContent,
          ),
        data: { entity: 'testimonios', title: 'Testimonios' },
      },
      {
        path: 'sitio/garantias',
        loadComponent: () =>
          import('./features/admin/site-content/admin-site-content').then(
            ({ AdminSiteContent }) => AdminSiteContent,
          ),
        data: { entity: 'garantias', title: 'Garantías' },
      },
      {
        path: 'sitio/pasos-proceso',
        loadComponent: () =>
          import('./features/admin/site-content/admin-site-content').then(
            ({ AdminSiteContent }) => AdminSiteContent,
          ),
        data: { entity: 'pasos-proceso', title: 'Pasos del proceso' },
      },
      {
        path: 'sitio/politicas',
        loadComponent: () =>
          import('./features/admin/site-content/admin-site-content').then(
            ({ AdminSiteContent }) => AdminSiteContent,
          ),
        data: { entity: 'politicas', title: 'Políticas' },
      },
      // Las fotos de la obra ahora se gestionan en la ficha de cada proyecto.
      { path: 'sitio/proyecto-galeria', redirectTo: '/admin/proyectos', pathMatch: 'full' },
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
      { path: 'proyectos/:slug', component: ProjectDetail },
      { path: 'contacto', component: Contact },
      {
        path: 'politicas/:slug',
        loadComponent: () =>
          import('./features/isanorte/policy/policy').then(({ Policy }) => Policy),
      },
    ],
  },
  {
    path: 'isadecor',
    component: IsadecorLayout,
    children: [
      { path: '', component: IsadecorHome },
      { path: 'productos', component: Catalog },
      { path: 'catalogos', component: Catalogos },
      { path: 'comunidad', component: Community },
      { path: 'carrito', component: Cart },
      { path: 'cotizacion', component: Quote },
      { path: 'checkout', component: Checkout, canActivate: [clienteGuard] },
      { path: 'ingresar', component: IsadecorIngresar },
      { path: 'mi-cuenta', component: MiCuenta, canActivate: [clienteGuard] },
      { path: 'productos/:slug', component: ProductDetail },
    ],
  },
];
