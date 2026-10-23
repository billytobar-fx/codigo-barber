import { supabase } from './js/supabase.js';
import { confirmarAlerta, mostrarAlerta } from './js/alerts.js';
import { isValidColombianMobile, restrictToDigits } from './js/phone-validation.js';

function normalizarNombre(nombre) {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizarEstado(estado) {
  return String(estado || 'pendiente')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. MENÚ MÓVIL (TOGGLE)
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const shouldExpand = !isExpanded;
      menuToggle.setAttribute('aria-expanded', String(shouldExpand));
      menuToggle.setAttribute('aria-label', shouldExpand ? 'Cerrar menú' : 'Abrir menú');
      menuToggle.classList.toggle('open', shouldExpand);
      mainNav.classList.toggle('nav--open', shouldExpand);
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú');
        menuToggle.classList.remove('open');
        mainNav.classList.remove('nav--open');
      });
    });
  }

  // 2. SELECCIÓN DINÁMICA DE SERVICIOS Y BARBEROS EN PASO 1
  const servicesOptions = document.getElementById('servicesOptions');
  const barbersOptions = document.getElementById('barbersOptions');
  const initialServiceId = servicesOptions?.querySelector('.option-card.active')?.getAttribute('data-id');
  const initialBarberId = barbersOptions?.querySelector('.option-card.active')?.getAttribute('data-id');
  let occupiedTimes = new Set();
  let availabilityRequestId = 0;
  let availabilityVerified = false;

  if (servicesOptions) {
    servicesOptions.addEventListener('click', (e) => {
      const card = e.target.closest('.option-card');
      if (card) {
        servicesOptions.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
    });
  }

  if (barbersOptions) {
    barbersOptions.addEventListener('click', (e) => {
      const card = e.target.closest('.option-card');
      if (card) {
        barbersOptions.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        void refreshOccupiedTimes();
      }
    });
  }

  // BOTONES DE ACCIÓN DIRECTA EN LAS TARJETAS (Servicios y Barberos)
  document.querySelectorAll('.service-card__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const serviceId = e.target.getAttribute('data-service-id');
      const targetOption = document.querySelector(`#servicesOptions .option-card[data-id="${serviceId}"]`);
      if (targetOption && servicesOptions) {
        servicesOptions.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
        targetOption.classList.add('active');
      }
      document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.barber-card__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const barberId = e.target.getAttribute('data-barber-id');
      const targetOption = document.querySelector(`#barbersOptions .option-card[data-id="${barberId}"]`);
      if (targetOption && barbersOptions) {
        barbersOptions.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
        targetOption.classList.add('active');
        void refreshOccupiedTimes();
      }
      document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // 3. SELECCIÓN DE HORARIOS EN PASO 2
  const timeSlotsGrid = document.getElementById('timeSlotsGrid');

  // 4. FLUJO DE NAVEGACIÓN ENTRE PASOS (PASO 1 -> PASO 2 -> PASO 3)
  const btnToStep2 = document.getElementById('btnToStep2');
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  const btnToStep3 = document.getElementById('btnToStep3');
  const btnBackToStep2 = document.getElementById('btnBackToStep2');
  const btnNewBooking = document.getElementById('btnNewBooking');
  const btnConfirmBooking = document.getElementById('btnConfirmBooking');
  const bookingDate = document.getElementById('bookingDate');
  const clientPhoneInput = document.getElementById('clientPhone');

  if (clientPhoneInput) restrictToDigits(clientPhoneInput);

  if (bookingDate) {
    bookingDate.min = obtenerFechaLocalISO();
    bookingDate.value = bookingDate.min;
    actualizarHorariosDisponibles(bookingDate, timeSlotsGrid, occupiedTimes, availabilityVerified);
    bookingDate.addEventListener('change', async () => {
      bookingDate.min = obtenerFechaLocalISO();
      timeSlotsGrid?.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('active'));
      await refreshOccupiedTimes();
    });
  }

  if (timeSlotsGrid && bookingDate) {
    timeSlotsGrid.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const slot = event.target.closest('.time-slot');
      actualizarHorariosDisponibles(bookingDate, timeSlotsGrid, occupiedTimes, availabilityVerified);
      if (!slot || slot.getAttribute('aria-disabled') === 'true') return;

      timeSlotsGrid.querySelectorAll('.time-slot').forEach(item => item.classList.remove('active'));
      slot.classList.add('active');
    });
  }

  if (btnToStep2) {
    btnToStep2.addEventListener('click', async () => {
      if (!await refreshOccupiedTimes()) return;
      const selectedBarberCard = document.querySelector('#barbersOptions .option-card.active');
      const barberName = selectedBarberCard ? selectedBarberCard.getAttribute('data-name') : 'BARBERO';
      
      const titleElement = document.getElementById('barberAvailableTitle');
      if (titleElement) {
        titleElement.innerText = `HORARIO DISPONIBLE - ${barberName.toUpperCase()}`;
      }

      document.getElementById('step1')?.classList.remove('active');
      document.getElementById('step2')?.classList.add('active');
      updateStepIndicator(2);
    });
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => {
      document.getElementById('step2')?.classList.remove('active');
      document.getElementById('step1')?.classList.add('active');
      updateStepIndicator(1);
    });
  }

  if (btnToStep3) {
    btnToStep3.addEventListener('click', async () => {
      const selectedTime = document.querySelector('#timeSlotsGrid .time-slot.active');
      const selectedDate = document.getElementById('bookingDate')?.value;
      const selectedHour = selectedTime?.textContent.trim();
      const disponibilidadActualizada = await refreshOccupiedTimes();
      const selectedService = document.querySelector('#servicesOptions .option-card.active');
      const selectedBarber = document.querySelector('#barbersOptions .option-card.active');

      if (!disponibilidadActualizada) return;
      if (selectedHour && occupiedTimes.has(selectedHour)) {
        await mostrarAlerta(
          'Horario Ya Reservado',
          'Este horario ya se encuentra ocupado con el barbero seleccionado. Por favor elige otra hora o cambia de barbero.',
          'warning'
        );
        return;
      }
      if (!selectedDate || !selectedTime || !esFechaHoraReservaValida(selectedDate, selectedTime.textContent.trim())) {
        await mostrarAlerta('Horario inválido', 'Selecciona una fecha y una hora válidas que aún no hayan pasado.', 'warning');
        return;
      }
      if (selectedTime.getAttribute('aria-disabled') === 'true') {
        await mostrarAlerta(
          'Horario Ya Reservado',
          'Este horario ya se encuentra ocupado con el barbero seleccionado. Por favor elige otra hora o cambia de barbero.',
          'warning'
        );
        return;
      }

      if (document.getElementById('summaryService')) {
        document.getElementById('summaryService').innerText = selectedService ? selectedService.getAttribute('data-name') : '';
      }
      if (document.getElementById('summaryBarber')) {
        document.getElementById('summaryBarber').innerText = selectedBarber ? selectedBarber.getAttribute('data-name') : '';
      }
      if (document.getElementById('summaryDate')) {
        document.getElementById('summaryDate').innerText = selectedDate || '';
      }
      if (document.getElementById('summaryTime')) {
        document.getElementById('summaryTime').innerText = selectedTime ? selectedTime.innerText : '';
      }

      document.getElementById('step2')?.classList.remove('active');
      document.getElementById('step3')?.classList.add('active');
      updateStepIndicator(3);
    });
  }

  if (btnBackToStep2) {
    btnBackToStep2.addEventListener('click', () => {
      document.getElementById('step3')?.classList.remove('active');
      document.getElementById('step2')?.classList.add('active');
      updateStepIndicator(2);
    });
  }

  if (btnConfirmBooking) {
    btnConfirmBooking.addEventListener('click', async (event) => {
      event.preventDefault();

      const clientName = document.getElementById('clientName')?.value.trim();
      const clientPhone = document.getElementById('clientPhone')?.value.trim();
      const selectedService = document.querySelector('#servicesOptions .option-card.active');
      const selectedBarber = document.querySelector('#barbersOptions .option-card.active');
      const selectedTime = document.querySelector('#timeSlotsGrid .time-slot.active');
      const date = bookingDate?.value;

      if (!clientName || !selectedService || !selectedBarber || !selectedTime || !date) {
        await mostrarAlerta(
          'Campos incompletos',
          'Completa tu nombre y selecciona servicio, barbero, fecha y hora.',
          'warning'
        );
        return;
      }

      if (!clientPhone) {
        await mostrarAlerta(
          'Teléfono requerido',
          'Ingresa tu número de teléfono de contacto.',
          'warning'
        );
        return;
      }

      if (!/^3[0-9]{9}$/.test(clientPhone)) {
        await mostrarAlerta(
          'Teléfono inválido',
          'El número de teléfono debe tener 10 dígitos y comenzar por 3 (ejemplo: 3001234567).',
          'warning'
        );
        return;
      }

      if (!isValidColombianMobile(clientPhone)) {
        await mostrarAlerta(
          'Número no válido',
          'Ingresa un número de teléfono real para confirmar tu cita.',
          'warning'
        );
        return;
      }

      const time = selectedTime.textContent.trim();
      if (!esFechaHoraReservaValida(date, time)) {
        await mostrarAlerta('Fecha u hora inválida', 'No puedes agendar una cita en una fecha u hora que ya transcurrió. Selecciona otra.', 'error');
        return;
      }
      const disponibilidadActualizada = await refreshOccupiedTimes();
      if (!disponibilidadActualizada) return;
      if (occupiedTimes.has(time)) {
        await mostrarAlerta(
          'Horario Ya Reservado',
          'Este horario ya se encuentra ocupado con el barbero seleccionado. Por favor elige otra hora o cambia de barbero.',
          'warning'
        );
        return;
      }

      const serviceName = selectedService.getAttribute('data-name');
      const barberName = selectedBarber.getAttribute('data-name');

      btnConfirmBooking.disabled = true;
      const originalText = btnConfirmBooking.textContent;
      btnConfirmBooking.textContent = 'GUARDANDO...';

      try {
        const { data: client, error: clientLookupError } = await supabase
          .from('clientes')
          .select('id')
          .eq('telefono', clientPhone)
          .maybeSingle();

        if (clientLookupError) throw clientLookupError;

        let clientId = client?.id;
        if (!clientId) {
          const { data: newClient, error: clientInsertError } = await supabase
            .from('clientes')
            .insert({ nombre: clientName, telefono: clientPhone })
            .select('id')
            .single();

          if (clientInsertError) throw clientInsertError;
          clientId = newClient.id;
        }

        const [{ data: services, error: serviceError }, { data: barbers, error: barberError }] = await Promise.all([
          supabase.from('servicios').select('id, nombre'),
          supabase.from('barberos').select('id, nombre')
        ]);

        if (serviceError) throw serviceError;
        if (barberError) throw barberError;
        const service = services.find(item => normalizarNombre(item.nombre) === normalizarNombre(serviceName));
        const barber = barbers.find(item => normalizarNombre(item.nombre) === normalizarNombre(barberName));
        if (!service) throw new Error(`No se encontró el servicio "${serviceName}" en el catálogo.`);
        if (!barber) throw new Error(`No se encontró el barbero "${barberName}" en el catálogo.`);

        const { error: bookingError } = await supabase
          .from('citas')
          .insert({
            cliente: clientName,
            telefono: clientPhone,
            servicio: service.nombre,
            barbero: barber.nombre,
            cliente_id: clientId,
            servicio_id: service.id,
            barbero_id: barber.id,
            fecha: date,
            hora: time,
            estado: 'pendiente'
          });

        if (bookingError) throw bookingError;

        document.getElementById('confirmDetails').textContent = `${clientName} - ${serviceName} - ${barberName}`;
        document.getElementById('confirmDateTime').textContent = `${date} a las ${time}`;
        document.getElementById('step3')?.classList.remove('active');
        document.getElementById('step4')?.classList.add('active');
      } catch (error) {
        console.error('Error al guardar la reserva:', error);
        if (esErrorHorarioOcupado(error)) {
          await mostrarAlerta(
            'Horario Ya Reservado',
            'Este horario ya se encuentra ocupado con el barbero seleccionado. Por favor elige otra hora o cambia de barbero.',
            'warning'
          );
          await refreshOccupiedTimes();
        } else if (esErrorRestriccionFechaHora(error)) {
          await mostrarAlerta('Fecha u hora inválida', 'No puedes agendar una cita en una fecha u hora que ya transcurrió. Por favor selecciona un horario futuro.', 'error');
        } else {
          const detalle = error?.message || 'Error desconocido.';
          await mostrarAlerta('Error al reservar', `No se pudo guardar la cita: ${detalle}`, 'error');
        }
      } finally {
        btnConfirmBooking.disabled = false;
        btnConfirmBooking.textContent = originalText;
      }
    });
  }


  const btnWhatsapp = document.getElementById('btnWhatsapp');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      const cliente = document.getElementById('clientName')?.value.trim();
      const servicio = document.getElementById('summaryService')?.innerText;
      const barbero = document.getElementById('summaryBarber')?.innerText;
      const fecha = document.getElementById('bookingDate')?.value;
      const hora = document.getElementById('summaryTime')?.innerText;

      const mensaje = `Hola Código Barber! Acabo de agendar una cita.%0A%0A*Cliente:* ${cliente}%0A*Servicio:* ${servicio}%0A*Barbero:* ${barbero}%0A*Fecha:* ${fecha}%0A*Hora:* ${hora}`;
      window.open(`https://wa.me/573216939105?text=${mensaje}`, '_blank');
    });
  }

 
  if (btnNewBooking) {
    btnNewBooking.addEventListener('click', () => {
      const clientNameInput = document.getElementById('clientName');
      if (clientNameInput) clientNameInput.value = '';
      if (clientPhoneInput) clientPhoneInput.value = '';

      if (bookingDate) {
        bookingDate.min = obtenerFechaLocalISO();
        bookingDate.value = bookingDate.min;
      }

      servicesOptions?.querySelectorAll('.option-card').forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-id') === initialServiceId);
      });
      barbersOptions?.querySelectorAll('.option-card').forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-id') === initialBarberId);
      });
      timeSlotsGrid?.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('active'));
      void refreshOccupiedTimes();

      const initialBarber = barbersOptions?.querySelector('.option-card.active')?.getAttribute('data-name');
      const barberAvailableTitle = document.getElementById('barberAvailableTitle');
      if (barberAvailableTitle && initialBarber) {
        barberAvailableTitle.textContent = `HORARIO DISPONIBLE - ${initialBarber.toUpperCase()}`;
      }

      document.getElementById('step4')?.classList.remove('active');
      document.getElementById('step1')?.classList.add('active');
      updateStepIndicator(1);
    });
  }

  async function refreshOccupiedTimes() {
    const requestId = ++availabilityRequestId;
    const selectedDate = bookingDate?.value;
    const selectedBarber = barbersOptions?.querySelector('.option-card.active')?.getAttribute('data-name');
    const previouslySelectedTime = timeSlotsGrid
      ?.querySelector('.time-slot.active')
      ?.textContent.trim()
      .slice(0, 5);
    occupiedTimes = new Set();
    availabilityVerified = false;
    actualizarHorariosDisponibles(bookingDate, timeSlotsGrid, occupiedTimes, availabilityVerified);
    if (!bookingDate || !timeSlotsGrid || !selectedDate || !selectedBarber) {
      return false;
    }

    try {
      const selectedBarberId = barbersOptions
        ?.querySelector('.option-card.active')
        ?.getAttribute('data-id');
      let barberId = selectedBarberId && /^\d+$/.test(selectedBarberId)
        ? Number(selectedBarberId)
        : null;

      if (barberId === null) {
        const { data: barbers, error: barberError } = await supabase
          .from('barberos')
          .select('id, nombre');
        if (barberError) throw barberError;

        const barber = (barbers || []).find(
          item => normalizarNombre(item.nombre) === normalizarNombre(selectedBarber)
        );
        if (!barber) throw new Error(`No se encontró el barbero "${selectedBarber}" en el catálogo.`);
        barberId = barber.id;
      }

      const { data: citas, error: citasError } = await supabase
        .from('citas')
        .select('hora, estado')
        .eq('barbero_id', barberId)
        .eq('fecha', selectedDate);
      if (citasError) throw citasError;
      if (requestId !== availabilityRequestId) return false;

      occupiedTimes = new Set(
        (citas || [])
          .filter(cita => normalizarEstado(cita.estado) !== 'cancelada')
          .map(cita => String(cita.hora || '').trim().slice(0, 5))
          .filter(Boolean)
      );
      availabilityVerified = true;
      actualizarHorariosDisponibles(bookingDate, timeSlotsGrid, occupiedTimes, availabilityVerified);
      if (previouslySelectedTime && !occupiedTimes.has(previouslySelectedTime)) {
        const availableSlot = [...timeSlotsGrid.querySelectorAll('.time-slot')]
          .find(slot => slot.textContent.trim().slice(0, 5) === previouslySelectedTime);
        if (availableSlot?.getAttribute('aria-disabled') !== 'true') {
          availableSlot?.classList.add('active');
        }
      }
      return true;
    } catch (error) {
      if (requestId === availabilityRequestId) {
        console.error('Error al consultar horarios ocupados:', error);
        actualizarHorariosDisponibles(bookingDate, timeSlotsGrid, occupiedTimes, availabilityVerified);
      }
      return false;
    }
  }

  const formBuscarReserva = document.getElementById('formBuscarReserva');
  if (formBuscarReserva) {
    formBuscarReserva.addEventListener('submit', buscarReservasPorTelefono);
  }


  function updateStepIndicator(stepNumber) {
    const indicators = document.querySelectorAll('#bookingStepsIndicator .step-num');
    indicators.forEach(ind => {
      const step = parseInt(ind.getAttribute('data-step'));
      if (step <= stepNumber) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });
  }
});

