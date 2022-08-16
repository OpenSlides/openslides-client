import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountUsersComponent } from './count-users.component';

xdescribe(`CountUsersComponent`, () => {
    let component: CountUsersComponent;
    let fixture: ComponentFixture<CountUsersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CountUsersComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CountUsersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
