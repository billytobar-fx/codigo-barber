import { supabase } from './supabase.js';
import { attachAdminLogout, requireAdminSession } from './admin-auth.js';
import { confirmarAlerta, mostrarAlerta } from './alerts.js';

let activeTab = 'barberos';

document.addEventListener('DOMContentLoaded', async () => {
  if (!await requireAdminSession()) return;
  attachAdminLogout();

  // 2. Navegación por pestañas
  const tabButtons = document.querySelectorAll('.tab-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const btnAgregarTexto = document.getElementById('btnAgregarTexto');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${activeTab}`);
      if (activeContent) activeContent.classList.add('active');

      if (btnAgregarTexto) {
        if (activeTab === 'barberos') btnAgregarTexto.textContent = 'Agregar barbero';
        else if (activeTab === 'servicios') btnAgregarTexto.textContent = 'Agregar servicio';
        else btnAgregarTexto.textContent = 'Editar horarios';
      }
    });
  });

  // 3. Botón Agregar (Abre Modal)
  const btnAgregar = document.getElementById('btnAgregar');
  if (btnAgregar) {
    btnAgregar.onclick = () => {
      if (activeTab === 'horarios') {
        abrirModalHorarios();
        return;
      }
      abrirModalCrear();
    };
  }

  // 4. Modal Eventos (Cerrar y Guardar)
  document.getElementById('btnCloseModal')?.addEventListener('click', cerrarModal);
  document.getElementById('btnCancelModal')?.addEventListener('click', cerrarModal);
  document.getElementById('crudForm')?.addEventListener('submit', guardarFormulario);
  document.getElementById('btnCloseModalHorarios')?.addEventListener('click', cerrarModalHorarios);
  document.getElementById('btnCancelHorarios')?.addEventListener('click', cerrarModalHorarios);
  document.getElementById('horariosForm')?.addEventListener('submit', guardarHorarios);

  // Cargar datos
  await cargarBarberos();
  await cargarServicios();
  await cargarHorarios();
});

// CARGAR BARBEROS
async function cargarBarberos() {
  const tbody = document.getElementById('barberosTableBody');
  const counter = document.getElementById('barberosCounter');
  if (!tbody) return;

  const { data: barberos, error } = await supabase.from('barberos').select('*').order('id', { ascending: true });

  if (error || !barberos || barberos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay barberos registrados.</td></tr>';
    if (counter) counter.textContent = '0 barberos';
    return;
  }

  tbody.innerHTML = '';
  barberos.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="user-profile-cell">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(b.nombre)}&background=222&color=c5a059" class="avatar-img" alt="${b.nombre}">
          <span>${b.nombre}</span>
        </div>
      </td>
      <td>${b.especialidad || 'General'}</td>
      <td style="text-align: right;">
        <div class="action-buttons">
          <button type="button" class="btn-box-action btn-edit-barbero" data-id="${b.id}" data-nombre="${b.nombre}" data-esp="${b.especialidad || ''}" title="Editar">✏️</button>
          <button type="button" class="btn-box-action danger btn-delete-barbero" data-id="${b.id}" data-nombre="${b.nombre}" title="Eliminar">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (counter) counter.textContent = `Mostrando 1 a ${barberos.length} de ${barberos.length} barberos`;

  // Asignar clics en Lápiz y Basura para Barberos
  tbody.querySelectorAll('.btn-edit-barbero').forEach(btn => {
    btn.onclick = () => abrirModalEditar('barberos', btn.dataset.id, btn.dataset.nombre, btn.dataset.esp);
  });

  tbody.querySelectorAll('.btn-delete-barbero').forEach(btn => {
    btn.onclick = async () => {
      const { id, nombre } = btn.dataset;
      if (await confirmarAlerta('¿Eliminar barbero?', `¿Eliminar al barbero "${nombre}"?`, 'Eliminar')) {
        await supabase.from('barberos').delete().eq('id', id);
        await cargarBarberos();
      }
    };
  });
}

