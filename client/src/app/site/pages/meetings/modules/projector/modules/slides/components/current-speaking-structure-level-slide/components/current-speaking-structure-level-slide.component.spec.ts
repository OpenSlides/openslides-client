import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CurrentSpeakingStructureLevelSlideComponent } from './current-speaking-structure-level-slide.component';

xdescribe(`CurrentSpeakingStructureLevelSlideComponent`, () => {
    let component: CurrentSpeakingStructureLevelSlideComponent;
    let fixture: ComponentFixture<CurrentSpeakingStructureLevelSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CurrentSpeakingStructureLevelSlideComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CurrentSpeakingStructureLevelSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
