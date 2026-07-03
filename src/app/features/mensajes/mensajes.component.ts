import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajesService } from '../../core/services/mensajes.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MensajeResponse } from '../../core/models/api.models';

interface Conversacion {
  otroId: number;
  otroNombre: string;
  habitacionId: number;
  habitacionTitulo: string;
  ultimoMensaje: MensajeResponse;
  noLeidos: number;
}

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mensajes.component.html',
  styleUrl: './mensajes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MensajesComponent implements OnInit {
  private svc = inject(MensajesService);
  auth = inject(AuthService);
  private toastSvc = inject(ToastService);

  bandeja = signal<MensajeResponse[]>([]);
  loading = signal(true);
  conversacionActiva = signal<Conversacion | null>(null);
  mensajesConv = signal<MensajeResponse[]>([]);
  loadingConv = signal(false);
  nuevomsg = signal('');
  enviando = signal(false);

  // Agrupa la bandeja en conversaciones únicas por (habitacion + otroUsuario)
  conversaciones = computed<Conversacion[]>(() => {
    const yo = this.auth.user()?.id;
    const map = new Map<string, Conversacion>();
    for (const m of this.bandeja()) {
      const otroId = m.emisorId === yo ? m.receptorId : m.emisorId;
      const otroNombre = m.emisorId === yo ? m.receptorNombre : m.emisorNombre;
      const key = `${m.habitacionId}-${otroId}`;
      if (!map.has(key)) {
        map.set(key, {
          otroId, otroNombre,
          habitacionId: m.habitacionId,
          habitacionTitulo: m.habitacionTitulo,
          ultimoMensaje: m,
          noLeidos: (!m.leido && m.receptorId === yo) ? 1 : 0
        });
      } else {
        const c = map.get(key)!;
        if (!m.leido && m.receptorId === yo) c.noLeidos++;
        if (new Date(m.fechaEnvio) > new Date(c.ultimoMensaje.fechaEnvio)) c.ultimoMensaje = m;
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.ultimoMensaje.fechaEnvio).getTime() - new Date(a.ultimoMensaje.fechaEnvio).getTime()
    );
  });

  ngOnInit() {
    this.svc.getBandeja().subscribe({
      next: data => { this.bandeja.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirConv(c: Conversacion) {
    this.conversacionActiva.set(c);
    this.loadingConv.set(true);
    this.svc.getConversacion(c.habitacionId, c.otroId).subscribe({
      next: msgs => {
        this.mensajesConv.set(msgs);
        this.loadingConv.set(false);
        this.svc.marcarLeidos(c.habitacionId, c.otroId).subscribe();
      },
      error: () => this.loadingConv.set(false)
    });
  }

  enviar() {
    const c = this.conversacionActiva();
    const txt = this.nuevomsg().trim();
    if (!c || !txt) return;
    this.enviando.set(true);
    this.svc.enviar({
      receptorId: c.otroId,
      habitacionId: c.habitacionId,
      contenido: txt
    }).subscribe({
      next: m => {
        this.mensajesConv.update(arr => [...arr, m]);
        this.nuevomsg.set('');
        this.enviando.set(false);
      },
      error: err => {
        this.enviando.set(false);
        this.toastSvc.error(err?.error?.message || 'Error al enviar el mensaje');
      }
    });
  }

  get yo() { return this.auth.user()?.id; }
}
