import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationTagDialogComponent } from './organisation-tag-dialog.component';

describe('OrganisationTagDialogComponent', () => {
    let component: OrganisationTagDialogComponent;
    let fixture: ComponentFixture<OrganisationTagDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganisationTagDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganisationTagDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
