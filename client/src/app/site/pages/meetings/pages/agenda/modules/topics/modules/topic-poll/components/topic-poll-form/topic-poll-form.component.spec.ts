import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPollFormComponent } from './topic-poll-form.component';

xdescribe(`TopicPollFormComponent`, () => {
    let component: TopicPollFormComponent;
    let fixture: ComponentFixture<TopicPollFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicPollFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicPollFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
