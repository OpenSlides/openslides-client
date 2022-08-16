import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownControlsComponent } from './countdown-controls.component';

xdescribe(`CountdownControlsComponent`, () => {
    let component: CountdownControlsComponent;
    let fixture: ComponentFixture<CountdownControlsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CountdownControlsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CountdownControlsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
