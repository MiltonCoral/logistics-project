import { TestBed } from '@angular/core/testing';

import { Guia } from './guia';

describe('Guia', () => {
  let service: Guia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Guia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
