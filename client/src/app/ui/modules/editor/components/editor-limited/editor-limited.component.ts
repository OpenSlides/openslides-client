import { AfterViewInit, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import OfficePaste from '@intevation/tiptap-extension-office-paste';
import { Editor, Extension } from '@tiptap/core';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { Color } from '@tiptap/extension-color';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { UndoRedo } from '@tiptap/extensions';
import { Permission } from 'src/app/domain/definitions/permission';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { EditorComponent } from '../editor/editor.component';
import { ClearTextcolorPaste } from '../editor/extensions/clear-textcolor';
import { Highlight } from '../editor/extensions/highlight';
import IFrame from '../editor/extensions/iframe';
import { ImageResize } from '../editor/extensions/image-resize';
import { OsSplit, OsSplitBulletList, OsSplitListItem, OsSplitOrderedList } from '../editor/extensions/os-split';
import { TextStyle } from '../editor/extensions/text-style';

@Component({
    selector: `os-limit-editor`,
    templateUrl: `./editor.component.html`,
    styleUrls: [`./editor.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MotionEditor), multi: true }],
    standalone: false
})
export class MotionEditor extends EditorComponent implements AfterViewInit {
    private allowEditorLimitNonManager = false;
    private allowEditorLimitManager = false;

    public constructor(private meetingSettingsService: MeetingSettingsService) {
        super();

        this.subscriptions.push(
            this.meetingSettingsService.get(`motions_enable_restricted_editor_for_non_manager`).subscribe(enabled => {
                this.allowEditorLimitNonManager = !this.operator.hasPerms(Permission.motionCanManage) && enabled;
            }),
            this.meetingSettingsService.get(`motions_enable_restricted_editor_for_manager`).subscribe(enabled => {
                this.allowEditorLimitManager = this.operator.hasPerms(Permission.motionCanManage) && enabled;
            })
        );
    }

    public override ngAfterViewInit(): void {
        super.ngAfterViewInit();
        const offLimitExtension = [];
        if (!(this.allowEditorLimitNonManager || this.allowEditorLimitManager)) {
            offLimitExtension.push(
                ClearTextcolorPaste,
                // Nodes
                Blockquote,
                ImageResize.configure({
                    inline: true
                }),
                Table,
                TableRow,
                TableHeader,
                TableCell,
                // Marks
                Highlight.configure({
                    multicolor: true
                }),
                Link.extend({
                    inclusive: false
                }),
                // Extensions
                Color,
                Strike,
                Subscript,
                Superscript,
                Underline
            );
        }
        const editorConfig = {
            element: this.editorEl.nativeElement,
            extensions: [
                OfficePaste,
                ClearTextcolorPaste,
                // Nodes
                Document,
                Blockquote,
                HardBreak,
                Heading,
                ImageResize.configure({
                    inline: true
                }),
                OsSplitBulletList,
                OsSplitOrderedList,
                OsSplitListItem,
                Paragraph,
                Text,
                Table,
                TableRow,
                TableHeader,
                TableCell,

                // Marks
                Bold,
                Highlight.configure({
                    multicolor: true
                }),
                Italic,
                Link.extend({
                    inclusive: false
                }),
                Strike,
                Subscript,
                Superscript,
                TextStyle,
                Underline,

                // Extensions
                Color,
                UndoRedo,
                TextAlign.configure({
                    types: [`heading`, `paragraph`]
                }),
                OsSplit,
                Extension.create({
                    name: `angular-component-ext`,
                    onCreate: () => {
                        this.editorReady = true;
                        this.cd.detectChanges();
                    },
                    onDestroy: () => {
                        this.editorReady = false;
                        this.leaveFocus.emit();
                    },
                    onBlur: () => {
                        this.leaveFocus.emit();
                    },
                    onSelectionUpdate: () => {
                        this.cd.detectChanges();
                    },
                    onUpdate: () => {
                        const content = this.cleanupOutput(this.editor.getHTML());
                        if (this.value != content) {
                            this.updateForm(content);
                        }
                    }
                })
            ],
            content: this.value
        };

        if (this.allowEmbeds) {
            editorConfig.extensions.push(IFrame);
        }

        this.editor = new Editor(editorConfig);
        this.updateColorSets();
    }

    public isEditorLimited(): boolean {
        return this.allowEditorLimitNonManager || this.allowEditorLimitManager;
    }
}
