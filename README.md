# ISANORTE Frontend (Angular)

Este es el proyecto frontend para la plataforma de ISANORTE, desarrollado con **Angular 22** y estilizado con **Tailwind CSS**. Este documento detalla cómo configurar tu entorno de desarrollo, instalar las dependencias y arrancar el servidor local.

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu computadora:

1. **Node.js**: Versión 18 o superior (se recomienda la versión 20 LTS o superior).
2. **NPM**: Viene incluido por defecto al instalar Node.js.

Puedes verificar tus versiones instaladas ejecutando:
```bash
node -v
npm -v
```

---

## ⚙️ Instalación y Configuración Inicial

### 1. Instalar dependencias
Clona este repositorio o navega hasta la carpeta raíz del proyecto frontend (`ISANORTE-Frontend`). Abre una terminal y ejecuta el siguiente comando para descargar todos los paquetes necesarios de Angular y herramientas como Tailwind:

```bash
npm install
```

### 2. Variables de Entorno y Configuración de API
Este proyecto está configurado para consumir datos desde el backend (por defecto en `http://localhost:8080`).

Si observas el archivo `package.json`, notarás que el script de inicio (`npm start`) automáticamente incluye la variable `BACKEND_ORIGIN=http://localhost:8080`. **No es necesario modificar nada adicional** para conectarte a tu servidor Spring Boot en el entorno local, siempre y cuando este último esté corriendo en el puerto 8080.

Si tuvieras que cambiar la URL del backend en producción o en otro entorno, puedes sobrescribir esta variable o modificar el script correspondiente.

---

## 🚀 Ejecución en Desarrollo

Para arrancar el proyecto en modo desarrollo y previsualizarlo en tu navegador, asegúrate de que el Backend (`constructora-api`) ya esté ejecutándose y luego corre:

```bash
npm start
```

*Nota: Este comando utiliza `cross-env` para establecer de forma segura las variables de entorno en cualquier sistema operativo (Windows, Linux, o Mac).*

Una vez termine de compilar (verás un mensaje indicando el éxito), abre tu navegador web y visita:

👉 **[http://localhost:4200/](http://localhost:4200/)**

La aplicación detectará cualquier cambio que hagas en los archivos fuente (`.ts`, `.html`, `.css`) y recargará la pestaña del navegador automáticamente.

---

## 🏗️ Construcción para Producción

Cuando estés listo para desplegar tu aplicación frontend en un servidor público, compila el proyecto ejecutando:

```bash
npm run build
```

Esto generará los artefactos finales (optimizados y minificados) dentro de la carpeta `dist/ISANORTE-FRONTEND/`. Estos archivos están listos para subirse a cualquier servidor web.

Si también necesitas ejecutar el entorno Server-Side Rendering (SSR) incluido en Angular 22, puedes usar:

```bash
npm run serve:ssr:ISANORTE-FRONTEND
```

---

## 📁 Estructura Principal del Proyecto

- `src/app/core/`: Configuraciones críticas, interceptores HTTP, tokens y servicios globales.
- `src/app/data/`: Modelos (DTOs) y servicios de comunicación (APIs) con el backend.
- `src/app/features/`: Módulos y componentes principales de las páginas (Ej: administrador, paneles, vistas de usuario).
- `src/app/shared/`: Componentes reutilizables, UI genérica (botones, modales, subida de imágenes con drag & drop) y utilidades.
- `src/styles.css` / `index.css`: Archivos maestros de estilos globales con Tailwind CSS.
