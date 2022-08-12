import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingPrivacyWarningDialogComponent } from './voting-privacy-warning-dialog.component';

xdescribe(`VotingPrivacyWarningDialogComponent`, () => {
    let component: VotingPrivacyWarningDialogComponent;
    let fixture: ComponentFixture<VotingPrivacyWarningDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VotingPrivacyWarningDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VotingPrivacyWarningDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
