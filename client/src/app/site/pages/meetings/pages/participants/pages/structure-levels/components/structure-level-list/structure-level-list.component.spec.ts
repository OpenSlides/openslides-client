import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureLevelListComponent } from './structure-level-list.component';

xdescribe(`StructureLevelListComponent`, () => {
    let component: StructureLevelListComponent;
    let fixture: ComponentFixture<StructureLevelListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StructureLevelListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StructureLevelListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
