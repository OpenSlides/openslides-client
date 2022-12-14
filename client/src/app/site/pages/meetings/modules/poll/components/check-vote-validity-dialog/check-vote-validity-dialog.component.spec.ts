import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckVoteValidityDialogComponent } from './check-vote-validity-dialog.component';

xdescribe(`CheckVoteValidityDialogComponent`, () => {
    let component: CheckVoteValidityDialogComponent;
    let fixture: ComponentFixture<CheckVoteValidityDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CheckVoteValidityDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(CheckVoteValidityDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
