import { supabase } from './supabase.js';
import { attachAdminLogout, requireAdminSession } from './admin-auth.js';
import { confirmarAlerta, mostrarAlerta } from './alerts.js';
import { normalizarEstadoCita } from './appointment-status.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!await requireAdminSession()) return;
  attachAdminLogout();


  const filterDate = document.getElementById('filterDate');
  const filterBarber = document.getElementById('filterBarber');
  const searchClient = document.getElementById('searchClient');
  const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');


  await cargarReservas();

  const reservasTableBody = document.getElementById('reservasTableBody');
  if (reservasTableBody) {
    reservasTableBody.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('[data-action][data-id]');
      if (!button || !reservasTableBody.contains(button)) return;
      void manejarAccionCita(button);
    });
  }

  
  if (filterDate) filterDate.addEventListener('change', cargarReservas);
  if (filterBarber) filterBarber.addEventListener('change', cargarReservas);
  if (searchClient) searchClient.addEventListener('input', cargarReservas);

  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener('click', () => {
      if (filterDate) filterDate.value = '';
      if (filterBarber) filterBarber.value = 'todos';
      if (searchClient) searchClient.value = '';
      cargarReservas();
    });
  }
});

async function cargarReservas() {
  const tbody = document.getElementById('reservasTableBody');
  if (!tbody) return;

  mostrarMensajeTabla(tbody, 'Cargando reservas desde Supabase...');

  try {
    const { data: citas, error } = await supabase
      .from('citas')
      .select('*, clientes(nombre, telefono), barberos(nombre), servicios(nombre)')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: true });

    if (error) {
      console.error('Error al cargar las reservas:', error);
      mostrarMensajeTabla(tbody, `Error al cargar reservas: ${error.message}`);
      return;
    }

    const fechaVal = document.getElementById('filterDate')?.value;
    const barberoVal = document.getElementById('filterBarber')?.value;
    const busqueda = document.getElementById('searchClient')?.value.toLowerCase().trim();
    const listaFiltrada = (citas || []).filter(cita => {
      const cliente = obtenerRelacion(cita.clientes);
      const barbero = obtenerRelacion(cita.barberos);
      const fechaCoincide = !fechaVal || cita.fecha === fechaVal;
      const barberoCoincide = !barberoVal || barberoVal === 'todos'
        || String(cita.barbero || barbero?.nombre || '').toLocaleLowerCase().includes(barberoVal.toLocaleLowerCase());
      const busquedaCoincide = !busqueda
        || String(cita.cliente || cliente?.nombre || cita.nombre || cita.cliente_nombre || '').toLocaleLowerCase().includes(busqueda)
        || String(cita.telefono || cliente?.telefono || cita.cliente_telefono || '').includes(busqueda);
      return fechaCoincide && barberoCoincide && busquedaCoincide;
    });

    if (listaFiltrada.length === 0) {
      mostrarMensajeTabla(tbody, 'No se encontraron reservas registradas.');
      return;
    }

   
    tbody.replaceChildren(...listaFiltrada.map(cita => {
      const tr = document.createElement('tr');
      const hora = document.createElement('td');
      const horaTexto = document.createElement('strong');
      const fecha = document.createElement('td');
      const cliente = document.createElement('td');
      const nombreCliente = document.createElement('div');
      const nombreTexto = document.createElement('strong');
      const telefono = document.createElement('td');
      const servicio = document.createElement('td');
      const barbero = document.createElement('td');
      const estado = document.createElement('td');
      const acciones = document.createElement('td');
      const clienteRelacion = obtenerRelacion(cita.clientes);
      const barberoRelacion = obtenerRelacion(cita.barberos);
      const servicioRelacion = obtenerRelacion(cita.servicios);

      horaTexto.textContent = cita.hora || '--:--';
      hora.append(horaTexto);
      fecha.textContent = cita.fecha || '--';
      nombreTexto.textContent = cita.cliente || obtenerNombreCliente(cita, clienteRelacion);
      nombreCliente.append(nombreTexto);
      cliente.append(nombreCliente);
      telefono.textContent = obtenerTelefonoCliente(cita, clienteRelacion) || '--';
      servicio.textContent = cita.servicio || servicioRelacion?.nombre || 'Sin servicio';
      barbero.textContent = cita.barbero || barberoRelacion?.nombre || 'Sin asignar';

      const estadoActual = normalizarEstadoGuardado(cita.estado);
      const badge = document.createElement('span');
      badge.className = `badge ${estadoActual.clase}`;
      badge.textContent = estadoActual.etiqueta;
      estado.append(badge);

      const botones = document.createElement('div');
      botones.className = 'action-buttons reservation-actions';
      if (estadoActual.valor !== 'Cancelada') {
        botones.append(crearBotonAccion(
          'cancelar',
          cita.id,
          'Cancelar',
          `Cancelar cita de ${obtenerNombreCliente(cita)}`,
          true
        ));
      }
      if (estadoActual.valor === 'Pendiente') {
        botones.append(crearBotonAccion(
          'atender',
          cita.id,
          'Atender',
          `Marcar como atendida la cita de ${obtenerNombreCliente(cita)}`
        ));
      }
      if (botones.childElementCount === 0) {
        const textoEstado = document.createElement('span');
        textoEstado.className = 'reservation-action-complete';
        textoEstado.textContent = estadoActual.valor;
        botones.append(textoEstado);
      }
      acciones.append(botones);
      tr.append(hora, fecha, cliente, telefono, servicio, barbero, estado, acciones);
      return tr;
    }));

  } catch (err) {
    console.error('Error durante la ejecución:', err);
    mostrarMensajeTabla(tbody, `Error en script: ${err.message}`);
  }
}

