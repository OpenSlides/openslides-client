import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CurrentSpeakerChyronSlideComponent } from './current-speaker-chyron-slide.component';

xdescribe(`CurrentSpeakerChyronSlideComponent`, () => {
    let component: CurrentSpeakerChyronSlideComponent;
    let fixture: ComponentFixture<CurrentSpeakerChyronSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CurrentSpeakerChyronSlideComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CurrentSpeakerChyronSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
