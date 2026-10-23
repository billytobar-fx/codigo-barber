import { supabase } from './supabase.js';
import { attachAdminLogout, requireAdminSession } from './admin-auth.js';
import { normalizarEstadoCita } from './appointment-status.js';

let dashboardRequestId = 0;
let dashboardRefreshTimeout;

document.addEventListener('DOMContentLoaded', async () => {
  if (!await requireAdminSession()) return;
  attachAdminLogout();

  supabase
    .channel('dashboard-todas-las-citas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, programarActualizacionDashboard)
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('No se pudo activar la actualización en tiempo real del dashboard:', error || status);
      }
    });

  await cargarEstadisticasYTablas();
  window.addEventListener('focus', () => void cargarEstadisticasYTablas());
  window.addEventListener('pageshow', () => void cargarEstadisticasYTablas());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void cargarEstadisticasYTablas();
  });
  window.setInterval(programarActualizacionDashboard, 60000);
});

async function cargarEstadisticasYTablas() {
  const requestId = ++dashboardRequestId;
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const { data: citas, error } = await supabase
    .from('citas')
    .select('*, clientes(nombre), barberos(nombre), servicios(nombre, precio)')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: true });
  if (requestId !== dashboardRequestId) return;
  if (error) {
    console.error('Error al cargar citas para estadísticas:', error);
    actualizarTexto([
      'citasHoyCount', 'citasRegistradasCount', 'citasPendientesCount',
      'citasAtendidasCount', 'total-citas-hoy', 'total-clientes',
      'citas-pendientes', 'citas-atendidas', 'countPendientes',
      'countAtendidas', 'countCanceladas', 'count-pending',
      'count-attended', 'count-canceled', 'chart-total-count',
      'totalGraficaCount'
    ], '—');
    actualizarGraficoEstados(0, 0, 0, 0);
    const tbody = obtenerTablaCitasHoy();
    if (tbody) mostrarEstadoCitas(tbody, `Error al cargar las citas: ${error.message}`);
    return;
  }

  const todasLasCitas = citas || [];
  const citasDeHoy = todasLasCitas.filter(cita => cita.fecha === fechaHoy).length;
  const pendientes = todasLasCitas.filter(cita => normalizarEstadoCita(cita.estado) === 'pendiente').length;
  const atendidas = todasLasCitas.filter(cita => normalizarEstadoCita(cita.estado) === 'atendida').length;
  const canceladas = todasLasCitas.filter(cita => normalizarEstadoCita(cita.estado) === 'cancelada').length;
  const totalConEstadoReconocido = pendientes + atendidas + canceladas;

  actualizarTexto(['citasHoyCount', 'total-citas-hoy', 'statCitasHoy'], citasDeHoy);
  actualizarTexto(['citasRegistradasCount', 'total-clientes', 'statTotalRegistradas'], todasLasCitas.length);
  actualizarTexto(['citasPendientesCount', 'citas-pendientes', 'statCitasPendientes', 'countPendientes', 'count-pending', 'statPendientesHoy'], pendientes);
  actualizarTexto(['citasAtendidasCount', 'citas-atendidas', 'statCitasAtendidas', 'countAtendidas', 'count-attended', 'statAtendidasHoy'], atendidas);
  actualizarTexto(['countCanceladas', 'count-canceled', 'statCanceladasHoy'], canceladas);
  actualizarTexto(['chart-total-count', 'totalGraficaCount'], todasLasCitas.length);
  actualizarGraficoEstados(pendientes, atendidas, canceladas, totalConEstadoReconocido);

  const tbody = obtenerTablaCitasHoy();
  if (!tbody) return;

  if (todasLasCitas.length === 0) {
    mostrarEstadoCitas(tbody, 'No hay reservas registradas.');
    return;
  }

  tbody.replaceChildren(...todasLasCitas.map(cita => {
    const fila = document.createElement('tr');
    const hora = document.createElement('td');
    const horaTexto = document.createElement('strong');
    const cliente = document.createElement('td');
    const clienteTexto = document.createElement('strong');
    const servicio = document.createElement('td');
    const barbero = document.createElement('td');
    const estado = document.createElement('td');
    const clienteNombre = obtenerNombreRelacion(cita.clientes, cita.cliente_nombre || cita.cliente, 'Sin Nombre');
    const servicioNombre = obtenerNombreRelacion(cita.servicios, cita.servicio, '--');
    const barberoNombre = obtenerNombreRelacion(cita.barberos, cita.barbero, '--');
    const estadoNormalizado = normalizarEstadoCita(cita.estado);
    const estadoBadge = document.createElement('span');
    estadoBadge.className = `badge ${claseEstado(estadoNormalizado)}`;
    estadoBadge.textContent = etiquetaEstado(estadoNormalizado);

    horaTexto.textContent = cita.hora || '--:--';
    clienteTexto.textContent = clienteNombre;
    servicio.textContent = servicioNombre;
    barbero.textContent = barberoNombre;
    estado.append(estadoBadge);
    hora.append(horaTexto);
    cliente.append(clienteTexto);
    fila.append(hora, cliente, servicio, barbero, estado);
    return fila;
  }));
}

function claseEstado(estado) {
  if (estado === 'cancelada') return 'badge-danger';
  if (estado === 'atendida') return 'badge-success';
  if (estado === 'pendiente') return 'badge-warning';
  return 'badge-secondary';
}

function etiquetaEstado(estado) {
  if (estado === 'cancelada') return 'Cancelada';
  if (estado === 'atendida') return 'Atendida';
  if (estado === 'pendiente') return 'Pendiente';
  return 'Estado desconocido';
}

function programarActualizacionDashboard() {
  window.clearTimeout(dashboardRefreshTimeout);
  dashboardRefreshTimeout = window.setTimeout(() => {
    void cargarEstadisticasYTablas();
  }, 250);
}

function actualizarGraficoEstados(pendientes, atendidas, canceladas, totalReconocido) {
  const grafico = document.querySelector('.donut-chart-box');
  if (!grafico) return;

  if (totalReconocido === 0) {
    grafico.style.background = '#333';
    return;
  }

  const porcentajePendientes = (pendientes / totalReconocido) * 100;
  const porcentajeAtendidas = porcentajePendientes + (atendidas / totalReconocido) * 100;
  grafico.style.background = `conic-gradient(
    #c5a059 0% ${porcentajePendientes}%,
    #2ecc71 ${porcentajePendientes}% ${porcentajeAtendidas}%,
    #e74c3c ${porcentajeAtendidas}% 100%
  )`;
}

function actualizarTexto(ids, valor) {
  ids.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
  });
}

function obtenerTablaCitasHoy() {
  return document.getElementById('citasHoyTableBody')
    || document.querySelector('.citas-hoy-tbody')
    || document.getElementById('today-appointments');
}

function obtenerNombreRelacion(relacion, valorAnterior, respaldo) {
  const nombreRelacionado = Array.isArray(relacion) ? relacion[0]?.nombre : relacion?.nombre;
  if (typeof nombreRelacionado === 'string' && nombreRelacionado.trim()) {
    return nombreRelacionado.trim();
  }
  return typeof valorAnterior === 'string' && valorAnterior.trim() ? valorAnterior.trim() : respaldo;
}

function mostrarEstadoCitas(tbody, mensaje) {
  const fila = document.createElement('tr');
  const celda = document.createElement('td');
  celda.colSpan = 5;
  celda.className = 'table-empty';
  celda.textContent = mensaje;
  fila.append(celda);
  tbody.replaceChildren(fila);
}