function obtenerNombreCliente(cita, clienteRelacionado) {
  const nombre = clienteRelacionado?.nombre || cita.cliente || cita.nombre || cita.cliente_nombre;
  return typeof nombre === 'string' && nombre.trim() ? nombre.trim() : 'Cliente';
}

function obtenerTelefonoCliente(cita, clienteRelacionado) {
  return String(cita.telefono || clienteRelacionado?.telefono || cita.cliente_telefono || '');
}

function obtenerRelacion(relacion) {
  return Array.isArray(relacion) ? relacion[0] : relacion;
}

function crearBotonAccion(accion, citaId, texto, etiqueta, esPeligroso = false) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = `btn-box-action btn-reservation-action${esPeligroso ? ' danger' : ''}`;
  boton.dataset.action = accion;
  boton.dataset.id = String(citaId ?? '');
  boton.textContent = texto;
  boton.title = etiqueta;
  boton.setAttribute('aria-label', etiqueta);
  return boton;
}

function normalizarEstadoGuardado(estado) {
  const valor = normalizarEstadoCita(estado);
  if (valor === 'atendida') {
    return { valor: 'Atendida', etiqueta: 'Atendida', clase: 'badge-success' };
  }
  if (valor === 'cancelada') {
    return { valor: 'Cancelada', etiqueta: 'Cancelada', clase: 'badge-danger' };
  }
  if (valor === 'pendiente') {
    return { valor: 'Pendiente', etiqueta: 'Pendiente', clase: 'badge-warning' };
  }
  return { valor: 'Desconocido', etiqueta: 'Estado desconocido', clase: 'badge-secondary' };
}

async function manejarAccionCita(boton) {
  const { action, id: citaId } = boton.dataset;
  if (!citaId) {
    await mostrarAlerta('No se pudo actualizar', 'Falta el identificador de la cita.', 'error');
    return;
  }

  const nuevoEstado = action === 'cancelar' ? 'cancelada' : 'atendida';
  if (action === 'cancelar') {
    const nombreCliente = boton.closest('tr')?.querySelector('td:nth-child(3) strong')?.textContent || 'este cliente';
    const confirmar = await confirmarAlerta(
      '¿Cancelar la cita?',
      `¿Estás seguro de que deseas cancelar la cita de "${nombreCliente}"?`,
      'Cancelar cita'
    );
    if (!confirmar) return;
  }

  boton.disabled = true;
  try {
    const { error } = await supabase
      .from('citas')
      .update({ estado: nuevoEstado })
      .eq('id', citaId);

    if (error) throw error;

    await mostrarAlerta(
      action === 'cancelar' ? 'Cita cancelada' : 'Cita actualizada',
      action === 'cancelar' ? 'La cita se canceló correctamente.' : 'La cita se marcó como atendida.',
      'success'
    );
    await cargarReservas();
  } catch (error) {
    console.error('Error al actualizar el estado de la cita:', {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      error
    });
    const detalle = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ');
    await mostrarAlerta('Error al actualizar', `No se pudo actualizar el estado: ${detalle || 'Error desconocido.'}`, 'error');
    boton.disabled = false;
  }
}

function mostrarMensajeTabla(tbody, mensaje) {
  const fila = document.createElement('tr');
  const celda = document.createElement('td');
  celda.colSpan = 8;
  celda.className = 'table-empty';
  celda.textContent = mensaje;
  fila.append(celda);
  tbody.replaceChildren(fila);
}