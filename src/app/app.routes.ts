import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout';
import { Landing } from './isanorte/pages/landing/landing';
import { Nosotros } from './isanorte/pages/nosotros/nosotros';
import { Servicios } from './isanorte/pages/servicios/servicios';
import { Proyectos } from './isanorte/pages/proyectos/proyectos';
import { Contacto } from './isanorte/pages/contacto/contacto';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', component: Landing },
            { path: 'nosotros', component: Nosotros },
            { path: 'servicios', component: Servicios },
            { path: 'proyectos', component: Proyectos },
            { path: 'contacto', component: Contacto },
        ],
    },
];