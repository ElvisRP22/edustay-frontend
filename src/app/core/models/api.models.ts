// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
}

export type UserRole = 'ADMIN' | 'ESTUDIANTE' | 'ARRENDADOR';

export interface AuthResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fotoUrl?: string;
  rol: UserRole;
  token: string;
  message?: string;
}

// ─── Habitaciones ────────────────────────────────────────────────────────────

export type HabitacionEstado = 'DISPONIBLE' | 'OCUPADO' | 'MANTENIMIENTO' | 'SUSPENDIDO';

export interface HabitacionCatalogItem {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface HabitacionRequest {
  titulo: string;
  descripcion: string;
  precio: number;
  direccion: string;
  latitud: number;
  longitud: number;
  servicioIds: number[];
  reglaIds: number[];
}

export interface HabitacionResponse {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  direccion: string;
  latitud: number;
  longitud: number;
  distanciaUtpMinutos?: number;
  estado: HabitacionEstado;
  fechaPublicacion: string;
  arrendadorId: number;
  arrendadorNombre: string;
  servicios?: HabitacionCatalogItem[];
  reglas?: HabitacionCatalogItem[];
}

// ─── Alquileres ───────────────────────────────────────────────────────────────

export interface AlquilerRequest {
  habitacionId: number;
  montoPactado: number;
  fechaInicio?: string;
}

export interface AlquilerResponse {
  id: number;
  habitacionId: number;
  habitacionTitulo: string;
  habitacionDireccion: string;
  estudianteId: number;
  estudianteNombre: string;
  arrendadorId: number;
  arrendadorNombre: string;
  montoPactado: number;
  fechaInicio: string;
  fechaRegistro: string;
}

// ─── Reseñas ──────────────────────────────────────────────────────────────────

export interface ResenaRequest {
  calificacion: number; // 1-5
  comentario?: string;
  habitacionId: number;
}

export interface ResenaResponse {
  id: number;
  calificacion: number;
  comentario?: string;
  fecha: string;
  estudianteId: number;
  estudianteNombre: string;
  habitacionId: number;
  habitacionTitulo: string;
}

// ─── Mensajes ─────────────────────────────────────────────────────────────────

export interface MensajeRequest {
  receptorId: number;
  habitacionId: number;
  contenido: string;
}

export interface MensajeResponse {
  id: number;
  emisorId: number;
  emisorNombre: string;
  receptorId: number;
  receptorNombre: string;
  habitacionId: number;
  habitacionTitulo: string;
  contenido: string;
  leido: boolean;
  fechaEnvio: string;
}

// ─── Reportes ─────────────────────────────────────────────────────────────────

export type ReporteEstado = 'ABIERTO' | 'EN_REVISION' | 'RESUELTO' | 'DESESTIMADO';

export interface ReporteRequest {
  habitacionId: number;
  motivo: string;
  descripcion: string;
}

export interface ReporteResponse {
  id: number;
  emisorId: number;
  emisorNombre: string;
  habitacionId: number;
  habitacionTitulo: string;
  motivo: string;
  descripcion: string;
  estado: ReporteEstado;
  fecha: string;
}

// ─── Perfil de Estudiante ─────────────────────────────────────────────────────

export type IdentidadVerificadaEstado = 'PENDIENTE' | 'EN_PROCESO' | 'VERIFICADO' | 'RECHAZADO';

export interface PerfilEstudianteRequest {
  carrera: string;
  ciclo?: number;
  preferenciasConvivencia?: string;
  fotoCarnetUrl?: string;
}

export interface PerfilEstudianteResponse {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  dni?: string;
  fotoUrl?: string;
  emailVerificado: boolean;
  identidadVerificada: IdentidadVerificadaEstado;
  carrera?: string;
  ciclo?: number;
  universidad?: string;
  preferenciasConvivencia?: string;
  fotoCarnetUrl?: string;
}

export interface PerfilVerificacionResponse {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  emailVerificado: boolean;
  identidadVerificada: IdentidadVerificadaEstado;
  perfilCompleto: boolean;
  perfilRegistrado: boolean;
  carrera?: string;
  ciclo?: number;
  universidad?: string;
  fotoCarnetUrl?: string;
  totalDocumentos: number;
  documentosPendientes: number;
  documentosVerificados: number;
  documentosRechazados: number;
  siguientePaso?: string;
}

// ─── Documentos de Verificación ───────────────────────────────────────────────

export type TipoDocumento =
  | 'CARNET_FISICO'
  | 'APP_UTP_SCREENSHOT'
  | 'DNI'
  | 'RECIBO_LUZ'
  | 'RECIBO_AGUA'
  | 'REPORTE_POLICIAL'
  | 'CONTRATO_PROPIEDAD';

export interface DocumentoVerificacionRequest {
  tipo: TipoDocumento;
  archivoUrl: string;
}

export interface VerificacionResponse {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;
  tipo: TipoDocumento;
  archivoUrl: string;
  fechaSubida: string;
  estado: IdentidadVerificadaEstado;
  comentarioAdmin?: string;
  identidadVerificadaUsuario: IdentidadVerificadaEstado;
}

export interface VerificacionRequest {
  estado: 'VERIFICADO' | 'RECHAZADO';
  comentarioAdmin?: string;
}

export interface VerificacionAdminResponse {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;
  tipo: TipoDocumento;
  archivoUrl: string;
  fechaSubida: string;
  estado: IdentidadVerificadaEstado;
  comentarioAdmin?: string;
  identidadVerificadaUsuario: IdentidadVerificadaEstado;
}
