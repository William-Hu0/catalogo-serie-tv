import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistaList } from './regista-list';

describe('RegistaList', () => {
  let component: RegistaList;
  let fixture: ComponentFixture<RegistaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistaList],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
