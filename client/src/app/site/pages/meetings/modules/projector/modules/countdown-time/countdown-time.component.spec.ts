import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownTimeComponent } from './countdown-time.component';

xdescribe(`CountdownTimeComponent`, () => {
    let component: CountdownTimeComponent;
    let fixture: ComponentFixture<CountdownTimeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CountdownTimeComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CountdownTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
