import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowImportComponent } from './workflow-import.component';

xdescribe(`WorkflowImportComponent`, () => {
    let component: WorkflowImportComponent;
    let fixture: ComponentFixture<WorkflowImportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WorkflowImportComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkflowImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
