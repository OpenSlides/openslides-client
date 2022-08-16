import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeImportListComponent } from './committee-import-list.component';

xdescribe(`CommitteeImportListComponent`, () => {
    let component: CommitteeImportListComponent;
    let fixture: ComponentFixture<CommitteeImportListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeImportListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
