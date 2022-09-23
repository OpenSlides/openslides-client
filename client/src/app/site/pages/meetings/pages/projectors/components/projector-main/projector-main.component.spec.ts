import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorMainComponent } from './projector-main.component';

xdescribe(`ProjectorMainComponent`, () => {
    let component: ProjectorMainComponent;
    let fixture: ComponentFixture<ProjectorMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
