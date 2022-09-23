import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserSlideComponent } from './user-slide.component';

xdescribe(`UserSlideComponent`, () => {
    let component: UserSlideComponent;
    let fixture: ComponentFixture<UserSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [UserSlideComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
