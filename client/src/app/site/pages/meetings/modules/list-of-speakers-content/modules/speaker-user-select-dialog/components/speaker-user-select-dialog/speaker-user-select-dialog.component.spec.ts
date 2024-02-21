import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerUserSelectDialogComponent } from './speaker-user-select-dialog.component';

xdescribe(`SpeakerUserSelectDialogComponent`, () => {
    let component: SpeakerUserSelectDialogComponent;
    let fixture: ComponentFixture<SpeakerUserSelectDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SpeakerUserSelectDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SpeakerUserSelectDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
