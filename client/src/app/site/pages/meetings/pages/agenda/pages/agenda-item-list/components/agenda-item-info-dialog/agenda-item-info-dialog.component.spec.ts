import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AgendaItemInfoDialogComponent } from './agenda-item-info-dialog.component';

describe(`AgendaItemInfoDialogComponent`, () => {
    let component: AgendaItemInfoDialogComponent;
    let fixture: ComponentFixture<AgendaItemInfoDialogComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [AgendaItemInfoDialogComponent],
                providers: [
                    { provide: MatDialogRef, useValue: {} },
                    {
                        provide: MAT_DIALOG_DATA,
                        useValue: null
                    }
                ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaItemInfoDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
