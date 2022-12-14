import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingCryptographyInfoDialogComponent } from './voting-cryptography-info-dialog.component';

xdescribe(`VotingCryptographyInfoDialogComponent`, () => {
    let component: VotingCryptographyInfoDialogComponent;
    let fixture: ComponentFixture<VotingCryptographyInfoDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VotingCryptographyInfoDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(VotingCryptographyInfoDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
