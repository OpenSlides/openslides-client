import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollResultSelectionComponent } from './poll-result-selection.component';

describe('PollResultSelectionComponent', () => {
    let component: PollResultSelectionComponent;
    let fixture: ComponentFixture<PollResultSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollResultSelectionComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollResultSelectionComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
