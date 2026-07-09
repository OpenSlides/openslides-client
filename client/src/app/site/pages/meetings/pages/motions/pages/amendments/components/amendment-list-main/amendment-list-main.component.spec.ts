import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmendmentListMainComponent } from './amendment-list-main.component';

describe.skip(`AmendmentListMainComponent`, () => {
    let component: AmendmentListMainComponent;
    let fixture: ComponentFixture<AmendmentListMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AmendmentListMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AmendmentListMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
