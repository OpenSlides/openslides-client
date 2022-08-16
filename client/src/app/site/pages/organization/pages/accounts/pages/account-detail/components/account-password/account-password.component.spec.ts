import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPasswordComponent } from './account-password.component';

xdescribe(`AccountPasswordComponent`, () => {
    let component: AccountPasswordComponent;
    let fixture: ComponentFixture<AccountPasswordComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountPasswordComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
