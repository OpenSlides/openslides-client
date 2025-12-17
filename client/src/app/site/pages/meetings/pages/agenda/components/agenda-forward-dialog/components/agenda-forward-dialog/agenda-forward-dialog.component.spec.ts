import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaForwardDialogComponent } from './agenda-forward-dialog.component';

xdescribe('AgendaForwardDialogComponent', () => {
    let component: AgendaForwardDialogComponent;
    let fixture: ComponentFixture<AgendaForwardDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgendaForwardDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(AgendaForwardDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
