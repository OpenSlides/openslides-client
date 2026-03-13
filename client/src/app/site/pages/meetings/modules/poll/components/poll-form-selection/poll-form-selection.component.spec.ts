import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollFormSelectionComponent } from './poll-form-selection.component';

describe('PollFormSelectionComponent', () => {
    let component: PollFormSelectionComponent;
    let fixture: ComponentFixture<PollFormSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollFormSelectionComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollFormSelectionComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
