import { ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import { provideHttpClient, withInterceptors} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [ provideBrowserGlobalErrorListeners(),
    provideHttpClient( withInterceptors([jwtInterceptor])),
    provideRouter(routes),
    providePrimeNG({ theme: { preset: Aura,
     options: { darkModeSelector: 'none' }
     }})
  ]};