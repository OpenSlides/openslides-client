import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPollDialogComponent } from './topic-poll-dialog.component';

xdescribe(`TopicPollDialogComponent`, () => {
    let component: TopicPollDialogComponent;
    let fixture: ComponentFixture<TopicPollDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicPollDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicPollDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
