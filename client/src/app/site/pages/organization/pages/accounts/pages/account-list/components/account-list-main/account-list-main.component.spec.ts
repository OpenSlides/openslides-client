import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountListMainComponent } from './account-list-main.component';

xdescribe(`AccountListMainComponent`, () => {
    let component: AccountListMainComponent;
    let fixture: ComponentFixture<AccountListMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountListMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountListMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
