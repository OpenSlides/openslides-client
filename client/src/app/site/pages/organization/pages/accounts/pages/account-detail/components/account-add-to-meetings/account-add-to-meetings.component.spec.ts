import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountAddToMeetingsComponent } from './account-add-to-meetings.component';

xdescribe(`AccountAddToMeetingsComponent`, () => {
    let component: AccountAddToMeetingsComponent;
    let fixture: ComponentFixture<AccountAddToMeetingsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountAddToMeetingsComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(AccountAddToMeetingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
