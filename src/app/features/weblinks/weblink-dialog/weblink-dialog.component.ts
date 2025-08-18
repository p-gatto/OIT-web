import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CreateWebLink, UpdateWebLink, WebLink } from '../weblink.models';
import { WebLinksService } from '../weblinks.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-weblink-dialog',
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
  templateUrl: './weblink-dialog.component.html',
  styleUrl: './weblink-dialog.component.css'
})
export default class WeblinkDialogComponent {

  fb = inject(FormBuilder);
  webLinksService = inject(WebLinksService);
  snackBar = inject(MatSnackBar);

  linkForm: FormGroup;
  isEditMode = false;
  saving = false;

  // Predefined options
  predefinedAreas = [
    'Lavoro',
    'Personale',
    'Studio',
    'Sviluppo',
    'Cloud',
    'Design',
    'Marketing',
    'Finanza',
    'Salute',
    'Sport',
    'Viaggi',
    'Tecnologia',
    'News',
    'Istituzione'
  ];

  categoryMapping: { [key: string]: string[] } = {
    'Lavoro': ['Produttività', 'Comunicazione', 'Project Management', 'HR', 'Documenti'],
    'Personale': ['Social', 'Shopping', 'Intrattenimento', 'Hobby', 'Famiglia'],
    'Studio': ['Ricerca', 'Corsi Online', 'Università', 'Libri', 'Tutorial'],
    'Sviluppo': ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile'],
    'Cloud': ['PaaS', 'SaaS', 'DaaS'],
    'Design': ['UI/UX', 'Grafica', 'Fotografia', 'Video', 'Illustrazione'],
    'Marketing': ['SEO', 'Social Media', 'Analytics', 'Email Marketing', 'Content'],
    'Finanza': ['Banking', 'Investimenti', 'Criptovalute', 'Budget', 'Tasse'],
    'Salute': ['Fitness', 'Nutrizione', 'Medicina', 'Benessere', 'Sport'],
    'Sport': ['Calcio', 'Tennis', 'Palestra', 'Running', 'Altri Sport'],
    'Viaggi': ['Voli', 'Hotel', 'Guide', 'Meteo', 'Trasporti'],
    'Tecnologia': ['News Tech', 'Gadgets', 'Software', 'Hardware', 'AI'],
    'News': ['Quotidiani', 'Magazine', 'Tech News', 'Sport News', 'Internazionali']
  };

  subCategoryMapping: { [key: string]: string[] } = {
    'Frontend': ['React', 'Angular', 'Vue', 'HTML/CSS', 'JavaScript'],
    'Backend': ['Node.js', '.NET', 'Python', 'Java', 'PHP'],
    'Database': ['SQL Server', 'MySQL', 'MongoDB', 'PostgreSQL', 'Redis'],
    'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'CI/CD'],
    'Mobile': ['Android', 'iOS', 'React Native', 'Flutter', 'Xamarin'],
    'UI/UX': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    'SEO': ['Google Analytics', 'Search Console', 'Keywords', 'Backlinks', 'Tools'],
    'Social Media': ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok'],
    'Banking': ['Conto Corrente', 'Carte', 'Prestiti', 'Mutui', 'Online Banking'],
    'Fitness': ['Palestra', 'Home Workout', 'Yoga', 'Pilates', 'Cardio'],
    // Aggiungi sottocategorie generiche per le altre categorie
    'Produttività': ['Task Management', 'Calendar', 'Note', 'Automazione', 'Workflow'],
    'Comunicazione': ['Email', 'Chat', 'Video Call', 'Collaboration', 'Messagging'],
    'Social': ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Altri'],
    'Shopping': ['E-commerce', 'Moda', 'Elettronica', 'Casa', 'Offerte'],
    'Ricerca': ['Google Scholar', 'Database', 'Biblioteche', 'Articoli', 'Papers'],
    'Voli': ['Booking', 'Compagnie Aeree', 'Comparatori', 'Check-in', 'Tracking'],
    'News Tech': ['TechCrunch', 'Wired', 'Ars Technica', 'The Verge', 'Altri']
  };

  constructor(
    private dialogRef: MatDialogRef<WeblinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WebLink | null
  ) {
    this.isEditMode = !!data;
    this.linkForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.populateForm(this.data);
    }

    // Watch for area changes to update categories
    this.linkForm.get('area')?.valueChanges.subscribe(() => {
      this.linkForm.get('category')?.setValue('');
      this.linkForm.get('subCategory')?.setValue('');
    });

    // Watch for category changes to update subcategories
    this.linkForm.get('category')?.valueChanges.subscribe(() => {
      this.linkForm.get('subCategory')?.setValue('');
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      url: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/)
      ]],
      title: ['', [Validators.required, Validators.maxLength(500)]],
      description: ['', [Validators.maxLength(1000)]],
      area: ['', Validators.required],
      category: ['', Validators.required],
      subCategory: ['', Validators.required],
      isFavorite: [false]
    });
  }

  private populateForm(link: WebLink): void {
    this.linkForm.patchValue({
      url: link.url,
      title: link.title,
      description: link.description || '',
      area: link.area,
      category: link.category,
      subCategory: link.subCategory,
      isFavorite: link.isFavorite
    });
  }

  getFilteredCategories(): string[] {
    const area = this.linkForm.get('area')?.value;
    return this.categoryMapping[area] || [];
  }

  getFilteredSubCategories(): string[] {
    const category = this.linkForm.get('category')?.value;
    return this.subCategoryMapping[category] || ['Generale', 'Altro'];
  }

  onSave(): void {
    if (this.linkForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formValue = this.linkForm.value;

    if (this.isEditMode && this.data) {
      const updateData: UpdateWebLink = {
        url: formValue.url,
        title: formValue.title,
        description: formValue.description || '',
        area: formValue.area,
        category: formValue.category,
        subCategory: formValue.subCategory,
        isFavorite: formValue.isFavorite
      };

      this.webLinksService.update(this.data.id, updateData).subscribe({
        next: () => {
          this.showSnackBar('Link aggiornato con successo');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating link:', error);
          this.showSnackBar('Errore nell\'aggiornamento del link');
          this.saving = false;
        }
      });
    } else {
      const createData: CreateWebLink = {
        url: formValue.url,
        title: formValue.title,
        description: formValue.description || '',
        area: formValue.area,
        category: formValue.category,
        subCategory: formValue.subCategory,
        isFavorite: formValue.isFavorite
      };

      this.webLinksService.create(createData).subscribe({
        next: () => {
          this.showSnackBar('Link creato con successo');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating link:', error);
          if (error.status === 400 && error.error?.includes('URL')) {
            this.showSnackBar('URL già esistente nel database');
          } else {
            this.showSnackBar('Errore nella creazione del link');
          }
          this.saving = false;
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.linkForm.controls).forEach(key => {
      const control = this.linkForm.get(key);
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