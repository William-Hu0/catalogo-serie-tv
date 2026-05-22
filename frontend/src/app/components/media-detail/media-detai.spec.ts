import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaDetai } from './media-detai';

describe('MediaDetai', () => {
  let component: MediaDetai;
  let fixture: ComponentFixture<MediaDetai>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaDetai],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaDetai);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
