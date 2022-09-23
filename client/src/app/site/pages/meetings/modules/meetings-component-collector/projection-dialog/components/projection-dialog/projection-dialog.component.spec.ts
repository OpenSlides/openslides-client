import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionDialogComponent } from './projection-dialog.component';

xdescribe(`ProjectionDialogComponent`, () => {
    let component: ProjectionDialogComponent;
    let fixture: ComponentFixture<ProjectionDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectionDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
