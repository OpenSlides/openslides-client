import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';

import { ImportListComponent } from './import-list.component';

xdescribe(`ImportListComponent`, () => {
    class TestIdentifiable implements Identifiable {
        readonly id: Id;
    }

    let component: ImportListComponent<TestIdentifiable>;
    let fixture: ComponentFixture<ImportListComponent<TestIdentifiable>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImportListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
