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

export const routes: Routes = [
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
