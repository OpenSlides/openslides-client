import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChessDialogComponent } from './chess-dialog.component';

xdescribe(`ChessDialogComponent`, () => {
    let component: ChessDialogComponent;
    let fixture: ComponentFixture<ChessDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChessDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChessDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
