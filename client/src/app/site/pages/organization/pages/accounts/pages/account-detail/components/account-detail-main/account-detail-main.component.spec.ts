import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetailMainComponent } from './account-detail-main.component';

xdescribe(`AccountDetailMainComponent`, () => {
    let component: AccountDetailMainComponent;
    let fixture: ComponentFixture<AccountDetailMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountDetailMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountDetailMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
