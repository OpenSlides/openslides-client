import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationMediafileListComponent } from './organization-mediafile-list.component';

xdescribe(`OrganizationMediafileListComponent`, () => {
    let component: OrganizationMediafileListComponent;
    let fixture: ComponentFixture<OrganizationMediafileListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationMediafileListComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(OrganizationMediafileListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
