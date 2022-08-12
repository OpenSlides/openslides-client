import { ComponentFixture, TestBed } from '@angular/core/testing';
import {GlobalHeadbarModule} from '../../global-headbar.module';

import { AccountButtonComponent } from './account-button.component';

xdescribe(`AccountButtonComponent`, () => {
    let component: AccountButtonComponent;
    let fixture: ComponentFixture<AccountButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GlobalHeadbarModule],
            declarations: [AccountButtonComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