function actualizarHorariosDisponibles(fechaInput, timeSlotsGrid, occupiedTimes = new Set(), availabilityVerified = false) {
  if (!fechaInput || !timeSlotsGrid) return;

  const hoy = obtenerFechaLocalISO();
  fechaInput.min = hoy;
  const fechaSeleccionada = fechaInput.value;
  const ahora = new Date();

  timeSlotsGrid.querySelectorAll('.time-slot').forEach(slot => {
    const hora = slot.textContent.trim();
    const ocupado = occupiedTimes.has(hora);
    const noDisponible = !availabilityVerified || ocupado || fechaSeleccionada < hoy
      || (fechaSeleccionada === hoy && !esFechaHoraReservaValida(fechaSeleccionada, hora, ahora));

    slot.setAttribute('aria-disabled', String(noDisponible));
    slot.tabIndex = noDisponible ? -1 : 0;
    slot.classList.toggle('is-unavailable', noDisponible);
    slot.classList.toggle('is-occupied', ocupado);
    if (ocupado) {
        slot.setAttribute('title', 'Horario ya reservado');
    } else {
      slot.removeAttribute('title');
    }
    if (noDisponible) slot.classList.remove('active');
  });
}

function esFechaHoraReservaValida(fecha, hora, ahora = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) return false;

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas, minutos] = hora.split(':').map(Number);
  if (horas > 23 || minutos > 59) return false;

  const fechaHora = new Date(`${fecha}T${hora}:00`);
  if (Number.isNaN(fechaHora.getTime())) return false;
  if (
    fechaHora.getFullYear() !== anio
    || fechaHora.getMonth() + 1 !== mes
    || fechaHora.getDate() !== dia
  ) return false;

  return fechaHora.getTime() > ahora.getTime();
}

