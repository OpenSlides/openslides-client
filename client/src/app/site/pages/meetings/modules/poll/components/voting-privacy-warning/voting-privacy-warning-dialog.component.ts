import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: `os-voting-privacy-warning-dialog`,
    templateUrl: `./voting-privacy-warning-dialog.component.html`,
    styleUrls: [`./voting-privacy-warning-dialog.component.scss`],
    imports: [MatButtonModule, MatDialogModule, TranslatePipe]
})
export class VotingPrivacyWarningDialogComponent {}
