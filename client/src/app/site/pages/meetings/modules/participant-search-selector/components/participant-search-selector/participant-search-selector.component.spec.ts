import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipantSearchSelectorComponent } from './participant-search-selector.component';

describe('ParticipantSearchSelectorComponent', () => {
    let component: ParticipantSearchSelectorComponent;
    let fixture: ComponentFixture<ParticipantSearchSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantSearchSelectorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantSearchSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
