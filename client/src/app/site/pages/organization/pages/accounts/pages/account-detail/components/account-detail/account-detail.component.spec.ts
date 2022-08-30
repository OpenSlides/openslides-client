import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetailComponent } from './account-detail.component';

xdescribe(`AccountDetailComponent`, () => {
    let component: AccountDetailComponent;
    let fixture: ComponentFixture<AccountDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
