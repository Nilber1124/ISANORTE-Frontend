import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SERVER_API_BASE_URL_PROVIDER } from './core/config/api-server.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes)), SERVER_API_BASE_URL_PROVIDER],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
