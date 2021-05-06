import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionTreeComponent } from './selection-tree.component';

describe('SelectionTreeComponent', () => {
    let component: SelectionTreeComponent;
    let fixture: ComponentFixture<SelectionTreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionTreeComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
