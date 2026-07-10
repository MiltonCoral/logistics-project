import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaList } from './guia-list';

describe('GuiaList', () => {
  let component: GuiaList;
  let fixture: ComponentFixture<GuiaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiaList],
    }).compileComponents();

    fixture = TestBed.createComponent(GuiaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
