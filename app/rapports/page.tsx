"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Presence = {
  date: string;
  heureDebut: string;
  heureFin: string;
  presence: boolean | null;
};

type Trimestre = {
  id: string;
  annee: number;
  numero: 1 | 2 | 3 | 4;
  libelle: string;
};

const PRESENCES_FICTIVES: Presence[] = [
  { date: "2026-01-15", heureDebut: "09:00", heureFin: "12:00", presence: true },
  { date: "2026-02-03", heureDebut: "13:00", heureFin: "16:00", presence: true },
  { date: "2026-04-10", heureDebut: "09:00", heureFin: "12:00", presence: true },
  { date: "2026-05-12", heureDebut: "13:00", heureFin: "16:00", presence: true },
  { date: "2026-07-08", heureDebut: "10:00", heureFin: "14:00", presence: true },
  { date: "2026-08-15", heureDebut: "09:30", heureFin: "12:00", presence: true },
  { date: "2026-11-23", heureDebut: "09:00", heureFin: "12:00", presence: true },
  { date: "2026-11-24", heureDebut: "13:00", heureFin: "16:00", presence: null },
];

const TRIMESTRES: Trimestre[] = [1, 2, 3, 4].map((numero) => ({
  id: `2026-T${numero}`,
  annee: 2026,
  numero: numero as Trimestre["numero"],
  libelle: `Trimestre ${numero} — 2026`,
}));

const minutesDepuisMinuit = (heure: string) => {
  const [heures, minutes] = heure.split(":").map(Number);
  return heures * 60 + minutes;
};

const trimestreDeLaDate = (date: string) =>
  Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1;

const calculerTotal = (trimestre: Trimestre) =>
  PRESENCES_FICTIVES.filter(
    (presence) =>
      presence.presence === true &&
      Number(presence.date.slice(0, 4)) === trimestre.annee &&
      trimestreDeLaDate(presence.date) === trimestre.numero,
  ).reduce(
    (total, presence) =>
      total +
      (minutesDepuisMinuit(presence.heureFin) -
        minutesDepuisMinuit(presence.heureDebut)) /
        60,
    0,
  );

const afficherHeures = (heures: number) =>
  new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: heures % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(heures);

const echapperPDF = (texte: string) =>
  texte.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");

