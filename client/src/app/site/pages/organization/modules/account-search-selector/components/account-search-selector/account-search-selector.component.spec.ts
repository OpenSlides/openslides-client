import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSearchSelectorComponent } from './account-search-selector.component';

xdescribe(`AccountSearchSelectorComponent`, () => {
    let component: AccountSearchSelectorComponent;
    let fixture: ComponentFixture<AccountSearchSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountSearchSelectorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountSearchSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
