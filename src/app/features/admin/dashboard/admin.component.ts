import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AlquilerResponse, MensajeResponse, ReporteResponse, UsuarioAdminResponse, VerificacionAdminResponse, VerificacionRequest } from '../../../core/models/api.models';
import { AdminService } from '../../../core/services/admin.service';
import { AlquileresService } from '../../../core/services/alquileres.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentosService } from '../../../core/services/documentos.service';
import { ReportesService } from '../../../core/services/reportes.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private docSvc = inject(DocumentosService);
  private reportesSvc = inject(ReportesService);
  private alquileresSvc = inject(AlquileresService);
  private adminSvc = inject(AdminService);
  auth = inject(AuthService);

  stats = {
    usuarios: '0',
    usuariosCrecimiento: '+12%',
    clientes: '0',
    clientesCrecimiento: '+8%',
    arrendadores: '0',
    arrendadoresCrecimiento: '+15%',
    pendientes: '0',
    reportes: '0',
    alquileres: '0'
  };

  activeTab = signal<'dashboard' | 'verificaciones' | 'reportes' | 'alquileres' | 'configuracion' | 'usuarios' | 'moderacion'>('dashboard');
  showProfileMenu = signal(false);
  moderacionSubTab = signal<'activas' | 'historial'>('activas');

  pendientes = signal<VerificacionAdminResponse[]>([]);
  reportes = signal<ReporteResponse[]>([]);
  alquileres = signal<AlquilerResponse[]>([]);
  usuarios = signal<UsuarioAdminResponse[]>([]);
  mensajesReportados = signal<MensajeResponse[]>([]);
  mensajesHistorial = signal<MensajeResponse[]>([]);

  // Comentarios inline para verificaciones de documentos
  comentarios = signal<Record<number, string>>({});

  adminSavingId = signal<number | null>(null);

  ngOnInit() {
    this.loadPendientes();
    this.loadReportes();
    this.loadAlquileres();
    this.loadUsuarios();
    this.loadMensajesReportados();
    this.loadMensajesHistorial();
  }

  setTab(tab: 'dashboard' | 'verificaciones' | 'reportes' | 'alquileres' | 'configuracion' | 'usuarios' | 'moderacion') {
    this.activeTab.set(tab);
  }

  toggleProfileMenu() {
    this.showProfileMenu.update(v => !v);
  }

  logout() {
    this.auth.logout();
  }

  loadPendientes() {
    this.docSvc.getPendientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.pendientes.set(data);
          this.stats.pendientes = data.length.toString();
        },
        error: err => console.error('Error cargando pendientes', err)
      });
  }

  loadReportes() {
    this.reportesSvc.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.reportes.set(data);
          this.stats.reportes = data.length.toString();
        },
        error: err => console.error('Error cargando reportes', err)
      });
  }

  loadAlquileres() {
    this.alquileresSvc.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.alquileres.set(data);
          this.stats.alquileres = data.length.toString();
        },
        error: err => console.error('Error cargando alquileres', err)
      });
  }

  loadUsuarios() {
    this.adminSvc.getUsuarios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.usuarios.set(data);
          this.stats.usuarios = data.length.toString();
          this.stats.clientes = data.filter(u => u.rol === 'ESTUDIANTE').length.toString();
          this.stats.arrendadores = data.filter(u => u.rol === 'ARRENDADOR').length.toString();
        },
        error: err => console.error('Error cargando usuarios', err)
      });
  }

  resolverDocumento(documentoId: number, estado: 'VERIFICADO' | 'RECHAZADO') {
    this.adminSavingId.set(documentoId);
    const comment = this.comentarios()[documentoId] || '';
    const payload: VerificacionRequest = {
      estado,
      comentarioAdmin: comment.trim() || undefined
    };

    this.docSvc.actualizarEstado(documentoId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.adminSavingId.set(null);
          // Limpiar comentario
          this.comentarios.update(prev => {
            const next = { ...prev };
            delete next[documentoId];
            return next;
          });
          this.loadPendientes();
        },
        error: err => {
          this.adminSavingId.set(null);
          console.error('Error al resolver documento', err);
        }
      });
  }

  updateComentario(documentoId: number, text: string) {
    this.comentarios.update(prev => ({
      ...prev,
      [documentoId]: text
    }));
  }

  resolverReporte(reporteId: number, estado: 'RESUELTO' | 'DESESTIMADO' | 'EN_REVISION') {
    this.reportesSvc.actualizarEstado(reporteId, estado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadReportes();
        },
        error: err => console.error('Error al actualizar estado del reporte', err)
      });
  }

  finalizarAlquiler(alquilerId: number) {
    if (confirm('¿Estás seguro de que deseas finalizar este alquiler de forma permanente? La habitación quedará disponible.')) {
      this.alquileresSvc.finalizar(alquilerId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadAlquileres();
          },
          error: err => console.error('Error al finalizar alquiler', err)
        });
    }
  }

  cambiarRol(usuarioId: number, nuevoRol: string) {
    this.adminSvc.cambiarRol(usuarioId, nuevoRol)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadUsuarios();
        },
        error: err => console.error('Error al cambiar rol', err)
      });
  }

  eliminarUsuario(usuarioId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esta acción borrará su cuenta.')) {
      this.adminSvc.eliminarUsuario(usuarioId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadUsuarios();
          },
          error: err => console.error('Error al eliminar usuario', err)
        });
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatType(typeStr: string): string {
    if (!typeStr) return '-';
    return typeStr.replace(/_/g, ' ').toLowerCase();
  }

  loadMensajesReportados() {
    this.adminSvc.getMensajesReportados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.mensajesReportados.set(data),
        error: err => console.error('Error cargando mensajes reportados', err)
      });
  }

  loadMensajesHistorial() {
    this.adminSvc.getHistorialModeracion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.mensajesHistorial.set(data),
        error: err => console.error('Error cargando historial de moderación', err)
      });
  }

  desestimarMensaje(mensajeId: number) {
    this.adminSvc.desestimarMensaje(mensajeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadMensajesReportados();
          this.loadMensajesHistorial();
        },
        error: err => console.error('Error al desestimar mensaje', err)
      });
  }

  eliminarMensaje(mensajeId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje de forma permanente del historial de chat?')) {
      this.adminSvc.eliminarMensaje(mensajeId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadMensajesReportados();
            this.loadMensajesHistorial();
          },
          error: err => console.error('Error al eliminar mensaje', err)
        });
    }
  }
}