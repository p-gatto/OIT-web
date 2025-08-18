import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { NotesService } from '../notes.service';
import { CreateNote, Note, UpdateNote } from '../note.models';

@Component({
  selector: 'app-note-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './note-dialog.component.html',
  styleUrl: './note-dialog.component.css'
})
export class NoteDialogComponent {

  fb = inject(FormBuilder);
  notesService = inject(NotesService);
  snackBar = inject(MatSnackBar);

  noteForm: FormGroup;
  isEditMode = false;
  saving = false;

  // Predefined options
  predefinedAreas = [
    'Sviluppo',
    'DevOps',
    'Database',
    'Sistemi',
    'Networking',
    'Sicurezza',
    'Cloud',
    'Mobile',
    'Web',
    'Desktop',
    'Testing',
    'Documentazione',
    'Procedura',
    'Troubleshooting'
  ];

  categoryMapping: { [key: string]: string[] } = {
    'Sviluppo': ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'Desktop', 'API'],
    'DevOps': ['CI/CD', 'Deployment', 'Monitoring', 'Infrastructure', 'Automation'],
    'Database': ['SQL Server', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle'],
    'Sistemi': ['Windows', 'Linux', 'macOS', 'Server Management', 'Virtualizzazione'],
    'Networking': ['Configurazione', 'Troubleshooting', 'Security', 'Monitoring'],
    'Sicurezza': ['Authentication', 'Authorization', 'Encryption', 'Vulnerability'],
    'Cloud': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
    'Mobile': ['Android', 'iOS', 'React Native', 'Flutter', 'Xamarin'],
    'Web': ['HTML/CSS', 'JavaScript', 'Frameworks', 'SEO', 'Performance'],
    'Desktop': ['WPF', 'WinForms', 'Electron', 'Qt', 'GTK'],
    'Testing': ['Unit Testing', 'Integration', 'E2E', 'Performance', 'Security'],
    'Documentazione': ['API Docs', 'User Manual', 'Technical Specs', 'Changelog'],
    'Procedura': ['Setup', 'Deployment', 'Maintenance', 'Backup', 'Recovery'],
    'Troubleshooting': ['Bug Fixing', 'Performance', 'Error Handling', 'Debugging']
  };

  subCategoryMapping: { [key: string]: string[] } = {
    'Frontend': ['React', 'Angular', 'Vue', 'HTML/CSS', 'JavaScript', 'TypeScript'],
    'Backend': ['Node.js', '.NET', 'Python', 'Java', 'PHP', 'Ruby'],
    'CI/CD': ['Jenkins', 'GitHub Actions', 'Azure DevOps', 'GitLab CI', 'TeamCity'],
    'SQL Server': ['Query Optimization', 'Stored Procedures', 'Maintenance', 'Backup'],
    'Windows': ['PowerShell', 'Registry', 'Services', 'Group Policy', 'IIS'],
    'Linux': ['Bash', 'System Admin', 'Package Management', 'Cron Jobs', 'Apache'],
    'AWS': ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFormation'],
    'Azure': ['App Service', 'SQL Database', 'Functions', 'DevOps', 'AD'],
    'Docker': ['Containerization', 'Dockerfile', 'Compose', 'Registry', 'Swarm'],
    'JavaScript': ['ES6+', 'Async/Await', 'DOM', 'Events', 'Modules'],
    'API Docs': ['OpenAPI', 'Swagger', 'Postman', 'REST', 'GraphQL']
  };

  noteTypes = [
    'Comando',
    'Procedura',
    'Informazione Generica',
    'Nota Tecnica',
    'Tutorial',
    'Snippet di Codice',
    'Configurazione',
    'Risoluzione Problema'
  ];

  constructor(
    private dialogRef: MatDialogRef<NoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Note | null
  ) {
    this.isEditMode = !!data;
    this.noteForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.populateForm(this.data);
    }

    // Watch for area changes to update categories
    this.noteForm.get('area')?.valueChanges.subscribe(() => {
      this.noteForm.get('category')?.setValue('');
      this.noteForm.get('subCategory')?.setValue('');
    });

    // Watch for category changes to update subcategories
    this.noteForm.get('category')?.valueChanges.subscribe(() => {
      this.noteForm.get('subCategory')?.setValue('');
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(500)]],
      description: ['', [Validators.maxLength(1000)]],
      area: ['', Validators.required],
      category: ['', Validators.required],
      subCategory: ['', Validators.required],
      type: ['', Validators.required],
      freeText: ['', [Validators.maxLength(5000)]],
      isFavorite: [false]
    });
  }

  private populateForm(note: Note): void {
    this.noteForm.patchValue({
      name: note.name,
      description: note.description || '',
      area: note.area,
      category: note.category,
      subCategory: note.subCategory,
      type: note.type,
      freeText: note.freeText || '',
      isFavorite: note.isFavorite
    });
  }

  getFilteredCategories(): string[] {
    const area = this.noteForm.get('area')?.value;
    return this.categoryMapping[area] || [];
  }

  getFilteredSubCategories(): string[] {
    const category = this.noteForm.get('category')?.value;
    return this.subCategoryMapping[category] || ['Generale', 'Altro'];
  }

  onSave(): void {
    if (this.noteForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formValue = this.noteForm.value;

    if (this.isEditMode && this.data) {
      const updateData: UpdateNote = {
        name: formValue.name,
        description: formValue.description || '',
        area: formValue.area,
        category: formValue.category,
        subCategory: formValue.subCategory,
        type: formValue.type,
        freeText: formValue.freeText || '',
        isFavorite: formValue.isFavorite
      };

      this.notesService.update(this.data.id, updateData).subscribe({
        next: () => {
          this.showSnackBar('Nota aggiornata con successo');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating note:', error);
          this.showSnackBar('Errore nell\'aggiornamento della nota');
          this.saving = false;
        }
      });
    } else {
      const createData: CreateNote = {
        name: formValue.name,
        description: formValue.description || '',
        area: formValue.area,
        category: formValue.category,
        subCategory: formValue.subCategory,
        type: formValue.type,
        freeText: formValue.freeText || '',
        isFavorite: formValue.isFavorite
      };

      this.notesService.create(createData).subscribe({
        next: () => {
          this.showSnackBar('Nota creata con successo');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating note:', error);
          this.showSnackBar('Errore nella creazione della nota');
          this.saving = false;
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.noteForm.controls).forEach(key => {
      const control = this.noteForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

}