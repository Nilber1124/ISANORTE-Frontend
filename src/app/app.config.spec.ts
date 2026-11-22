import { DatePipe } from '@angular/common';

import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers the Spanish locale so date pipes that ask for «es» do not fail', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
    const pipe = new DatePipe('en-US');
    expect(pipe.transform('2026-11-22T12:00:00', 'dd MMM yyyy', undefined, 'es')).toBe('22 nov 2026');
  });
});
