import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exportacion } from './exportacion';

describe('Exportacion', () => {
  let component: Exportacion;
  let fixture: ComponentFixture<Exportacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exportacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Exportacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
