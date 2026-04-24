import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-estudiante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro-estudiante.html',
  styleUrl: './registro-estudiante.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroEstudianteComponent {
  private fb = inject(FormBuilder);
  registroForm: FormGroup;
  showPassword = false;

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      universidad: ['', [Validators.required]],
      carrera: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      terminos: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador para que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registroForm.valid) {
      console.log('Registro de estudiante exitoso:', this.registroForm.value);
      // Aquí iría la llamada a tu servicio de API
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}