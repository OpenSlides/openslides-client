import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaExportComponent } from './agenda-export.component';

xdescribe(`AgendaExportComponent`, () => {
    let component: AgendaExportComponent;
    let fixture: ComponentFixture<AgendaExportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgendaExportComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(AgendaExportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
