import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistList } from './checklist-list';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Y en el decorator:
imports: [CommonModule, FormsModule, RouterLink];

describe('ChecklistList', () => {
  let component: ChecklistList;
  let fixture: ComponentFixture<ChecklistList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistList],
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
