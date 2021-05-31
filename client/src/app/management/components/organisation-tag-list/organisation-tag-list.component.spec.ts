import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationTagListComponent } from './organisation-tag-list.component';

describe('OrganisationTagListComponent', () => {
    let component: OrganisationTagListComponent;
    let fixture: ComponentFixture<OrganisationTagListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganisationTagListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganisationTagListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
