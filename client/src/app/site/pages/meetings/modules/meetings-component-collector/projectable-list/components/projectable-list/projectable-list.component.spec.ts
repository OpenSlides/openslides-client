import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ProjectableListComponent } from './projectable-list.component';

xdescribe(`ProjectableListComponent`, () => {
    class TestViewModel extends BaseViewModel {}

    let component: ProjectableListComponent<TestViewModel>;
    let fixture: ComponentFixture<ProjectableListComponent<TestViewModel>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectableListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectableListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
