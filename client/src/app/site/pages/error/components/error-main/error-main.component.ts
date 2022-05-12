import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/site/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'os-error-main',
    templateUrl: './error-main.component.html',
    styleUrls: ['./error-main.component.scss']
})
export class ErrorMainComponent {
    public constructor(private authService: AuthService, private router: Router) {}

    public goToLogin(): void {
        if (this.authService.isAuthenticated()) {
            this.authService.logout();
        } else {
            this.router.navigate([`login`]);
        }
    }
}
