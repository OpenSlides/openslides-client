import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountMergeDialogComponent } from './account-merge-dialog.component';

describe(`AccountMergeDialogComponent`, () => {
    let component: AccountMergeDialogComponent;
    let fixture: ComponentFixture<AccountMergeDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AccountMergeDialogComponent]
        });
        fixture = TestBed.createComponent(AccountMergeDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
