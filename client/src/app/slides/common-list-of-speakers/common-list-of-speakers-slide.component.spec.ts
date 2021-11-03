import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { CommonListOfSpeakersSlideComponent } from './common-list-of-speakers-slide.component';

describe(`ListOfSpeakersSlideComponent`, () => {
    let component: CommonListOfSpeakersSlideComponent;
    let fixture: ComponentFixture<CommonListOfSpeakersSlideComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [CommonListOfSpeakersSlideComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonListOfSpeakersSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
