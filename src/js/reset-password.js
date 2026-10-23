import { supabase } from './supabase.js';
import { ADMIN_EMAIL } from './admin-auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const resetForm = document.getElementById('resetPasswordForm');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const resetMessage = document.getElementById('resetMessage');

  if (!resetForm || !newPasswordInput || !confirmPasswordInput || !resetMessage) {
    return;
  }

  let recoveryAuthorized = false;
  const showMessage = (message, isError = false) => {
    resetMessage.textContent = message;
    resetMessage.classList.toggle('is-error', isError);
  };

  const enableResetForSession = session => {
    if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
      showMessage('El enlace no es válido para una cuenta con acceso al panel. Solicita uno nuevo desde el inicio de sesión.', true);
      return;
    }

    recoveryAuthorized = true;
    sessionStorage.setItem('passwordRecoveryActive', 'true');
    resetForm.hidden = false;
    showMessage('Ingresa y confirma tu nueva contraseña.');
  };

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      enableResetForSession(session);
    }
  });

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      showMessage(`No se pudo verificar el enlace: ${error.message}`, true);
      return;
    }

    if (sessionStorage.getItem('passwordRecoveryActive') === 'true' && data.session) {
      enableResetForSession(data.session);
    } else {
      showMessage('El enlace de recuperación no es válido o ya venció. Solicita uno nuevo desde el inicio de sesión.', true);
    }
  } catch (error) {
    console.error('Error al verificar el enlace de recuperación:', error);
    showMessage('No se pudo verificar el enlace. Solicita uno nuevo desde el inicio de sesión.', true);
  }

  resetForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!recoveryAuthorized) {
      showMessage('El enlace de recuperación no está autorizado. Solicita uno nuevo.', true);
      return;
    }

    if (newPasswordInput.value !== confirmPasswordInput.value) {
      showMessage('Las contraseñas no coinciden.', true);
      confirmPasswordInput.focus();
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPasswordInput.value });
      if (error) {
        showMessage(`No se pudo actualizar la contraseña: ${error.message}`, true);
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('La contraseña se actualizó, pero no se pudo cerrar la sesión de recuperación:', signOutError);
      }

      sessionStorage.removeItem('passwordRecoveryActive');
      localStorage.removeItem('barberSession');
      window.location.replace('/login.html?passwordReset=success');
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      showMessage('No se pudo actualizar la contraseña. Inténtalo de nuevo.', true);
    }
  });
});
