import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorEditDialogComponent } from './projector-edit-dialog.component';

xdescribe(`ProjectorEditDialogComponent`, () => {
    let component: ProjectorEditDialogComponent;
    let fixture: ComponentFixture<ProjectorEditDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorEditDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorEditDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
