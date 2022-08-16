import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicDetailComponent } from './topic-detail.component';

xdescribe(`TopicDetailComponent`, () => {
    let component: TopicDetailComponent;
    let fixture: ComponentFixture<TopicDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
