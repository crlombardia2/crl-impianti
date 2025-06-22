// App Ordinamento V12 - completo e funzionante
import React, { useState, useEffect } from "react";
import "./App.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import datiJson from "./dati.json";
import {
  SI_NO,
  FONDI,
  CATEGORIE,
  DELEG,
  ENTI
} from "./selectOptions";

const campiPrincipali = [
  "CodiceCampo", "denominazione", "localita", "provincia", "tipologia",
  "scadenzaOmologazione", "categoriaFIGC"
];

const colonneAccordion = [
  [
    "indirizzo", "dataOmologa", "enteProprietario", "delegazione", "tipologiaFondo",
    "defibrillatore", "misureCampo", "societa"
  ],
  [
    "impiantoIlluminazione", "dataOmologazioneIlluminazione", "durataOmologazioneIlluminazione",
    "scadenzaOmologazioneIlluminazione", "durata",
    "energiaRinnovabile", "areaRistoro", "beachSoccer", "tribune"
  ],
  [
    "richiestaSanatoriaEA", "dataScadenzaEA",
    "omologatore","noteFiduciario", "googleMaps", "pdfLink"
  ]
];

const etichetteCampi = {
  codice: "Codice",
  denominazione: "Denominazione",
  localita: "Località",
  provincia: "Prov.",
  tipologia: "Tipologia",
  scadenzaOmologazione: "Scadenza",
  categoriaFIGC: "Cat. FIGC",
  indirizzo: "Indirizzo",
  enteProprietario: "Ente Proprietario",
  delegazione: "Delegazione",
  tipologiaFondo: "Tipologia Fondo",
  impiantoIlluminazione: "Imp. Illuminazione",
  defibrillatore: "Defibrillatore",
  misureCampo: "Misure Campo",
  societa: "Società",
  dataOmologa: "Data Omolog. Struttura",
  durata: "Durata Omolog.",
  energiaRinnovabile: "Energia Rinnovabile",
  areaRistoro: "Area Ristoro",
  beachSoccer: "Beach Soccer",
  tribune: "Tribune",
  richiestaSanatoriaEA: "Sanatoria EA",
  dataScadenzaEA: "Scadenza EA",
  noteFiduciario: "Note Fiduciario",
  googleMaps: "Link Maps",
  omologatore: "Omologatore",
  noteOmologatore: "Note Omologatore",
  dataOmologazioneIlluminazione: "Data Omol. Imp. Illum.",
  durataOmologazioneIlluminazione: "Durata Imp. Illum.",
  scadenzaOmologazioneIlluminazione: "Scadenza Imp. Illum.",
  pdfLink: "PDF Allegato"
};

const selectMap = {
  tipologiaFondo: FONDI,
  impiantoIlluminazione: SI_NO,
  categoriaFIGC: CATEGORIE,
  delegazione: DELEG,
  defibrillatore: SI_NO,
  energiaRinnovabile: SI_NO,
  areaRistoro: SI_NO,
  beachSoccer: SI_NO,
  richiestaSanatoriaEA: SI_NO,
  enteProprietario: ENTI,
  tribune: SI_NO
};


