import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPollDetailContentComponent } from './topic-poll-detail-content.component';

xdescribe(`TopicPollDetailContentComponent`, () => {
    let component: TopicPollDetailContentComponent;
    let fixture: ComponentFixture<TopicPollDetailContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicPollDetailContentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicPollDetailContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
