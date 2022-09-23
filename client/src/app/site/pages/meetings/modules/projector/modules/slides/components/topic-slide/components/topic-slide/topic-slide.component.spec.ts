import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicSlideComponent } from './topic-slide.component';

xdescribe(`TopicSlideComponent`, () => {
    let component: TopicSlideComponent;
    let fixture: ComponentFixture<TopicSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicSlideComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
