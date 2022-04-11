import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateWizardComponent } from './user-create-wizard.component';

describe(`UserCreateWizardComponent`, () => {
    let component: UserCreateWizardComponent;
    let fixture: ComponentFixture<UserCreateWizardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserCreateWizardComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserCreateWizardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
