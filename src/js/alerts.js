import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export function mostrarAlerta(titulo, mensaje, tipo = 'info') {
  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: tipo,
    background: '#181818',
    color: '#ffffff',
    confirmButtonColor: '#ffc107',
    customClass: {
      confirmButton: 'custom-swal-button'
    }
  });
}

export async function confirmarAlerta(titulo, mensaje, textoConfirmar = 'Confirmar') {
  const resultado = await Swal.fire({
    title: titulo,
    text: mensaje,
    icon: 'warning',
    background: '#181818',
    color: '#ffffff',
    showCancelButton: true,
    confirmButtonText: textoConfirmar,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ffc107',
    cancelButtonColor: '#555555',
    customClass: {
      confirmButton: 'custom-swal-button'
    }
  });

  return resultado.isConfirmed;
}
