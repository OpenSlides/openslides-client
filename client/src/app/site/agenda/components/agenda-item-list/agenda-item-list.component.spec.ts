import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaItemListComponent } from './agenda-item-list.component';
import { E2EImportsModule } from '../../../../../e2e-imports.module';

describe('AgendaListComponent', () => {
    let component: AgendaItemListComponent;
    let fixture: ComponentFixture<AgendaItemListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [AgendaItemListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaItemListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