const creerPDF = (trimestre: Trimestre, total: number) => {
  const contenu = [
    "BT",
    "/F1 24 Tf",
    "72 740 Td",
    `(${echapperPDF("Panier Solidaire")}) Tj`,
    "0 -42 Td",
    "/F1 18 Tf",
    `(${echapperPDF("Rapport trimestriel des heures")}) Tj`,
    "0 -52 Td",
    "/F1 13 Tf",
    `(${echapperPDF(`Trimestre ${trimestre.numero} - ${trimestre.annee}`)}) Tj`,
    "0 -44 Td",
    "/F1 28 Tf",
    `(${echapperPDF(`${afficherHeures(total).replace(",", ".")} heures`)}) Tj`,
    "0 -38 Td",
    "/F1 11 Tf",
    `(${echapperPDF("Total des heures de benevolat confirmees")}) Tj`,
    "0 -70 Td",
    "/F1 9 Tf",
    `(${echapperPDF("Rapport genere avec des donnees fictives du prototype.")}) Tj`,
    "ET",
  ].join("\n");

  const objets = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${contenu.length} >>\nstream\n${contenu}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Title (${echapperPDF(`Rapport ${trimestre.id}`)}) /Author (${echapperPDF("Panier Solidaire")}) >>`,
  ];

  let document = "%PDF-1.4\n";
  const positions = [0];
  for (const [index, objet] of objets.entries()) {
    positions.push(new TextEncoder().encode(document).length);
    document += `${index + 1} 0 obj\n${objet}\nendobj\n`;
  }

  const positionXref = new TextEncoder().encode(document).length;
  document += `xref\n0 ${objets.length + 1}\n`;
  document += "0000000000 65535 f \n";
  document += positions
    .slice(1)
    .map((position) => `${String(position).padStart(10, "0")} 00000 n \n`)
    .join("");
  document += `trailer\n<< /Size ${objets.length + 1} /Root 1 0 R /Info 6 0 R >>\n`;
  document += `startxref\n${positionXref}\n%%EOF`;

  return new TextEncoder().encode(document);
};

export default function RapportsPage() {
  const [trimestreId, setTrimestreId] = useState("2026-T4");
  const [message, setMessage] = useState("");

  const trimestre = TRIMESTRES.find((option) => option.id === trimestreId) ?? TRIMESTRES[0];
  const total = useMemo(() => calculerTotal(trimestre), [trimestre]);
  const totaux = useMemo(
    () => TRIMESTRES.map((option) => ({ ...option, total: calculerTotal(option) })),
    [],
  );
  const maximum = Math.max(...totaux.map((option) => option.total), 1);

  const telecharger = () => {
    const fichier = creerPDF(trimestre, total);
    const url = URL.createObjectURL(new Blob([fichier], { type: "application/pdf" }));
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `rapport-heures-${trimestre.id}.pdf`;
    lien.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    setMessage(`Le rapport ${trimestre.id} a été généré.`);
  };

  return (
    <main>
      <header className="entete">
        <Link className="marque" href="/" aria-label="Panier Solidaire — accueil">
          <span aria-hidden="true">P</span>
          Panier Solidaire
        </Link>
        <nav className="nav-principale" aria-label="Navigation principale">
          <Link href="/">Espace bénévole</Link>
          <strong>Rapports</strong>
        </nav>
      </header>

      <div className="contenu contenu-rapport">
        <section className="intro intro-rapport">
          <div>
            <p className="surtitre">Espace direction · prototype</p>
            <h1>Rapport des heures de bénévolat.</h1>
            <p>
              Consulte le total trimestriel et produis un document sans détail
              nominatif pour les bailleurs de fonds.
            </p>
          </div>
        </section>

        <section className="panneau-rapport" aria-labelledby="rapport-trimestriel">
          <div className="controle-trimestre">
            <label htmlFor="trimestre">Période du rapport</label>
            <select
              id="trimestre"
              value={trimestreId}
              onChange={(event) => {
                setTrimestreId(event.target.value);
                setMessage("");
              }}
            >
              {TRIMESTRES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="total-heures">
            <p>Total confirmé</p>
            <h2 id="rapport-trimestriel">
              {afficherHeures(total)} <span>heures</span>
            </h2>
            <p>
              Seules les présences confirmées du trimestre sélectionné sont
              comptabilisées.
            </p>
          </div>

          <button className="primaire bouton-pdf" type="button" onClick={telecharger}>
            Télécharger le rapport PDF
          </button>
          {message ? (
            <p className="message" role="status">
              {message}
            </p>
          ) : null}
        </section>

        <section className="comparaison" aria-labelledby="comparaison-annuelle">
          <div>
            <p className="surtitre">Vue annuelle</p>
            <h2 id="comparaison-annuelle">Comparaison des trimestres</h2>
          </div>
          <div className="barres">
            {totaux.map((option) => (
              <button
                className={option.id === trimestreId ? "barre-active" : ""}
                type="button"
                key={option.id}
                onClick={() => {
                  setTrimestreId(option.id);
                  setMessage("");
                }}
                aria-label={`Afficher ${option.libelle}: ${afficherHeures(option.total)} heures`}
              >
                <span>T{option.numero}</span>
                <span className="rail-barre" aria-hidden="true">
                  <span style={{ width: `${(option.total / maximum) * 100}%` }} />
                </span>
                <strong>{afficherHeures(option.total)} h</strong>
              </button>
            ))}
          </div>
          <p className="note-confidentialite">
            Données entièrement fictives. Le rapport exporté contient seulement
            la période et le total agrégé.
          </p>
        </section>
      </div>
    </main>
  );
}
