import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistForm } from './checklist-form';

describe('ChecklistForm', () => {
  let component: ChecklistForm;
  let fixture: ComponentFixture<ChecklistForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
