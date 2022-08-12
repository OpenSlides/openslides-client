import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { AuthAdapterService } from './auth-adapter.service';

xdescribe(`AuthAdapterService`, () => {
    let service: AuthAdapterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(AuthAdapterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
