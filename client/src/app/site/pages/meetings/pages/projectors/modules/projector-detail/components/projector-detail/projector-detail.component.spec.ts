import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorDetailComponent } from './projector-detail.component';

xdescribe(`ProjectorDetailComponent`, () => {
    let component: ProjectorDetailComponent;
    let fixture: ComponentFixture<ProjectorDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
