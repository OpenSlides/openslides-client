import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { CurrentSpeakerChyronSlideComponent } from './current-speaker-chyron-slide.component';

describe(`CurrentSpeakerChyronSlideComponent`, () => {
    let component: CurrentSpeakerChyronSlideComponent;
    let fixture: ComponentFixture<CurrentSpeakerChyronSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
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
