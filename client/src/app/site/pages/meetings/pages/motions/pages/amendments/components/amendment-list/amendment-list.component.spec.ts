import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmendmentListComponent } from './amendment-list.component';

xdescribe(`AmendmentListComponent`, () => {
    let component: AmendmentListComponent;
    let fixture: ComponentFixture<AmendmentListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AmendmentListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AmendmentListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
