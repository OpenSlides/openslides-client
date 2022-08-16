import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMainComponent } from './error-main.component';

xdescribe(`ErrorMainComponent`, () => {
    let component: ErrorMainComponent;
    let fixture: ComponentFixture<ErrorMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ErrorMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
