import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMultiselectActionsComponent } from './user-multiselect-actions.component';

describe(`UserMultiselectActionsComponent`, () => {
    let component: UserMultiselectActionsComponent;
    let fixture: ComponentFixture<UserMultiselectActionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserMultiselectActionsComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(UserMultiselectActionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
