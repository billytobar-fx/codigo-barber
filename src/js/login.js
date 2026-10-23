import { supabase } from './supabase.js';
import { ADMIN_EMAIL } from './admin-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('rememberMe');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const loginMessage = document.getElementById('loginMessage');

  if (!loginForm || !emailInput || !passwordInput || !rememberCheckbox || !forgotPasswordLink || !loginMessage) {
    return;
  }

  const showMessage = message => {
    loginMessage.textContent = message;
    loginMessage.classList.toggle('is-error', Boolean(message));
  };

  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberCheckbox.checked = true;
  }

  if (new URLSearchParams(window.location.search).get('passwordReset') === 'success') {
    showMessage('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    showMessage('');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (rememberCheckbox.checked) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showMessage(`No fue posible iniciar sesión: ${error.message}`);
        return;
      }

      if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.error('No se pudo cerrar la sesión de un usuario sin acceso al panel:', signOutError);
        }
        showMessage('Esta cuenta no tiene acceso al panel administrativo.');
        return;
      }

      sessionStorage.removeItem('passwordRecoveryActive');
      localStorage.removeItem('barberSession');
      window.location.assign('/dashboard.html');
    } catch (error) {
      console.error('Error de red al iniciar sesión:', error);
      showMessage('No se pudo conectar con el servicio de autenticación. Inténtalo de nuevo.');
    }
  });

  forgotPasswordLink.addEventListener('click', async event => {
    event.preventDefault();
    showMessage('');

    const email = emailInput.value.trim();
    if (!email || !emailInput.checkValidity()) {
      showMessage('Ingresa un correo electrónico válido para recuperar la contraseña.');
      emailInput.focus();
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: new URL('/reset-password.html', window.location.origin).toString()
      });

      if (error) {
        showMessage(`No fue posible enviar el correo de recuperación: ${error.message}`);
        return;
      }

      showMessage('Si el correo corresponde a una cuenta, recibirás un enlace para restablecer la contraseña.');
    } catch (error) {
      console.error('Error de red al solicitar recuperación de contraseña:', error);
      showMessage('No se pudo conectar con el servicio de recuperación. Inténtalo de nuevo.');
    }
  });
});
