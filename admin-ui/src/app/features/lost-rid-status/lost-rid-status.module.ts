import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LostRidStatusComponent } from './lost-rid-status/lost-rid-status.component';
import { LostRidStatusRoutingModule } from './lost-rid-status-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { ProfileDialogComponent } from './lost-rid-profile/profile-dialog/profile-dialog.component';
import { ConfirmDialogComponent } from './lost-rid-profile/confirm-dialog/confirm-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    LostRidStatusRoutingModule,
    SharedModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [LostRidStatusComponent, ProfileDialogComponent,  ConfirmDialogComponent],
  entryComponents: [ProfileDialogComponent,ConfirmDialogComponent]
})

export class LostRidStatusModule { }