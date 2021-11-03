import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../e2e-imports.module';
import { CountdownTimeComponent } from './countdown-time.component';

describe(`CountdownTimeComponent`, () => {
    let component: CountdownTimeComponent;
    let fixture: ComponentFixture<CountdownTimeComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CountdownTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
