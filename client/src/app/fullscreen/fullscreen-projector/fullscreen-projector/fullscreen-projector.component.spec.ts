import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { FullscreenProjectorModule } from '../fullscreen-projector.module';
import { FullscreenProjectorComponent } from './fullscreen-projector.component';

describe(`FullscreenProjectorComponent`, () => {
    let component: FullscreenProjectorComponent;
    let fixture: ComponentFixture<FullscreenProjectorComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule, FullscreenProjectorModule]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(FullscreenProjectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
