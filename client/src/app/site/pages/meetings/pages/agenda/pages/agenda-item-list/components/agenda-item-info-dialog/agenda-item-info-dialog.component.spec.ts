import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { AgendaItemInfoDialogComponent } from './agenda-item-info-dialog.component';

xdescribe(`AgendaItemInfoDialogComponent`, () => {
    let component: AgendaItemInfoDialogComponent;
    let fixture: ComponentFixture<AgendaItemInfoDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AgendaItemInfoDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: null
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaItemInfoDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