function App() {
  const [dati, setDati] = useState([]);
  const [filtri, setFiltri] = useState({});
  const [modificaIndex, setModificaIndex] = useState(null);
  const [modificaData, setModificaData] = useState({});
  const [aperto, setAperto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const handlePulisciFiltri = () => {
  setFiltri({});
  setSortField(null);
  setSortDirection(null);
  setCurrentPage(1);
};

  useEffect(() => {
    setDati(datiJson);
  }, []);

  const handleFiltro = (campo, valore) => {
    setFiltri({ ...filtri, [campo]: valore });
  };

  const handleSort = (campo) => {
    if (sortField === campo) {
      const next = sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc";
      setSortDirection(next);
      if (next === null) setSortField(null);
    } else {
      setSortField(campo);
      setSortDirection("asc");
    }
  };

  const datiFiltrati = dati.filter((riga) =>
    campiPrincipali.every((campo) =>
      !filtri[campo] || riga[campo]?.toLowerCase().includes(filtri[campo].toLowerCase())
    )
  );

  const datiOrdinati = [...datiFiltrati];
  if (sortField && sortDirection) {
    datiOrdinati.sort((a, b) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      return sortDirection === "asc"
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    });
  }

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const pagedRows = datiOrdinati.slice(startIdx, endIdx);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModificaData({ ...modificaData, [name]: value });
  };

  const handleModifica = (index) => {
    setModificaIndex(index);
    setModificaData(pagedRows[index]);
    setAperto(index);
  };

	const handleSalva = (index) => {
  const codice = modificaData.CodiceCampo;
  const globalIndex = dati.findIndex(d => d.CodiceCampo === codice);
  if (globalIndex !== -1) {
    const nuovi = [...dati];
    nuovi[globalIndex] = modificaData;
    setDati(nuovi);
  }
  setModificaIndex(null);
  setModificaData({});
  setAperto(null);
};

  const handleAnnulla = () => {
    setModificaIndex(null);
    setModificaData({});
    setAperto(null);
  };

  const handleElimina = (index) => {
    const globalIndex = dati.indexOf(pagedRows[index]);
    const nuovi = dati.filter((_, i) => i !== globalIndex);
    setDati(nuovi);
    setModificaIndex(null);
    setAperto(null);
  };

  const handleAggiungi = () => {
    if (modificaIndex !== null) return;
    const codiciValidi = dati.map(d => d.CodiceCampo).filter(c => /^\d+$/.test(c)).map(c => parseInt(c));
    const nuovoCodice = String((codiciValidi.length ? Math.max(...codiciValidi) : 0) + 1).padStart(4, "0");
    const nuovo = Object.fromEntries([...campiPrincipali, ...colonneAccordion.flat()].map(c => [c, ""]));
    nuovo.CodiceCampo = nuovoCodice;
    const nuoviDati = [...dati, nuovo];
    setDati(nuoviDati);
    setFiltri({});
    setSortField(null);
    setSortDirection(null);
    const nuovaPagina = Math.ceil(nuoviDati.length / rowsPerPage);
    setCurrentPage(nuovaPagina);
    setModificaIndex(nuoviDati.length - 1);
    setModificaData(nuovo);
    setAperto(nuoviDati.length - 1);
  };

  const handleEsporta = () => {
    const worksheet = XLSX.utils.json_to_sheet(dati);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Impianti");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "impianti.xlsx");
  };

  const renderInput = (campo, value) => {
  if (modificaIndex !== null) {
    if (selectMap[campo]) {
      return (
        <select name={campo} value={modificaData[campo] || ""} onChange={handleChange}>
          <option value=""></option>
          {selectMap[campo].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if ([
      "dataOmologa",
      "scadenzaOmologazione",
      "dataScadenzaEA",
      "dataOmologazioneIlluminazione",
      "scadenzaOmologazioneIlluminazione"
    ].includes(campo)) {
      return (
        <input
		  type="date"
		  className="modifica-date"
		  name={campo}
		  value={modificaData[campo] || ""}
		  onChange={handleChange}
		/>
      );
    }
    return <input name={campo} value={modificaData[campo] || ""} onChange={handleChange} />;
  }
  if (campo === "pdfLink" && value) {
    return <a href={value} target="_blank" rel="noopener noreferrer">📄 Visualizza PDF</a>;
  }
  return <span>{value}</span>;
  };

  return (
    <div className="App">
      <h2>CRL Impianti</h2>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleAggiungi}>Nuovo</button>
        <button onClick={handleEsporta}>Esporta Excel</button>
        <button onClick={handlePulisciFiltri}>Pulisci Filtri</button> 
      </div>
      <table>
        <thead>
          <tr>
            {campiPrincipali.map((campo) => (
              <th key={campo} onClick={() => handleSort(campo)} style={{ cursor: 'pointer' }}>
                {etichetteCampi[campo] || campo}
                {sortField === campo && sortDirection === 'asc' && ' ▲'}
                {sortField === campo && sortDirection === 'desc' && ' ▼'}
                <br />
                <input
                  placeholder="Filtro"
                  value={filtri[campo] || ""}
                  onChange={(e) => handleFiltro(campo, e.target.value)}
                  style={{ width: "90%" }}
                  onClick={(e) => e.stopPropagation()}
                />
              </th>
            ))}
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((riga, index) => (
            <React.Fragment key={index}>
              <tr
                className="data-row"
                style={{ backgroundColor: modificaIndex === index ? "#ffffcc" : "", cursor: "pointer" }}
                onClick={() => setAperto(aperto === index ? null : index)}
              >
                {campiPrincipali.map((campo) => (
                  <td key={campo}>{renderInput(campo, riga[campo])}</td>
                ))}
                <td>
                  {modificaIndex === index ? (
                    <>
                      <button onClick={() => handleSalva(index)}>Salva</button>
                      <button onClick={handleAnnulla}>Annulla</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleModifica(index)}>Modifica</button>
                      <button onClick={() => handleElimina(index)}>Cancella</button>
                      {riga.pdfLink && (
                        <a href={riga.pdfLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '6px' }}>📄</a>
                      )}
                    </>
                  )}
                </td>
              </tr>
              {aperto === index && (
                <tr>
                  <td colSpan={campiPrincipali.length + 1}>
                    <div style={{ display: "flex", gap: "40px" }}>
                      {colonneAccordion.map((colonna, idx) => (
                        <div key={idx} style={{ flex: 1 }}>
                          {colonna.map((campo) => (
                            <div key={campo} style={{ marginBottom: "8px" }}>
                              <label style={{ fontWeight: 600 }}>{etichetteCampi[campo] || campo}:</label>
                              <div>{renderInput(campo, riga[campo])}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀ Pagina precedente</button>
          <span style={{ margin: '0 1rem' }}>Pagina {currentPage} di {Math.ceil(datiFiltrati.length / rowsPerPage)}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(datiFiltrati.length / rowsPerPage)))} disabled={currentPage === Math.ceil(datiFiltrati.length / rowsPerPage)}>Pagina successiva ▶</button>
        </div>
        <div>
          <label>Righe per pagina: </label>
          <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
