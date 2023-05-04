import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendImportListComponent } from './backend-import-list.component';

xdescribe(`ViaBackendImportListComponent`, () => {
    let component: BackendImportListComponent;
    let fixture: ComponentFixture<BackendImportListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BackendImportListComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(BackendImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
