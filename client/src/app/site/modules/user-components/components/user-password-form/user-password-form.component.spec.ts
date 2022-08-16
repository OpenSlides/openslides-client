import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPasswordFormComponent } from './user-password-form.component';

xdescribe(`UserPasswordFormComponent`, () => {
    let component: UserPasswordFormComponent;
    let fixture: ComponentFixture<UserPasswordFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserPasswordFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserPasswordFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
