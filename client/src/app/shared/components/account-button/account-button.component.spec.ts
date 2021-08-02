import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountButtonComponent } from './account-button.component';

describe('AccountButtonComponent', () => {
    let component: AccountButtonComponent;
    let fixture: ComponentFixture<AccountButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountButtonComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
