import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailNavigatorComponent } from './detail-navigator.component';

describe(`DetailNavigatorComponent`, () => {
    let component: DetailNavigatorComponent;
    let fixture: ComponentFixture<DetailNavigatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DetailNavigatorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailNavigatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