// CARGAR SERVICIOS
async function cargarServicios() {
  const tbody = document.getElementById('serviciosTableBody');
  const counter = document.getElementById('serviciosCounter');
  if (!tbody) return;

  const { data: servicios, error } = await supabase.from('servicios').select('*').order('id', { ascending: true });

  if (error || !servicios || servicios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No hay servicios registrados.</td></tr>';
    if (counter) counter.textContent = '0 servicios';
    return;
  }

  tbody.innerHTML = '';
  servicios.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.nombre}</strong></td>
      <td>${s.duracion || '--'}</td>
      <td>${s.precio || '--'}</td>
      <td style="text-align: right;">
        <div class="action-buttons">
          <button type="button" class="btn-box-action btn-edit-servicio" data-id="${s.id}" data-nombre="${s.nombre}" data-dur="${s.duracion || ''}" data-precio="${s.precio || ''}" title="Editar">✏️</button>
          <button type="button" class="btn-box-action danger btn-delete-servicio" data-id="${s.id}" data-nombre="${s.nombre}" title="Eliminar">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (counter) counter.textContent = `Mostrando 1 a ${servicios.length} de ${servicios.length} servicios`;

  // Asignar clics en Lápiz y Basura para Servicios
  tbody.querySelectorAll('.btn-edit-servicio').forEach(btn => {
    btn.onclick = () => abrirModalEditar('servicios', btn.dataset.id, btn.dataset.nombre, null, btn.dataset.dur, btn.dataset.precio);
  });

  tbody.querySelectorAll('.btn-delete-servicio').forEach(btn => {
    btn.onclick = async () => {
      const { id, nombre } = btn.dataset;
      if (await confirmarAlerta('¿Eliminar servicio?', `¿Eliminar el servicio "${nombre}"?`, 'Eliminar')) {
        await supabase.from('servicios').delete().eq('id', id);
        await cargarServicios();
      }
    };
  });
}

// CONTROL DEL MODAL
function abrirModalCrear() {
  document.getElementById('modalTitle').textContent = activeTab === 'barberos' ? 'Agregar Barbero' : 'Agregar Servicio';
  document.getElementById('crudForm').reset();
  document.getElementById('itemId').value = '';

  const isBarbero = activeTab === 'barberos';
  document.getElementById('groupEspecialidad').style.display = isBarbero ? 'block' : 'none';
  document.getElementById('groupDuracion').style.display = isBarbero ? 'none' : 'block';
  document.getElementById('groupPrecio').style.display = isBarbero ? 'none' : 'block';

  document.getElementById('modalForm').style.display = 'flex';
}

function abrirModalEditar(tabla, id, nombre, especialidad, duracion, precio) {
  document.getElementById('modalTitle').textContent = tabla === 'barberos' ? 'Editar Barbero' : 'Editar Servicio';
  document.getElementById('itemId').value = id;
  document.getElementById('inputNombre').value = nombre;

  if (tabla === 'barberos') {
    document.getElementById('inputEspecialidad').value = especialidad || '';
    document.getElementById('groupEspecialidad').style.display = 'block';
    document.getElementById('groupDuracion').style.display = 'none';
    document.getElementById('groupPrecio').style.display = 'none';
  } else {
    document.getElementById('inputDuracion').value = duracion || '';
    document.getElementById('inputPrecio').value = precio || '';
    document.getElementById('groupEspecialidad').style.display = 'none';
    document.getElementById('groupDuracion').style.display = 'block';
    document.getElementById('groupPrecio').style.display = 'block';
  }

  document.getElementById('modalForm').style.display = 'flex';
}

function cerrarModal() {
  document.getElementById('modalForm').style.display = 'none';
}

