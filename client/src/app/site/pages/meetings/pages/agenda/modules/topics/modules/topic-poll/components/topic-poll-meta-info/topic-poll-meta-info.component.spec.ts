import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPollMetaInfoComponent } from './topic-poll-meta-info.component';

xdescribe(`TopicPollMetaInfoComponent`, () => {
    let component: TopicPollMetaInfoComponent;
    let fixture: ComponentFixture<TopicPollMetaInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicPollMetaInfoComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicPollMetaInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
