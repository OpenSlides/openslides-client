import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountImportListComponent } from './account-import-list.component';

xdescribe(`AccountImportListComponent`, () => {
    let component: AccountImportListComponent;
    let fixture: ComponentFixture<AccountImportListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountImportListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
