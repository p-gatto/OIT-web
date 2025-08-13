import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Credential } from "../../models/credential.model";

@Component({
  selector: 'app-credential-dialog',
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './credential-dialog.component.html',
  styleUrl: './credential-dialog.component.css'
})
export class CredentialDialogComponent {

  credentialForm: FormGroup;
  isEditMode: boolean;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CredentialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Credential
  ) {
    this.isEditMode = !!data.id;

    this.credentialForm = this.fb.group({
      id: [data.id],
      name: [data.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [data.description || '', Validators.maxLength(500)],
      username: [data.username || '', [Validators.required, Validators.maxLength(100)]],
      password: [data.password || '', [Validators.required, Validators.maxLength(255)]],
      email: [data.email || '', [Validators.email, Validators.maxLength(255)]],
      url: [data.url || '', [Validators.maxLength(500)]],
      active: [data.active !== undefined ? data.active : true],
      expired: [data.expired !== undefined ? data.expired : false]
    });
  }

  onSubmit(): void {
    if (this.credentialForm.valid) {
      this.dialogRef.close(this.credentialForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';

    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    this.credentialForm.patchValue({ password });
  }
}