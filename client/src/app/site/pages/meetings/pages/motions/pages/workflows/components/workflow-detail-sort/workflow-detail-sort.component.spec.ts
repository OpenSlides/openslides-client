import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailSortComponent } from './workflow-detail-sort.component';

describe(`WorkflowDetailSortComponent`, () => {
    let component: WorkflowDetailSortComponent;
    let fixture: ComponentFixture<WorkflowDetailSortComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WorkflowDetailSortComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(WorkflowDetailSortComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
