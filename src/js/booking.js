import { supabase } from './supabase.js';
import { mostrarAlerta } from './alerts.js';
import { isValidColombianMobile, restrictToDigits } from './phone-validation.js';

document.addEventListener('DOMContentLoaded', () => {
  
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const step4 = document.getElementById('step4');

  
  const btnToStep2 = document.getElementById('btnToStep2');
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  const btnToStep3 = document.getElementById('btnToStep3');
  const btnBackToStep2 = document.getElementById('btnBackToStep2');
  const btnConfirmBooking = document.getElementById('btnConfirmBooking');
  const btnNewBooking = document.getElementById('btnNewBooking');
  const clientPhoneInput = document.getElementById('clientPhone');

  if (clientPhoneInput) restrictToDigits(clientPhoneInput);

  
  const servicesOptions = document.querySelectorAll('#servicesOptions .option-card');
  const barbersOptions = document.querySelectorAll('#barbersOptions .option-card');
  const timeSlots = document.querySelectorAll('#timeSlotsGrid .time-slot');

  
  let selectedService = 'Corte Clasico';
  let selectedBarber = 'Camilo Vargas';
  let selectedDate = document.getElementById('bookingDate')?.value || '2026-01-09';
  let selectedTime = '10:00';

  
  servicesOptions.forEach(card => {
    card.addEventListener('click', () => {
      servicesOptions.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedService = card.getAttribute('data-name') || card.querySelector('.option-title')?.textContent.trim();
    });
  });


  barbersOptions.forEach(card => {
    card.addEventListener('click', () => {
      barbersOptions.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedBarber = card.getAttribute('data-name') || card.querySelector('.option-title')?.textContent.trim();
      const title = document.getElementById('barberAvailableTitle');
      if (title) title.textContent = `HORARIO DISPONIBLE - ${selectedBarber.toUpperCase()}`;
    });
  });

  
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
      selectedTime = slot.textContent.trim();
    });
  });

  
  if (btnToStep2) {
    btnToStep2.addEventListener('click', () => {
      step1?.classList.remove('active');
      step2?.classList.add('active');
    });
  }

  
  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => {
      step2?.classList.remove('active');
      step1?.classList.add('active');
    });
  }

 
  if (btnToStep3) {
    btnToStep3.addEventListener('click', () => {
      selectedDate = document.getElementById('bookingDate')?.value || selectedDate;

      if (document.getElementById('summaryService')) document.getElementById('summaryService').textContent = selectedService;
      if (document.getElementById('summaryBarber')) document.getElementById('summaryBarber').textContent = selectedBarber;
      if (document.getElementById('summaryDate')) document.getElementById('summaryDate').textContent = selectedDate;
      if (document.getElementById('summaryTime')) document.getElementById('summaryTime').textContent = selectedTime;

      step2?.classList.remove('active');
      step3?.classList.add('active');
    });
  }

  if (btnBackToStep2) {
    btnBackToStep2.addEventListener('click', () => {
      step3?.classList.remove('active');
      step2?.classList.add('active');
    });
  }

  if (btnConfirmBooking) {
    btnConfirmBooking.addEventListener('click', async (e) => {
      e.preventDefault();

      const clientName = document.getElementById('clientName')?.value.trim();
      const clientPhone = document.getElementById('clientPhone')?.value.trim();
      selectedDate = document.getElementById('bookingDate')?.value || selectedDate;

      if (!selectedBarber || !selectedDate || !selectedTime || !selectedService || !clientName || !clientPhone) {
        await mostrarAlerta('Datos incompletos', 'Por favor completa todos los campos requeridos de la reserva.', 'warning');
        return;
      }

      if (!isValidColombianMobile(clientPhone)) {
        await mostrarAlerta(
          'Número inválido',
          'Ingresa un número de celular colombiano válido de 10 dígitos que comience con 3 (ejemplo: 3001234567) y no sea una secuencia inválida.',
          'warning'
        );
        return;
      }

      btnConfirmBooking.disabled = true;
      btnConfirmBooking.textContent = 'GUARDANDO...';

      try {
        const { data: citasExistentes, error: errorBusqueda } = await supabase
          .from('citas')
          .select('id')
          .eq('barbero', selectedBarber)
          .eq('fecha', selectedDate)
          .eq('hora', selectedTime)
          .limit(1);

        if (errorBusqueda) {
          console.error('❌ Error al verificar disponibilidad:', errorBusqueda);
          await mostrarAlerta('Error de disponibilidad', `Error al verificar disponibilidad: ${errorBusqueda.message}`, 'error');
          return;
        }

        if (citasExistentes?.length) {
          await mostrarAlerta('Horario ocupado', `El barbero ${selectedBarber} ya tiene una cita el día ${selectedDate} a las ${selectedTime}. Elige otro horario o barbero.`, 'warning');
          return;
        }

        const { data, error } = await supabase
          .from('citas')
          .insert([
            {
              nombre: clientName,
              telefono: clientPhone,
              servicio: selectedService,
              barbero: selectedBarber,
              fecha: selectedDate,
              hora: selectedTime
            }
          ]);

        if (error) {
          console.error('❌ Error al agendar en Supabase:', error);
          await mostrarAlerta('Error al reservar', `Ocurrió un error al agendar la cita: ${error.message}`, 'error');
          return;
        }

        console.log('✅ Cita agendada correctamente:', data);

        if (document.getElementById('confirmDetails')) {
          document.getElementById('confirmDetails').textContent = `${clientName} - ${selectedService} - ${selectedBarber}`;
        }
        if (document.getElementById('confirmDateTime')) {
          document.getElementById('confirmDateTime').textContent = `${selectedDate} a las ${selectedTime}`;
        }

        step3?.classList.remove('active');
        step4?.classList.add('active');
      } catch (error) {
        console.error('❌ Error inesperado al confirmar la reserva:', error);
        await mostrarAlerta('Error al reservar', 'Ocurrió un error al confirmar la reserva. Inténtalo de nuevo.', 'error');
      } finally {
        btnConfirmBooking.disabled = false;
        btnConfirmBooking.textContent = 'CONFIRMAR RESERVA →';
      }
    });
  }

  
  if (btnNewBooking) {
    btnNewBooking.addEventListener('click', () => {
      step4?.classList.remove('active');
      step1?.classList.add('active');
    });
  }
});