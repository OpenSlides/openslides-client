import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorMessageSlideComponent } from './projector-message-slide.component';

xdescribe(`ProjectorMessageSlideComponent`, () => {
    let component: ProjectorMessageSlideComponent;
    let fixture: ComponentFixture<ProjectorMessageSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorMessageSlideComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorMessageSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
