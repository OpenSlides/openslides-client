import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Identifiable } from 'src/app/domain/interfaces';

import { BackendImportListComponent } from './backend-import-list.component';

xdescribe(`ViaBackendImportListComponent`, () => {
    let component: BackendImportListComponent<Identifiable>;
    let fixture: ComponentFixture<BackendImportListComponent<Identifiable>>;

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
