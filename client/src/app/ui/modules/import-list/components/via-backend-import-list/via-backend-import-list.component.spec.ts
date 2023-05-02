import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViaBackendImportListComponent } from './via-backend-import-list.component';

xdescribe(`ViaBackendImportListComponent`, () => {
    let component: ViaBackendImportListComponent;
    let fixture: ComponentFixture<ViaBackendImportListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ViaBackendImportListComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ViaBackendImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