// GUARDAR / EDITAR EN SUPABASE
async function guardarFormulario(e) {
  e.preventDefault();

  const id = document.getElementById('itemId').value;
  const nombre = document.getElementById('inputNombre').value.trim();

  if (activeTab === 'barberos') {
    const especialidad = document.getElementById('inputEspecialidad').value.trim();
    if (id) {
      await supabase.from('barberos').update({ nombre, especialidad }).eq('id', id);
    } else {
      await supabase.from('barberos').insert([{ nombre, especialidad }]);
    }
    await cargarBarberos();
  } else {
    const duracion = document.getElementById('inputDuracion').value.trim();
    const precio = document.getElementById('inputPrecio').value.trim();
    if (id) {
      await supabase.from('servicios').update({ nombre, duracion, precio }).eq('id', id);
    } else {
      await supabase.from('servicios').insert([{ nombre, duracion, precio }]);
    }
    await cargarServicios();
  }

  cerrarModal();
}

const horariosPorDefecto = {
  semana: '9:00 – 19:00',
  sabado: '9:00 – 19:00',
  domingo: '10:00 – 15:00'
};

async function cargarHorarios() {
  const elSemana = document.getElementById('horarioSemana');
  const elSabado = document.getElementById('horarioSabado');
  const elDomingo = document.getElementById('horarioDomingo');

  try {
    const { data: horarios, error } = await supabase.from('horarios').select('*');
    if (error) throw error;

    const valores = { ...horariosPorDefecto };
    (horarios || []).forEach(horario => {
      const id = Number(horario.id);
      if (id === 1 && horario.horario) valores.semana = horario.horario;
      if (id === 2 && horario.horario) valores.sabado = horario.horario;
      if (id === 3 && horario.horario) valores.domingo = horario.horario;
    });

    if (elSemana) elSemana.textContent = valores.semana;
    if (elSabado) elSabado.textContent = valores.sabado;
    if (elDomingo) elDomingo.textContent = valores.domingo;
  } catch (error) {
    console.error('Error al cargar los horarios desde Supabase:', error);
    if (elSemana) elSemana.textContent = horariosPorDefecto.semana;
    if (elSabado) elSabado.textContent = horariosPorDefecto.sabado;
    if (elDomingo) elDomingo.textContent = horariosPorDefecto.domingo;
  }
}

function abrirModalHorarios() {
  const modal = document.getElementById('modalHorarios');
  const inputSemana = document.getElementById('inputHorarioSemana');
  const inputSabado = document.getElementById('inputHorarioSabado');
  const inputDomingo = document.getElementById('inputHorarioDomingo');
  if (!modal || !inputSemana || !inputSabado || !inputDomingo) return;

  inputSemana.value = document.getElementById('horarioSemana')?.textContent
    || horariosPorDefecto.semana;
  inputSabado.value = document.getElementById('horarioSabado')?.textContent
    || horariosPorDefecto.sabado;
  inputDomingo.value = document.getElementById('horarioDomingo')?.textContent
    || horariosPorDefecto.domingo;
  modal.style.display = 'flex';
}

function cerrarModalHorarios() {
  const modal = document.getElementById('modalHorarios');
  if (modal) modal.style.display = 'none';
}

async function guardarHorarios(event) {
  event.preventDefault();

  const horarioSemana = document.getElementById('inputHorarioSemana')?.value.trim();
  const horarioSabado = document.getElementById('inputHorarioSabado')?.value.trim();
  const horarioDomingo = document.getElementById('inputHorarioDomingo')?.value.trim();
  if (!horarioSemana || !horarioSabado || !horarioDomingo) {
    await mostrarAlerta('Horarios incompletos', 'Completa los tres horarios antes de guardar.', 'warning');
    return;
  }

  const horarios = [
    { id: 1, dias: 'Lunes – Viernes', horario: horarioSemana },
    { id: 2, dias: 'Sábado', horario: horarioSabado },
    { id: 3, dias: 'Domingo', horario: horarioDomingo }
  ];

  try {
    const { error } = await supabase.from('horarios').upsert(horarios);
    if (error) throw error;

    await cargarHorarios();
    cerrarModalHorarios();
  } catch (error) {
    console.error('Error al guardar los horarios en Supabase:', error);
    await mostrarAlerta('Error al guardar', `No se pudieron guardar los horarios: ${error.message || 'Error desconocido.'}`, 'error');
  }
}