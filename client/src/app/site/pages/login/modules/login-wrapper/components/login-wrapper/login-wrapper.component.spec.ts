import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginWrapperComponent } from './login-wrapper.component';

xdescribe(`LoginWrapperComponent`, () => {
    let component: LoginWrapperComponent;
    let fixture: ComponentFixture<LoginWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoginWrapperComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
