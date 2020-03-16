import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTranslationComponent } from '../custom-translation/custom-translation.component';
import { E2EImportsModule } from '../../../../../e2e-imports.module';
import { SettingsFieldComponent } from '../settings-field/settings-field.component';
import { SettingsListComponent } from './settings-list.component';

describe('SettingsListComponent', () => {
    let component: SettingsListComponent;
    let fixture: ComponentFixture<SettingsListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [SettingsListComponent, SettingsFieldComponent, CustomTranslationComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
