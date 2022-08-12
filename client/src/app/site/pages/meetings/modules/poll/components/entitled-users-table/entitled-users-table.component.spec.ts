import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitledUsersTableComponent } from './entitled-users-table.component';

xdescribe(`EntitledUsersTableComponent`, () => {
    let component: EntitledUsersTableComponent;
    let fixture: ComponentFixture<EntitledUsersTableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EntitledUsersTableComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EntitledUsersTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
