import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistaDetail } from './regista-detail';

describe('RegistaDetail', () => {
  let component: RegistaDetail;
  let fixture: ComponentFixture<RegistaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
