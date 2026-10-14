export const ROLES = { admin: 'Administrador', medico: 'Médico', recep: 'Recepción' }

export const MENU = [
  ['dash', '▦', 'Dashboard', ['admin', 'medico', 'recep']],
  ['pac', '☺', 'Pacientes', ['admin', 'medico', 'recep']],
  ['cit', '◷', 'Citas', ['admin', 'medico', 'recep']],
  ['con', '✎', 'Consultas', ['admin', 'medico']],
  ['rep', '⎙', 'Reportes', ['admin', 'medico']],
  ['aud', '⚑', 'Auditoría', ['admin']],
]

export const seedUsers = [
  { u: 'admin', n: 'Administrador', c: 'admin@sgp.bo', pw: 'Demo1234!', r: 'admin' },
  { u: 'dra.ramirez', n: 'Dra. Ramírez', c: 'ramirez@sgp.bo', pw: 'Demo1234!', r: 'medico' },
  { u: 'recepcion', n: 'Recepción', c: 'recepcion@sgp.bo', pw: 'Demo1234!', r: 'recep' },
]

export const seedPac = [
  { id: 1, nom: 'Lucía Mamani Quispe', ci: '8452113 LP', edad: 34, tel: '72145890', sangre: 'O+', estado: 1 },
  { id: 2, nom: 'Carlos Condori Flores', ci: '6120987 LP', edad: 58, tel: '76234111', sangre: 'A+', estado: 1 },
  { id: 3, nom: 'Rosa Villca Choque', ci: '9031244 CB', edad: 27, tel: '71987654', sangre: 'B+', estado: 1 },
  { id: 4, nom: 'Jorge Apaza Ticona', ci: '5543210 LP', edad: 66, tel: '78811223', sangre: 'O-', estado: 1 },
  { id: 5, nom: 'Ana Salazar Rojas', ci: '7765432 SC', edad: 41, tel: '69004455', sangre: 'AB+', estado: 0 },
]

export const seedCit = [
  { id: 1, pac: 1, hora: '08:30', mot: 'Control de presión', est: 'Atendida' },
  { id: 2, pac: 2, hora: '09:15', mot: 'Dolor lumbar', est: 'En espera' },
  { id: 3, pac: 3, hora: '10:00', mot: 'Primera consulta', est: 'Pendiente' },
  { id: 4, pac: 4, hora: '11:30', mot: 'Resultados de laboratorio', est: 'Pendiente' },
  { id: 5, pac: 1, hora: '15:00', mot: 'Seguimiento', est: 'Cancelada' },
]

export const seedCon = [
  { pac: 1, fecha: '2026-09-28', dx: 'Hipertensión arterial leve', tx: 'Losartán 50 mg cada 24 h. Control en 2 semanas.' },
  { pac: 1, fecha: '2026-08-12', dx: 'Cefalea tensional', tx: 'Paracetamol 500 mg si hay dolor. Reducir cafeína.' },
  { pac: 2, fecha: '2026-09-02', dx: 'Lumbalgia mecánica', tx: 'Reposo relativo y fisioterapia, 10 sesiones.' },
]

export const seedLog = [
  ['dra.ramirez', '190.129.14.22', 'Ingreso', 'Chrome 126', '06/10/2026 08:12'],
  ['recepcion1', '190.129.14.31', 'Paciente creado', 'Firefox 128', '06/10/2026 08:40'],
  ['dra.ramirez', '190.129.14.22', 'Ficha clínica exportada', 'Chrome 126', '06/10/2026 09:05'],
  ['desconocido', '181.115.2.9', 'Intento fallido (2/3)', 'Edge 126', '05/10/2026 22:47'],
  ['admin', '190.129.14.10', 'Rol modificado', 'Chrome 126', '05/10/2026 17:30'],
]
