export function normalizarEstadoCita(estado) {
  const valor = String(estado || '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');

  if (valor.startsWith('cancelad') || valor.startsWith('anulad')) return 'cancelada';
  if (
    valor.startsWith('atendid')
    || valor.startsWith('completad')
    || valor.startsWith('realizad')
    || valor.startsWith('finalizad')
  ) {
    return 'atendida';
  }
  if (
    valor.startsWith('pendiente')
    || valor.startsWith('confirmad')
    || valor.startsWith('reservad')
    || valor.startsWith('programad')
  ) {
    return 'pendiente';
  }
  return 'desconocido';
}
