import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommaSeparatedListingComponent } from './comma-separated-listing.component';

xdescribe(`CommaSeparatedListingComponent`, () => {
    let component: CommaSeparatedListingComponent;
    let fixture: ComponentFixture<CommaSeparatedListingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommaSeparatedListingComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(CommaSeparatedListingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
