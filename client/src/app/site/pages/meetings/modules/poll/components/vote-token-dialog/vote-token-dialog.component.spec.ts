import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteTokenDialogComponent } from './vote-token-dialog.component';

xdescribe(`VoteTokenDialogComponent`, () => {
    let component: VoteTokenDialogComponent;
    let fixture: ComponentFixture<VoteTokenDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VoteTokenDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(VoteTokenDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
