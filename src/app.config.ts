import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { GoogleLoginProvider, SOCIAL_AUTH_CONFIG, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { environment } from './environments/environment';

const googleClientId = environment.googleClientId;

const socialLoginConfig: SocialAuthServiceConfig = {
  autoLogin: false,
  lang: 'es',
  providers: googleClientId
    ? [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(googleClientId)
        }
      ]
    : [],
  onError: error => console.error('Google social login error:', error)
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: socialLoginConfig
    }
  ]
};