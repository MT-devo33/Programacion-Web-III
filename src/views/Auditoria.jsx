import Head from '../components/Head'

export default function Auditoria({ log }) {
  return (
    <>
      <Head title="Auditoría" sub="Registro de accesos y eventos del sistema." />
      <div className="card overflow-x-auto">
        <table className="tbl w-full border-collapse">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>IP</th>
              <th>Evento</th>
              <th>Navegador</th>
              <th>Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {log.map((l, i) => (
              <tr key={i}>
                <td>{l[0]}</td>
                <td>{l[1]}</td>
                <td>
                  {/fallido/.test(l[2]) ? <span className="tag t-bad">{l[2]}</span> : l[2]}
                </td>
                <td>{l[3]}</td>
                <td>{l[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