async function buscarReservasPorTelefono(event) {
  event.preventDefault();

  const telefonoInput = document.getElementById('inputBuscarTelefono');
  const resultado = document.getElementById('resultadoCitaCliente');
  const botonBuscar = document.getElementById('btnBuscarReserva');
  const telefono = telefonoInput?.value.trim();
  if (!telefono || !resultado || !botonBuscar) {
    if (!telefono) await mostrarAlerta('Teléfono requerido', 'Por favor ingresa tu número de teléfono.', 'warning');
    return;
  }

  resultado.replaceChildren();
  resultado.hidden = false;
  resultado.textContent = 'Buscando reservas...';
  botonBuscar.disabled = true;

  try {
    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .select('id, nombre')
      .eq('telefono', telefono)
      .limit(1)
      .maybeSingle();

    if (errorCliente) throw errorCliente;
    if (!cliente) {
      mostrarMensajeReservas(resultado, 'No se encontraron citas pendientes asociadas a ese número.', true);
      return;
    }

    const { data: citas, error: errorCitas } = await supabase
      .from('citas')
      .select('id, fecha, hora, estado, barberos(nombre), servicios(nombre)')
      .eq('cliente_id', cliente.id)
      .eq('estado', 'pendiente')
      .gte('fecha', obtenerFechaLocalISO())
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (errorCitas) throw errorCitas;
    if (!citas?.length) {
      mostrarMensajeReservas(resultado, 'No se encontraron citas pendientes asociadas a ese número.', true);
      return;
    }

    resultado.replaceChildren(...citas.map(cita => {
      const tarjeta = document.createElement('article');
      const nombre = document.createElement('p');
      const servicio = document.createElement('p');
      const fechaHora = document.createElement('p');
      const botonCancelar = document.createElement('button');

      tarjeta.className = 'booking-cancel-card';
      nombre.textContent = `Cliente: ${cliente.nombre || 'Cliente'}`;
      servicio.textContent = `Servicio: ${obtenerNombreRelacion(cita.servicios, 'Servicio')} con ${obtenerNombreRelacion(cita.barberos, 'barbero asignado')}`;
      fechaHora.textContent = `Fecha y hora: ${cita.fecha || '--'} a las ${cita.hora || '--:--'}`;
      botonCancelar.type = 'button';
      botonCancelar.className = 'btn-box-action danger booking-cancel-button';
      botonCancelar.textContent = 'Cancelar esta reserva';
      botonCancelar.addEventListener('click', () => cancelarReservaPublica(cita, cliente.id, telefono));
      tarjeta.append(nombre, servicio, fechaHora, botonCancelar);
      return tarjeta;
    }));
  } catch (error) {
    console.error('Error al buscar reservas públicas:', error);
    mostrarMensajeReservas(resultado, `No fue posible buscar la reserva: ${error.message || 'Error desconocido.'}`, true);
  } finally {
    botonBuscar.disabled = false;
  }
}

