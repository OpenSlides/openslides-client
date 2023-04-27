import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicDetailMainComponent } from './topic-detail-main.component';

xdescribe(`TopicDetailMainComponent`, () => {
    let component: TopicDetailMainComponent;
    let fixture: ComponentFixture<TopicDetailMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicDetailMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicDetailMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
