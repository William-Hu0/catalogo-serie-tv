import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiattaformaDetail } from './piattaforma-detail';

describe('PiattaformaDetail', () => {
  let component: PiattaformaDetail;
  let fixture: ComponentFixture<PiattaformaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiattaformaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PiattaformaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
