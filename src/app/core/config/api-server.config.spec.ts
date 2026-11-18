import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from './api.config';
import { resolveBackendOrigin } from './api-server.config';

describe('API base URL configuration', () => {
  it('keeps browser requests relative to the current origin', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(API_BASE_URL)).toBe('');
  });

  it('resolves an absolute server URL from BACKEND_ORIGIN', () => {
    expect(resolveBackendOrigin({ BACKEND_ORIGIN: 'https://api.isanorte.pe/backend/' })).toBe(
      'https://api.isanorte.pe',
    );
  });

  it('rejects missing and relative server origins', () => {
    expect(() => resolveBackendOrigin({})).toThrowError(/BACKEND_ORIGIN/);
    expect(() => resolveBackendOrigin({ BACKEND_ORIGIN: '/backend' })).toThrowError(/absoluta/);
  });
});
