import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Permission } from '../../../domain/definitions/permission';
import { PermissionGuard } from '../../guards/permission.guard';
import { MeetingsNavigationWrapperComponent } from './modules/meetings-navigation/components/meetings-navigation-wrapper/meetings-navigation-wrapper.component';

const routes: Routes = [
    {
        path: ``,
        component: MeetingsNavigationWrapperComponent,
        children: [
            {
                path: ``,
                loadChildren: () => import(`./pages/home/home.module`).then(m => m.HomeModule),
                data: { meetingPermissions: [Permission.meetingCanSeeFrontpage] },
                canLoad: [PermissionGuard]
            },
            {
                path: `agenda`,
                loadChildren: () => import(`./pages/agenda/agenda.module`).then(m => m.AgendaModule),
                data: { meetingPermissions: [Permission.agendaItemCanSee] },
                canLoad: [PermissionGuard]
            },
            {
                path: `assignments`,
                loadChildren: () => import(`./pages/assignments/assignments.module`).then(m => m.AssignmentsModule),
                data: { meetingPermissions: [Permission.assignmentCanSee] },
                canLoad: [PermissionGuard]
            },
            {
                path: `mediafiles`,
                loadChildren: () => import(`./pages/mediafiles/mediafiles.module`).then(m => m.MediafilesModule),
                data: { meetingPermissions: [Permission.mediafileCanSee] },
                canLoad: [PermissionGuard]
            },
            {
                path: `motions`,
                loadChildren: () => import(`./pages/motions/motions.module`).then(m => m.MotionsModule),
                data: { meetingPermissions: [Permission.motionCanSee] },
                canLoad: [PermissionGuard]
            },
            {
                path: `settings`,
                loadChildren: () =>
                    import(`./pages/meeting-settings/meeting-settings.module`).then(m => m.MeetingSettingsModule),
                data: { meetingPermissions: [Permission.meetingCanManageSettings] },
                canLoad: [PermissionGuard]
            },
            {
                path: `participants`,
                loadChildren: () => import(`./pages/participants/participants.module`).then(m => m.ParticipantsModule),
                data: { meetingPermissions: [Permission.userCanSee] },
                canLoad: [PermissionGuard]
            },
            {
                path: `projectors`,
                loadChildren: () => import(`./pages/projectors/projectors.module`).then(m => m.ProjectorsModule),
                data: { meetingPermissions: [Permission.projectorCanSee] },
                canLoad: [PermissionGuard]
            },
            {
                path: `polls`,
                loadChildren: () => import(`./pages/polls/polls.module`).then(m => m.PollsModule),
                // one of them is sufficient
                data: { meetingPermissions: [Permission.motionCanSee, Permission.assignmentCanSee] },
                canLoad: [PermissionGuard]
            },
            {
                path: `autopilot`,
                loadChildren: () => import(`./pages/autopilot/autopilot.module`).then(m => m.AutopilotModule),
                data: { meetingPermissions: [Permission.meetingCanSeeAutopilot] },
                canLoad: [PermissionGuard]
            },
            {
                path: `chat`,
                loadChildren: () => import(`./pages/chat/chat.module`).then(m => m.ChatModule),
                canLoad: [PermissionGuard]
            },
            {
                path: `history`,
                loadChildren: () => import(`./pages/history/history.module`).then(m => m.HistoryModule),
                canLoad: [PermissionGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MeetingsRoutingModule {}
