import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { CountdownSlideComponent } from './projector-countdown-slide.component';

describe(`CountdownSlideComponent`, () => {
    let component: CountdownSlideComponent;
    let fixture: ComponentFixture<CountdownSlideComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [CountdownSlideComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CountdownSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
