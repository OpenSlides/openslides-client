import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotesTableComponent } from './votes-table.component';

xdescribe(`VotesTableComponent`, () => {
    let component: VotesTableComponent;
    let fixture: ComponentFixture<VotesTableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VotesTableComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(VotesTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
