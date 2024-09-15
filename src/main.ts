import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';

import { environment } from './environments/environment';
import { registerLicense } from '@syncfusion/ej2-base';

// Registering Syncfusion license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXZfdXRQQmZZVkBzW0c=');

if (environment.production) {
  enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
