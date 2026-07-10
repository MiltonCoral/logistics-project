import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaClientes } from './guia-clientes';

describe('GuiaClientes', () => {
  let component: GuiaClientes;
  let fixture: ComponentFixture<GuiaClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiaClientes],
    }).compileComponents();

    fixture = TestBed.createComponent(GuiaClientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
