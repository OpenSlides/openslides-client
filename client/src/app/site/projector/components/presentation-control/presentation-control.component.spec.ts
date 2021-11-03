import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../../e2e-imports.module';
import { ProjectorModule } from '../../projector.module';
import { PresentationControlComponent } from './presentation-control.component';

describe(`PresentationControlComponent`, () => {
    let component: PresentationControlComponent;
    let fixture: ComponentFixture<PresentationControlComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule, ProjectorModule]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(PresentationControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
