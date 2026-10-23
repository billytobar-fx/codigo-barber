import { supabase } from './supabase.js';
import { mostrarAlerta } from './alerts.js';

export const ADMIN_EMAIL = 'menorcuartas@gmail.com';

export async function requireAdminSession() {
  let data;
  let error;

  try {
    ({ data, error } = await supabase.auth.getUser());
  } catch (requestError) {
    console.error('No se pudo comprobar la sesión administrativa:', requestError);
    window.location.replace('/login.html');
    return false;
  }

  if (error) {
    console.error('No se pudo validar la sesión administrativa:', error);
  }

  if (error || data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    localStorage.removeItem('barberSession');
    window.location.replace('/login.html');
    return false;
  }

  return true;
}

export function attachAdminLogout() {
  const logoutButtons = document.querySelectorAll('#btnLogout, #btn-logout, .mobile-logout-button');

  logoutButtons.forEach(button => {
    button.addEventListener('click', async () => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('No se pudo cerrar la sesión administrativa:', error);
          await mostrarAlerta('Error al cerrar sesión', `No se pudo cerrar la sesión: ${error.message}`, 'error');
          return;
        }

        localStorage.removeItem('barberSession');
        sessionStorage.removeItem('passwordRecoveryActive');
        window.location.replace('/login.html');
      } catch (error) {
        console.error('Error de red al cerrar la sesión administrativa:', error);
        await mostrarAlerta('Error de conexión', 'No se pudo conectar para cerrar la sesión. Inténtalo de nuevo.', 'error');
      }
    });
  });
}
