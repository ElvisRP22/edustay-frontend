import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PerfilService } from '../../core/services/perfil.service';
import { DocumentosService } from '../../core/services/documentos.service';
import { AuthService } from '../../core/services/auth.service';
import {
  DocumentoVerificacionRequest,
  PerfilEstudianteResponse,
  PerfilVerificacionResponse,
  TipoDocumento,
  VerificacionAdminResponse,
  VerificacionRequest,
  VerificacionResponse
} from '../../core/models/api.models';
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
  private destroyRef = inject(DestroyRef);
  private perfilSvc = inject(PerfilService);
  private docSvc = inject(DocumentosService);
  private router = inject(Router);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly tipoDocumentos: readonly TipoDocumento[] = [
    'CARNET_FISICO',
    'APP_UTP_SCREENSHOT',
    'DNI',
    'RECIBO_LUZ',
    'RECIBO_AGUA',
    'REPORTE_POLICIAL',
    'CONTRATO_PROPIEDAD'
  ];

  verification = signal<PerfilVerificacionResponse | null>(null);
  documentos = signal<VerificacionResponse[]>([]);
  documentosPendientesAdmin = signal<VerificacionAdminResponse[]>([]);
  loading = signal(true);
  verifyingDocs = signal(true);
  saving = signal(false);
  uploading = signal(false);
  adminLoading = signal(false);
  adminSavingId = signal<number | null>(null);
  saveOk = signal(false);
  uploadOk = signal(false);
  errorMsg = signal<string | null>(null);
  saveError = signal<string | null>(null);
  uploadError = signal<string | null>(null);
  adminError = signal<string | null>(null);
  adminComment = signal('');

  form: FormGroup = this.fb.group({
    carrera: ['', [Validators.required, Validators.minLength(1)]],
    ciclo: ['', [Validators.min(1), Validators.max(10)]],
    preferenciasConvivencia: [''],
    fotoCarnetUrl: ['']
  });

  documentForm: FormGroup = this.fb.group({
    tipo: ['CARNET_FISICO' as TipoDocumento, [Validators.required]],
    archivoUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\//i)]]
  });

  ngOnInit(): void {
    this.loadVerification();
  }

  loadVerification(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.perfilSvc.getVerificacion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: verification => {
          this.verification.set(verification);
          this.applyVerificationToForm(verification);
          this.loading.set(false);
          this.loadDocumentos();

          if (this.auth.isAdmin()) {
            this.loadPendientesAdmin();
          }
        },
        error: err => this.handleHttpError(err, 'No se pudo cargar el estado de verificación.')
      });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveOk.set(false);
    this.saveError.set(null);
    this.errorMsg.set(null);

    const payload: PerfilEstudianteResponse = this.form.getRawValue() as PerfilEstudianteResponse;

    this.perfilSvc.guardarMiPerfil({
      carrera: payload.carrera ?? '',
      ciclo: payload.ciclo ? Number(payload.ciclo) : undefined,
      preferenciasConvivencia: payload.preferenciasConvivencia ?? '',
      fotoCarnetUrl: payload.fotoCarnetUrl ?? ''
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saveOk.set(true);
          this.loadVerification();
        },
        error: err => {
          this.saving.set(false);
          if (this.redirectToLoginIfNeeded(err)) {
            return;
          }

          this.saveError.set(
            err instanceof HttpErrorResponse && err.error?.message
              ? err.error.message
              : 'Error al guardar el perfil.'
          );
        }
      });
  }

  subirDocumento(): void {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }

    this.uploading.set(true);
    this.uploadOk.set(false);
    this.uploadError.set(null);

    const payload = this.documentForm.getRawValue() as DocumentoVerificacionRequest;

    this.docSvc.subirDocumento(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.uploadOk.set(true);
          this.documentForm.patchValue({ archivoUrl: '' });
          this.loadVerification();
        },
        error: err => {
          this.uploading.set(false);
          this.handleHttpError(err, 'No se pudo subir el documento.');
        }
      });
  }

  resolverDocumento(documentoId: number, estado: 'VERIFICADO' | 'RECHAZADO'): void {
    this.adminSavingId.set(documentoId);
    this.adminError.set(null);

    const payload: VerificacionRequest = {
      estado,
      comentarioAdmin: this.adminComment().trim() || undefined
    };

    this.docSvc.actualizarEstado(documentoId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.adminSavingId.set(null);
          this.loadVerification();
          this.loadPendientesAdmin();
        },
        error: err => {
          this.adminSavingId.set(null);
          if (!this.redirectToLoginIfNeeded(err)) {
            if (err instanceof HttpErrorResponse && err.status === 403) {
              this.adminError.set('No tienes rol ADMIN para aprobar o rechazar documentos.');
            } else {
              this.adminError.set(err?.error?.message ?? 'No se pudo actualizar la verificación.');
            }
          }
        }
      });
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_PROCESO: 'En proceso',
      VERIFICADO: 'Verificado',
      RECHAZADO: 'Rechazado'
    };
    return map[estado] ?? estado;
  }

  showProfileForm(): boolean {
    return !(this.verification()?.perfilCompleto ?? false) && this.auth.isEstudiante();
  }

  showUploadSection(): boolean {
    const verification = this.verification();
    if (!verification || !this.auth.isEstudiante()) {
      return false;
    }

    return verification.totalDocumentos === 0 || verification.documentosRechazados > 0;
  }

  showReviewState(): boolean {
    const verification = this.verification();
    if (!verification) {
      return false;
    }

    return verification.documentosPendientes > 0 || verification.identidadVerificada === 'EN_PROCESO';
  }

  showVerifiedState(): boolean {
    return this.verification()?.identidadVerificada === 'VERIFICADO';
  }

  showRejectedState(): boolean {
    return (this.verification()?.documentosRechazados ?? 0) > 0;
  }

  canShowDocuments(): boolean {
    return this.auth.isEstudiante();
  }

  private loadDocumentos(): void {
    this.verifyingDocs.set(true);
    this.docSvc.getMisDocumentos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: docs => {
          this.documentos.set(docs);
          this.verifyingDocs.set(false);
        },
        error: err => {
          this.verifyingDocs.set(false);
          this.handleHttpError(err, 'No se pudieron cargar tus documentos.');
        }
      });
  }

  private loadPendientesAdmin(): void {
    this.adminLoading.set(true);
    this.docSvc.getPendientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: pendientes => {
          this.documentosPendientesAdmin.set(pendientes);
          this.adminLoading.set(false);
        },
        error: err => {
          this.adminLoading.set(false);
          if (err instanceof HttpErrorResponse && err.status === 403) {
            this.adminError.set('No tienes rol ADMIN para revisar verificaciones.');
            return;
          }

          this.handleHttpError(err, 'No se pudieron cargar las verificaciones pendientes.');
        }
      });
  }

  private applyVerificationToForm(verification: PerfilVerificacionResponse): void {
    this.form.patchValue({
      carrera: verification.carrera ?? '',
      ciclo: verification.ciclo ?? '',
      preferenciasConvivencia: '',
      fotoCarnetUrl: verification.fotoCarnetUrl ?? ''
    });
  }

  private handleHttpError(err: unknown, fallback: string): void {
    if (this.redirectToLoginIfNeeded(err)) {
      return;
    }

    const message = err instanceof HttpErrorResponse && err.error?.message
      ? err.error.message
      : fallback;

    if (this.showProfileForm()) {
      this.errorMsg.set(message);
    } else if (this.showUploadSection()) {
      this.uploadError.set(message);
    } else {
      this.errorMsg.set(message);
    }
  }

  private redirectToLoginIfNeeded(err: unknown): boolean {
    if (err instanceof HttpErrorResponse && err.status === 401) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return true;
    }

    return false;
  }
}