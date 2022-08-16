import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PollSlideComponent } from './poll-slide.component';

xdescribe(`PollSlideComponent`, () => {
    let component: PollSlideComponent;
    let fixture: ComponentFixture<PollSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [PollSlideComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
