import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>, // Inject MatDialogRef
    @Inject(MAT_DIALOG_DATA) public data: any // Keep the data injection
  ) {}

  onNoClick(): void {
    // Close the dialog
    this.dialogRef.close();
  }
}