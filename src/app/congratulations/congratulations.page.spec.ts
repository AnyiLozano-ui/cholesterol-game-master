import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CongratulationsPage } from './congratulations.page';

describe('CongratulationsPage', () => {
  let component: CongratulationsPage;
  let fixture: ComponentFixture<CongratulationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CongratulationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
