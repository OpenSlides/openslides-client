import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { MotionDiffService } from './motion-diff.service';

describe(`MotionDiffService`, () => {
    let service: MotionDiffService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });

        service = TestBed.inject(MotionDiffService);
    });

    describe(`formatOsCollidingChanges`, () => {
        it(`converts collision HTML to WYSIWYG-editor-compatible styles for P elements`, () => {
            const inHtml =
                `<div class="os-colliding-change os-colliding-change-holder" data-change-type="amendment" data-change-id="amendment-15-0" data-identifier="08-Ä02" data-title="08-Ä02: Änderungsantrag zu 08" data-line-from="3" data-line-to="3">` +
                `<p><span class="os-line-number line-number-3" data-line-number="3" contenteditable="false">&nbsp;</span>sit amet justo</p>` +
                `</div>`;

            const processedHtml = service.formatOsCollidingChanges(inHtml, service.formatOsCollidingChanges_wysiwyg_cb);
            expect(processedHtml).toBe(
                `<div class="os-colliding-change-holder" data-change-type="amendment" data-change-id="amendment-15-0" data-identifier="08-Ä02" data-title="08-Ä02: Änderungsantrag zu 08" data-line-from="3" data-line-to="3">` +
                    `<p><span class="os-colliding-change os-colliding-change-comment">==============<br>&lt;!-- ### 08-Ä02 (Line 3) ### --&gt;<br></span>` +
                    `<span class="os-line-number line-number-3" data-line-number="3" contenteditable="false">&nbsp;</span>sit amet justo</p>` +
                    `<span>==============</span></div>`
            );
        });

        it(`converts collision HTML to WYSIWYG-editor-compatible styles for UL elements`, () => {
            const inHtml =
                `<div class="os-colliding-change os-colliding-change-holder" data-change-type="amendment" data-change-id="amendment-15-0" data-identifier="08-Ä02" data-title="08-Ä02: Änderungsantrag zu 08" data-line-from="3" data-line-to="3">` +
                `<ul><li><span class="os-line-number line-number-3" data-line-number="3" contenteditable="false">&nbsp;</span>sit amet justo</li></ul>` +
                `</div>`;

            const processedHtml = service.formatOsCollidingChanges(inHtml, service.formatOsCollidingChanges_wysiwyg_cb);
            expect(processedHtml).toBe(
                `<div class="os-colliding-change-holder" data-change-type="amendment" data-change-id="amendment-15-0" data-identifier="08-Ä02" data-title="08-Ä02: Änderungsantrag zu 08" data-line-from="3" data-line-to="3">` +
                    `<div class="os-colliding-change os-colliding-change-comment">==============<br>&lt;!-- ### 08-Ä02 (Line 3) ### --&gt;</div>` +
                    `<ul><li><span class="os-line-number line-number-3" data-line-number="3" contenteditable="false">&nbsp;</span>sit amet justo</li></ul>` +
                    `<div>==============</div>` +
                    `</div>`
            );
        });
    });
});