async function cancelarReservaPublica(cita, clienteId, telefono) {
  const confirmar = await confirmarAlerta(
    '¿Cancelar la reserva?',
    `¿Estás seguro de que deseas cancelar tu cita del ${cita.fecha} a las ${cita.hora}?`,
    'Cancelar reserva'
  );
  if (!confirmar) return;

  try {
    const { data, error } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', cita.id)
      .eq('cliente_id', clienteId)
      .eq('estado', 'pendiente')
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      await mostrarAlerta('No se pudo cancelar', 'La cita ya no está pendiente o no se pudo verificar. Vuelve a buscar tus reservas.', 'warning');
      return;
    }

    await mostrarAlerta('Reserva cancelada', 'Tu reserva ha sido cancelada correctamente.', 'success');
    const inputTelefono = document.getElementById('inputBuscarTelefono');
    const formulario = document.getElementById('formBuscarReserva');
    if (inputTelefono) inputTelefono.value = telefono;
    if (formulario) formulario.requestSubmit();
  } catch (error) {
    console.error('Error al cancelar reserva pública:', error);
    await mostrarAlerta('Error al cancelar', `No fue posible cancelar la reserva: ${error.message || 'Error desconocido.'}`, 'error');
  }
}

function mostrarMensajeReservas(contenedor, mensaje, esError = false) {
  const texto = document.createElement('p');
  texto.className = esError ? 'booking-cancel-error' : 'booking-cancel-message';
  texto.textContent = mensaje;
  contenedor.replaceChildren(texto);
}

function obtenerNombreRelacion(relacion, respaldo) {
  const valor = Array.isArray(relacion) ? relacion[0]?.nombre : relacion?.nombre;
  return typeof valor === 'string' && valor.trim() ? valor.trim() : respaldo;
}

function obtenerFechaLocalISO() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

function esErrorRestriccionFechaHora(error) {
  const detalle = [error?.message, error?.details, error?.hint, error?.constraint]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
  return detalle.includes('check_fecha_hora_futura');
}

function esErrorHorarioOcupado(error) {
  const detalle = [error?.message, error?.details, error?.hint, error?.constraint]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
  return error?.code === '23505' || detalle.includes('cita_barbero_unica');
}
