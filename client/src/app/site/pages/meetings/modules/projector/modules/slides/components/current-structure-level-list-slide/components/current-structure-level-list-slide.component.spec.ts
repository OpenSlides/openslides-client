import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentStructureLevelListSlideComponent } from './current-structure-level-list-slide.component';

xdescribe(`CurrentStructureLevelListSlideComponent`, () => {
    let component: CurrentStructureLevelListSlideComponent;
    let fixture: ComponentFixture<CurrentStructureLevelListSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CurrentStructureLevelListSlideComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CurrentStructureLevelListSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
