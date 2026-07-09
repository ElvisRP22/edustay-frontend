import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { forkJoin } from 'rxjs';
import { EDUSTAY_ICONS } from '../../../core/icons';
import {
    RolePermissionRequest,
    RolePermissionResponse,
    RolePermissionStatus,
    RolesPermissionsSummaryResponse
} from '../../../core/models/api.models';
import { AdminService } from '../../../core/services/admin.service';

type PermissionArea = 'Accesos' | 'Usuarios' | 'Operación' | 'Moderación';

interface PermissionItem {
    id: number;
    title: string;
    description: string;
    area: PermissionArea;
    icon: string;
}

interface RoleItem {
    id: number;
    name: string;
    description: string;
    color: string;
    status: RolePermissionStatus;
    users: number;
    updatedAt: string;
    permissions: number[];
}

interface RoleFormValue {
    name: string;
    description: string;
    color: string;
    status: RolePermissionStatus;
    users: number;
}

@Component({
    selector: 'app-roles-permisos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgIcon],
    providers: [provideIcons(EDUSTAY_ICONS)],
    templateUrl: './roles-permisos.component.html',
    styleUrl: './roles-permisos.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesPermisosComponent {
    @Output() readonly back = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private adminSvc = inject(AdminService);

    readonly searchTerm = signal('');
    readonly selectedRoleId = signal<number | null>(null);
    readonly permissions = signal<PermissionItem[]>([]);
    readonly roles = signal<RoleItem[]>([]);
    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly summary = signal<RolesPermissionsSummaryResponse | null>(null);

    readonly roleForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required, Validators.minLength(12)]],
        color: ['#1d4ed8', [Validators.required]],
        status: ['ACTIVO' as RolePermissionStatus, [Validators.required]],
        users: [0, [Validators.min(0)]]
    });

    readonly roleFormTitle = computed(() => this.selectedRole() ? 'Editar plantilla' : 'Crear plantilla');

    readonly filteredRoles = computed(() => {
        const query = this.searchTerm().trim().toLowerCase();
        if (!query) {
            return this.roles();
        }

        return this.roles().filter(role =>
            `${role.name} ${role.description}`.toLowerCase().includes(query)
        );
    });

    readonly selectedRole = computed(() => {
        const selectedId = this.selectedRoleId();
        if (selectedId === null) {
            return this.roles()[0] ?? null;
        }

        const selected = this.roles().find(role => role.id === selectedId);
        return selected ?? this.roles()[0] ?? null;
    });

    readonly groupedPermissions = computed(() => {
        const groups: Record<PermissionArea, PermissionItem[]> = {
            Accesos: [],
            Usuarios: [],
            Operación: [],
            Moderación: []
        };

        for (const permission of this.permissions()) {
            groups[permission.area].push(permission);
        }

        return [
            { area: 'Accesos' as const, permissions: groups['Accesos'] },
            { area: 'Usuarios' as const, permissions: groups['Usuarios'] },
            { area: 'Operación' as const, permissions: groups['Operación'] },
            { area: 'Moderación' as const, permissions: groups['Moderación'] }
        ];
    });

    readonly heroStats = computed(() => {
        const summary = this.summary();
        const roles = this.roles();
        const permissions = this.permissions();
        const selected = this.selectedRole();

        return [
            { label: 'Roles activos', value: summary?.rolesActivos?.toString() ?? roles.length.toString() },
            { label: 'Permisos disponibles', value: summary?.permisosDisponibles?.toString() ?? permissions.length.toString() },
            { label: 'Permisos del rol', value: selected?.permissions.length.toString() ?? '0' },
            { label: 'Usuarios cubiertos', value: summary?.usuariosCubiertos?.toString() ?? roles.reduce((sum, role) => sum + role.users, 0).toString() }
        ];
    });

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        forkJoin({
            roles: this.adminSvc.getRolesPermisos(),
            permissions: this.adminSvc.getCatalogoPermisos(),
            summary: this.adminSvc.getResumenRolesPermisos()
        })
            .subscribe({
                next: ({ roles, permissions, summary }) => {
                    this.roles.set(roles);
                    this.permissions.set(permissions.map(permission => ({
                        id: permission.id,
                        title: permission.title,
                        description: permission.description,
                        area: permission.area as PermissionArea,
                        icon: permission.icon
                    })));
                    this.summary.set(summary);
                    this.selectedRoleId.set(roles[0]?.id ?? null);
                    this.isLoading.set(false);
                },
                error: err => {
                    console.error('Error cargando roles y permisos', err);
                    this.errorMessage.set('No fue posible cargar los roles y permisos desde el backend.');
                    this.isLoading.set(false);
                }
            });
    }

    selectRole(roleId: number): void {
        this.selectedRoleId.set(roleId);
    }

    isPermissionEnabled(permissionId: number): boolean {
        return this.selectedRole()?.permissions.includes(permissionId) ?? false;
    }

    togglePermission(permissionId: number): void {
        const role = this.selectedRole();
        if (!role) {
            return;
        }

        this.adminSvc.alternarPermiso(role.id, permissionId).subscribe({
            next: updatedRole => this.replaceRole(updatedRole),
            error: err => console.error('Error al actualizar el permiso', err)
        });
    }

    createRole(): void {
        if (this.roleForm.invalid) {
            this.roleForm.markAllAsTouched();
            return;
        }

        const value = this.roleForm.getRawValue() as RoleFormValue;
        const payload: RolePermissionRequest = {
            name: value.name.trim(),
            description: value.description.trim(),
            color: value.color,
            status: value.status,
            users: Number(value.users ?? 0),
            permissions: []
        };

        this.adminSvc.crearRol(payload).subscribe({
            next: nextRole => {
                this.roles.update(prev => [this.toRoleItem(nextRole), ...prev]);
                this.selectedRoleId.set(nextRole.id);
                this.roleForm.reset({
                    name: '',
                    description: '',
                    color: '#1d4ed8',
                    status: 'ACTIVO',
                    users: 0
                });
            },
            error: err => console.error('Error al crear el rol', err)
        });
    }

    resetSelectedRole(): void {
        const role = this.selectedRole();
        if (!role) {
            return;
        }

        this.adminSvc.restaurarPermisos(role.id).subscribe({
            next: updatedRole => this.replaceRole(updatedRole),
            error: err => console.error('Error al restaurar permisos', err)
        });
    }

    formatDate(value: string): string {
        return new Date(value).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    private replaceRole(updatedRole: RolePermissionResponse): void {
        const normalized = this.toRoleItem(updatedRole);
        this.roles.update(prev => prev.map(item => item.id === normalized.id ? normalized : item));
        this.selectedRoleId.set(normalized.id);
    }

    private toRoleItem(role: RolePermissionResponse): RoleItem {
        return {
            id: role.id,
            name: role.name,
            description: role.description,
            color: role.color,
            status: role.status,
            users: role.users,
            updatedAt: role.updatedAt,
            permissions: role.permissions ?? []
        };
    }

    hasRoleError(field: 'name' | 'description' | 'color' | 'status' | 'users'): boolean {
        const control = this.roleForm.get(field);
        return !!control && control.invalid && (control.touched || control.dirty);
    }
}