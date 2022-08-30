import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CountdownSlideComponent } from './projector-countdown-slide.component';

xdescribe(`CountdownSlideComponent`, () => {
    let component: CountdownSlideComponent;
    let fixture: ComponentFixture<CountdownSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CountdownSlideComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CountdownSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
