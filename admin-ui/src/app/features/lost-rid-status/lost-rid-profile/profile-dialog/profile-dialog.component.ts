import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-profile-dialog",
  templateUrl: "./profile-dialog.component.html",
  styleUrls: ["./profile-dialog.component.scss"],
})
export class ProfileDialogComponent {
  public name: string = "";

  constructor(
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("dataSource ---------->>> ", data);
    if (data.lostData.name) {
      this.name += data.lostData.name;
    }
    console.log("name ------->>> ", this.name);
  }

  onPrint(): void {
    // Implement print functionality
  }

  onResend(): void {
    // Implement resend functionality
  }
}
