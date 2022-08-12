import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStatisticsComponent } from './user-statistics.component';

xdescribe(`UserStatisticsComponent`, () => {
    let component: UserStatisticsComponent;
    let fixture: ComponentFixture<UserStatisticsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserStatisticsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserStatisticsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
