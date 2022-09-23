import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingTreeComponent } from './sorting-tree.component';

xdescribe(`SortingTreeComponent`, () => {
    let component: SortingTreeComponent<any>;
    let fixture: ComponentFixture<SortingTreeComponent<any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SortingTreeComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SortingTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
