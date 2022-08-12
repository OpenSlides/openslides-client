import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPollComponent } from './topic-poll.component';

xdescribe(`TopicPollComponent`, () => {
    let component: TopicPollComponent;
    let fixture: ComponentFixture<TopicPollComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicPollComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicPollComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
