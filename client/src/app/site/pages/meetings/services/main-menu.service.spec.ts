import { TestBed } from '@angular/core/testing';
import { firstValueFrom, skip } from 'rxjs';

import { MainMenuEntry, MainMenuService } from './main-menu.service';

const menuEntries: MainMenuEntry[] = [
    { route: `page1`, displayName: `A page`, icon: `add`, weight: 300 },
    { route: `start`, displayName: `Start page`, icon: `start`, weight: 100 },
    { route: `page2`, displayName: `Another page`, icon: `search`, weight: 200 }
];

function getNumberOfTogglesPromise(service: MainMenuService, requiredToggleNumber: number): Promise<void> {
    return firstValueFrom(service.toggleMenuSubject.pipe(skip(requiredToggleNumber - 1)));
}

describe(`MainMenuService`, () => {
    let service: MainMenuService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MainMenuService]
        });

        service = TestBed.inject(MainMenuService);
    });

    it(`test registerEntries method`, () => {
        service.registerEntries([menuEntries[0]]);
        expect(service.entries).toEqual([menuEntries[0]]);
    });

    it(`test registerEntries method with multiple entries at once`, () => {
        service.registerEntries(menuEntries.slice(1));
        expect(service.entries).toEqual(menuEntries.slice(1));
    });

    it(`test consecutive calls of registerEntries method`, () => {
        service.registerEntries(menuEntries.slice(0, 2));
        service.registerEntries([menuEntries[2]]);
        expect(service.entries).toEqual(menuEntries.sort((a, b) => a.weight - b.weight));
    });

    for (let i = 1; i <= 5; i++) {
        it(`test toggleSubject with ${i} call(s)`, async () => {
            const promise1 = getNumberOfTogglesPromise(service, i);
            const promise2 = getNumberOfTogglesPromise(service, i + 1);
            for (let j = 0; j < i; j++) {
                service.toggleMenu();
            }
            await expectAsync(promise1).toBeResolved();
            await expectAsync(promise2).toBePending();
        });
    }
});
