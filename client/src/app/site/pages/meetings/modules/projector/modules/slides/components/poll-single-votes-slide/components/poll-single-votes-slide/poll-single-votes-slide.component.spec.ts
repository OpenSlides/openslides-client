import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollSingleVotesSlideComponent } from './poll-single-votes-slide.component';

xdescribe(`PollSingleVotesSlideComponent`, () => {
    let component: PollSingleVotesSlideComponent;
    let fixture: ComponentFixture<PollSingleVotesSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollSingleVotesSlideComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollSingleVotesSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
