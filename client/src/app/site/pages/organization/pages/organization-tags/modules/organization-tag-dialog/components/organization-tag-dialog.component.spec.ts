import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTagDialogComponent } from './organization-tag-dialog.component';

xdescribe(`OrganizationTagDialogComponent`, () => {
    let component: OrganizationTagDialogComponent;
    let fixture: ComponentFixture<OrganizationTagDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationTagDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationTagDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
