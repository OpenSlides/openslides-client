import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountListComponent } from './account-list.component';

xdescribe(`AccountListComponent`, () => {
    let component: AccountListComponent;
    let fixture: ComponentFixture<AccountListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
