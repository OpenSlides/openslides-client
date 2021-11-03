import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { ProjectorModule } from '../../projector.module';
import { ProjectorDetailComponent } from './projector-detail.component';

describe(`ProjectorDetailComponent`, () => {
    let component: ProjectorDetailComponent;
    let fixture: ComponentFixture<ProjectorDetailComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule, ProjectorModule]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
