import { ComponentFixture, TestBed } from '@angular/core/testing';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AccountsModule} from 'src/app/site/pages/organization/pages/accounts/accounts.module';
import {GlobalHeadbarModule} from '../../global-headbar.module';

import { AccountDialogComponent } from './account-dialog.component';

xdescribe(`AccountDialogComponent`, () => {
    let component: AccountDialogComponent;
    let fixture: ComponentFixture<AccountDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GlobalHeadbarModule],
            declarations: [AccountDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: null
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AccountDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
