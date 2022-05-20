import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsNavigationWrapperComponent } from './meetings-navigation-wrapper.component';

describe(`MeetingsNavigationWrapperComponent`, () => {
    let component: MeetingsNavigationWrapperComponent;
    let fixture: ComponentFixture<MeetingsNavigationWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingsNavigationWrapperComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingsNavigationWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
