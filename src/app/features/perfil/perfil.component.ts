import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { PerfilService } from '../../core/services/perfil.service';
import { DocumentosService } from '../../core/services/documentos.service';
import { AuthService } from '../../core/services/auth.service';
import { PerfilEstudianteResponse, VerificacionResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilComponent implements OnInit {
  private perfilSvc = inject(PerfilService);
  private docSvc = inject(DocumentosService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  perfil = signal<PerfilEstudianteResponse | null>(null);
  documentos = signal<VerificacionResponse[]>([]);
  loading = signal(true);
  saving = signal(false);
  saveOk = signal(false);
  saveError = signal<string | null>(null);

  form!: FormGroup;

  ngOnInit() {
    this.perfilSvc.getMiPerfil().subscribe({
      next: p => {
        this.perfil.set(p);
        this.form = this.fb.group({
          carrera: [p.carrera ?? '', [Validators.required, Validators.minLength(1)]],
          ciclo: [p.ciclo ?? '', [Validators.min(1), Validators.max(10)]],
          preferenciasConvivencia: [p.preferenciasConvivencia ?? ''],
          fotoCarnetUrl: [p.fotoCarnetUrl ?? '']
        });
        this.loading.set(false);
      },
      error: () => {
        // Perfil aún no existe, crea formulario vacío
        this.form = this.fb.group({
          carrera: ['', [Validators.required]],
          ciclo: [''],
          preferenciasConvivencia: [''],
          fotoCarnetUrl: ['']
        });
        this.loading.set(false);
      }
    });

    this.docSvc.getMisDocumentos().subscribe({
      next: docs => this.documentos.set(docs)
    });
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveOk.set(false);
    this.saveError.set(null);
    this.perfilSvc.guardarMiPerfil(this.form.value).subscribe({
      next: p => { this.perfil.set(p); this.saving.set(false); this.saveOk.set(true); },
      error: err => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message ?? 'Error al guardar el perfil.');
      }
    });
  }

  estadoLabel(s: string) {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso',
      VERIFICADO: 'Verificado', RECHAZADO: 'Rechazado'
    };
    return map[s] ?? s;
  }
}
