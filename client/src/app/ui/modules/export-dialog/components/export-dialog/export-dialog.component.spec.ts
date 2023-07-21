import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDialogComponent } from './export-dialog.component';

describe(`ExportDialogComponent`, () => {
    let component: ExportDialogComponent;
    let fixture: ComponentFixture<ExportDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExportDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ExportDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
