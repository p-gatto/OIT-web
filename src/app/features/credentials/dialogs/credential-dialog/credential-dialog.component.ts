import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, RequiredValidator, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Credential } from "../../models/credential.model";

@Component({
  selector: 'app-credential-dialog',
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './credential-dialog.component.html',
  styleUrl: './credential-dialog.component.css'
})
export class CredentialDialogComponent {

  credentialForm: FormGroup;
  isEditMode: boolean;
  readOnlyMode: boolean = false;

  hidePassword = true;
  hidePasswordFirst = true;
  hidePasswordAdmin = true;
  hidePassword3DSecure = true;
  hidePasswordDispositiva = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CredentialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Credential & { readOnly?: boolean }
  ) {
    this.isEditMode = !!data.id;
    this.readOnlyMode = data.readOnly || false;

    this.credentialForm = this.fb.group({
      // Campi base
      id: [data.id],
      name: [data.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [data.description || '', Validators.maxLength(500)],
      username: [data.username || '', [Validators.required, Validators.maxLength(100)]],
      password: [data.password || '', [Validators.required, Validators.maxLength(255)]],
      email: [data.email || '', [Validators.email, Validators.maxLength(255)]],
      url: [data.url || '', [Validators.maxLength(500)]],

      // Campi profilo e identificazione
      profile: [data.profile || '', Validators.maxLength(100)],
      subject_ID: [data.subject_ID || '', Validators.maxLength(100)],
      nickname: [data.nickname || '', Validators.maxLength(100)],
      operativity: [data.operativity || '', Validators.maxLength(100)],
      area: [data.area || '', Validators.maxLength(100)],
      section: [data.section || '', Validators.maxLength(100)],
      user_Admin: [data.user_Admin || '', Validators.maxLength(100)],

      // Password aggiuntive
      password_First: [data.password_First || '', Validators.maxLength(255)],
      password_Admin: [data.password_Admin || '', Validators.maxLength(255)],
      password_3D_Secure: [data.password_3D_Secure || '', Validators.maxLength(255)],
      password_Dispositiva: [data.password_Dispositiva || '', Validators.maxLength(255)],
      password_History: [data.password_History || '', Validators.maxLength(500)],

      // Informazioni smartphone
      smartPhone_Model: [data.smartPhone_Model || '', Validators.maxLength(100)],
      smartPhone_Serial: [data.smartPhone_Serial || '', Validators.maxLength(100)],
      smartPhone_IMEI: [data.smartPhone_IMEI || '', Validators.maxLength(100)],
      smartPhone_Supplier: [data.smartPhone_Supplier || '', Validators.maxLength(100)],

      // Informazioni SIM
      sim_Serial: [data.sim_Serial || '', Validators.maxLength(100)],
      sim_Operator: [data.sim_Operator || '', Validators.maxLength(100)],

      // Informazioni bancarie e carta
      iban: [data.iban || '', Validators.maxLength(50)],
      numero_Carta: [data.numero_Carta || '', Validators.maxLength(20)],
      data_Scadenza: [data.data_Scadenza || '', Validators.maxLength(10)],

      // PIN e codici
      pin_App: [data.pin_App || '', Validators.maxLength(20)],
      pin_Carta: [data.pin_Carta || '', Validators.maxLength(20)],
      pin: [data.pin || '', Validators.maxLength(20)],
      puk: [data.puk || '', Validators.maxLength(20)],
      codice_Dispositivo: [data.codice_Dispositivo || '', Validators.maxLength(100)],
      codice_Sicurezza: [data.codice_Sicurezza || '', Validators.maxLength(100)],
      frase_Identificativa: [data.frase_Identificativa || '', Validators.maxLength(255)],

      // Informazioni macchina
      machine_IP: [data.machine_IP || '', [Validators.maxLength(15), Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)]],
      machine_Name: [data.machine_Name || '', Validators.maxLength(100)],
      machine_Type: [data.machine_Type || '', Validators.maxLength(100)],

      // Altri campi
      numero_Cliente: [data.numero_Cliente || '', Validators.maxLength(50)],
      note: [data.note || '', Validators.maxLength(1000)],
      expired_Date: [data.expired_Date ? new Date(data.expired_Date) : null, Validators.required],

      // Stati
      active: [data.active !== undefined ? data.active : true],
      expired: [data.expired !== undefined ? data.expired : false]
    });

    if (this.readOnlyMode) {
      this.credentialForm.disable();
    }
  }

  copyCredentialData(): void {
    const data = this.credentialForm.value;
    const credentialText = `Nome: ${data.name}\nUsername: ${data.username}\nPassword: ${data.password}\nEmail: ${data.email || 'N/A'}\nURL: ${data.url || 'N/A'}`;

    navigator.clipboard.writeText(credentialText).then(() => {
      console.log('Dati credenziale copiati');
      // Qui potresti mostrare un toast/snackbar di conferma
    });
  }

  switchToEditMode(): void {
    this.readOnlyMode = false;
    this.credentialForm.enable();
  }

  onSubmit(): void {

    if (this.readOnlyMode) {
      this.onCancel();
      return;
    }

    if (this.credentialForm.valid) {
      const formValue = { ...this.credentialForm.value };

      // Converte la data nel formato corretto se presente
      if (formValue.expired_Date) {
        formValue.expired_Date = formValue.expired_Date.toISOString();
      }
      console.log('Il contenuto del form-dialog crediatials: ', formValue);

      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  generatePassword(fieldName: string = 'password'): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';

    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    this.credentialForm.patchValue({ [fieldName]: password });
  }

  generatePin(fieldName: string): void {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    this.credentialForm.patchValue({ [fieldName]: pin });
  }

  generatePuk(): void {
    const puk = Math.floor(10000000 + Math.random() * 90000000).toString();
    this.credentialForm.patchValue({ puk: puk });
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'password':
        this.hidePassword = !this.hidePassword;
        break;
      case 'password_First':
        this.hidePasswordFirst = !this.hidePasswordFirst;
        break;
      case 'password_Admin':
        this.hidePasswordAdmin = !this.hidePasswordAdmin;
        break;
      case 'password_3D_Secure':
        this.hidePassword3DSecure = !this.hidePassword3DSecure;
        break;
      case 'password_Dispositiva':
        this.hidePasswordDispositiva = !this.hidePasswordDispositiva;
        break;
    }
  }
}