import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonListOfSpeakersSlideComponent } from './common-list-of-speakers-slide.component';

xdescribe(`ListOfSpeakersSlideComponent`, () => {
    let component: CommonListOfSpeakersSlideComponent;
    let fixture: ComponentFixture<CommonListOfSpeakersSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CommonListOfSpeakersSlideComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonListOfSpeakersSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
