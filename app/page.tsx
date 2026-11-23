"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Quart = {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  tache: string;
  capacite: number;
  inscriptionsInitiales: number;
};

type ProfilBenevole = {
  id: string;
  nomComplet: string;
  telephone: string;
  courriel: string;
  disponibilites: string;
  taches: string;
};

type InscriptionLocale = {
  id: string;
  proprietaireId: string;
  quartId: string;
  miseAJour: string;
};

type DonneesLocales = {
  profil: ProfilBenevole;
  inscription: InscriptionLocale;
};

const CLE_STOCKAGE = "panier-solidaire.inscription-benevole.v1";

const QUARTS: Quart[] = [
  {
    id: "44444444-4444-4444-8444-444444444444",
    date: "2026-11-23",
    heureDebut: "09:00",
    heureFin: "12:00",
    tache: "Tri des aliments",
    capacite: 3,
    inscriptionsInitiales: 2,
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    date: "2026-11-24",
    heureDebut: "13:00",
    heureFin: "16:00",
    tache: "Distribution",
    capacite: 2,
    inscriptionsInitiales: 1,
  },
];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Toronto",
  }).format(new Date(`${date}T12:00:00`));

const estDonneesLocales = (valeur: unknown): valeur is DonneesLocales => {
  if (!valeur || typeof valeur !== "object") return false;

  const donnees = valeur as Partial<DonneesLocales>;
  return Boolean(
    donnees.profil?.id &&
      donnees.profil.nomComplet &&
      donnees.inscription?.id &&
      donnees.inscription.proprietaireId === donnees.profil.id &&
      QUARTS.some((quart) => quart.id === donnees.inscription?.quartId),
  );
};

export default function Home() {
  const [donnees, setDonnees] = useState<DonneesLocales | null>(null);
  const [pret, setPret] = useState(false);
  const [nomComplet, setNomComplet] = useState("");
  const [telephone, setTelephone] = useState("");
  const [courriel, setCourriel] = useState("");
  const [disponibilites, setDisponibilites] = useState("");
  const [taches, setTaches] = useState("");
  const [quartId, setQuartId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hydratation = window.setTimeout(() => {
      try {
        const brut = window.localStorage.getItem(CLE_STOCKAGE);
        const sauvegarde: unknown = brut ? JSON.parse(brut) : null;

        if (estDonneesLocales(sauvegarde)) {
          setDonnees(sauvegarde);
          setNomComplet(sauvegarde.profil.nomComplet);
          setTelephone(sauvegarde.profil.telephone);
          setCourriel(sauvegarde.profil.courriel);
          setDisponibilites(sauvegarde.profil.disponibilites);
          setTaches(sauvegarde.profil.taches);
          setQuartId(sauvegarde.inscription.quartId);
        }
      } catch {
        window.localStorage.removeItem(CLE_STOCKAGE);
      } finally {
        setPret(true);
      }
    }, 0);

    return () => window.clearTimeout(hydratation);
  }, []);

  const quartInscrit = useMemo(
    () => QUARTS.find((quart) => quart.id === donnees?.inscription.quartId),
    [donnees],
  );

  const placesRestantes = (quart: Quart) => {
    const inscriptionLocale = donnees?.inscription.quartId === quart.id ? 1 : 0;
    return Math.max(
      quart.capacite - quart.inscriptionsInitiales - inscriptionLocale,
      0,
    );
  };

  const quartSelectionnable = (quart: Quart) =>
    placesRestantes(quart) > 0 || donnees?.inscription.quartId === quart.id;

  const sauvegarder = (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault();
    setMessage("");

    if (!telephone.trim() && !courriel.trim()) {
      setMessage("Ajoute un numéro de téléphone ou une adresse courriel.");
      return;
    }

    const quart = QUARTS.find((option) => option.id === quartId);
    if (!quart || !quartSelectionnable(quart)) {
      setMessage("Choisis un quart qui a encore une place disponible.");
      return;
    }

    const profilId = donnees?.profil.id ?? window.crypto.randomUUID();
    const nouvellesDonnees: DonneesLocales = {
      profil: {
        id: profilId,
        nomComplet: nomComplet.trim(),
        telephone: telephone.trim(),
        courriel: courriel.trim(),
        disponibilites: disponibilites.trim(),
        taches: taches.trim(),
      },
      inscription: {
        id: donnees?.inscription.id ?? window.crypto.randomUUID(),
        proprietaireId: profilId,
        quartId: quart.id,
        miseAJour: new Date().toISOString(),
      },
    };

    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(nouvellesDonnees));
    setDonnees(nouvellesDonnees);
    setMessage(
      donnees
        ? "Ton inscription a été modifiée."
        : "Ton inscription est confirmée.",
    );
  };

  const effacerMesDonnees = () => {
    window.localStorage.removeItem(CLE_STOCKAGE);
    setDonnees(null);
    setNomComplet("");
    setTelephone("");
    setCourriel("");
    setDisponibilites("");
    setTaches("");
    setQuartId("");
    setMessage("Tes données locales ont été effacées.");
  };

  return (
    <main>
      <header className="entete">
        <a className="marque" href="#contenu" aria-label="Panier Solidaire — accueil">
          <span aria-hidden="true">P</span>
          Panier Solidaire
        </a>
        <nav className="nav-principale" aria-label="Navigation principale">
          <strong>Espace bénévole</strong>
          <Link href="/rapports">Rapports</Link>
        </nav>
      </header>

      <div id="contenu" className="contenu">
        <section className="intro">
          <p className="surtitre">Le Panier solidaire</p>
          <h1>Choisis ton prochain quart de bénévolat.</h1>
          <p>
            Consulte les besoins de la semaine, partage tes disponibilités et
            réserve la plage qui te convient.
          </p>
        </section>

        {pret && donnees && quartInscrit ? (
          <section className="horaire" aria-labelledby="mon-horaire">
            <div>
              <p className="surtitre">Mon horaire</p>
              <h2 id="mon-horaire">Bonjour, {donnees.profil.nomComplet}</h2>
            </div>
            <article className="confirmation">
              <div className="date-badge">
                <strong>{new Date(`${quartInscrit.date}T12:00:00`).getDate()}</strong>
                <span>
                  {new Intl.DateTimeFormat("fr-CA", {
                    month: "short",
                    timeZone: "America/Toronto",
                  }).format(new Date(`${quartInscrit.date}T12:00:00`))}
                </span>
              </div>
              <div>
                <h3>{quartInscrit.tache}</h3>
                <p>
                  {formatDate(quartInscrit.date)} · {quartInscrit.heureDebut} à{" "}
                  {quartInscrit.heureFin}
                </p>
              </div>
              <span className="statut">Confirmé</span>
            </article>
            <p className="note-confidentialite">
              Seule ton inscription enregistrée dans ce navigateur est affichée.
            </p>
          </section>
        ) : null}

        <div className="grille">
          <section className="quarts" aria-labelledby="quarts-disponibles">
            <p className="surtitre">Cette semaine</p>
            <h2 id="quarts-disponibles">Quarts disponibles</h2>
            <div className="liste-quarts">
              {QUARTS.map((quart) => {
                const places = placesRestantes(quart);
                const selectionnable = quartSelectionnable(quart);

                return (
                  <label
                    className={`quart ${quartId === quart.id ? "quart-selectionne" : ""}`}
                    key={quart.id}
                  >
                    <input
                      type="radio"
                      name="quart"
                      value={quart.id}
                      checked={quartId === quart.id}
                      disabled={!selectionnable}
                      onChange={() => setQuartId(quart.id)}
                    />
                    <span className="quart-date">{formatDate(quart.date)}</span>
                    <strong>{quart.tache}</strong>
                    <span>
                      {quart.heureDebut} à {quart.heureFin}
                    </span>
                    <span className="places">
                      {donnees?.inscription.quartId === quart.id
                        ? "Ton quart actuel"
                        : `${places} place${places > 1 ? "s" : ""}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="formulaire" aria-labelledby="formulaire-inscription">
            <p className="surtitre">Tes coordonnées</p>
            <h2 id="formulaire-inscription">
              {donnees ? "Modifier mon inscription" : "M’inscrire à un quart"}
            </h2>
            <form onSubmit={sauvegarder}>
              <label>
                Nom complet
                <input
                  required
                  autoComplete="name"
                  value={nomComplet}
                  onChange={(event) => setNomComplet(event.target.value)}
                />
              </label>

              <div className="deux-colonnes">
                <label>
                  Téléphone
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={telephone}
                    onChange={(event) => setTelephone(event.target.value)}
                    placeholder="514 555-0123"
                  />
                </label>
                <label>
                  Courriel
                  <input
                    type="email"
                    autoComplete="email"
                    value={courriel}
                    onChange={(event) => setCourriel(event.target.value)}
                    placeholder="nom@exemple.ca"
                  />
                </label>
              </div>
              <p className="aide">Un téléphone ou un courriel est requis.</p>

              <label>
                Mes disponibilités
                <textarea
                  required
                  rows={3}
                  value={disponibilites}
                  onChange={(event) => setDisponibilites(event.target.value)}
                  placeholder="Ex. : les lundis et mardis avant 16 h"
                />
              </label>

              <label>
                Tâches que je peux effectuer
                <textarea
                  required
                  rows={3}
                  value={taches}
                  onChange={(event) => setTaches(event.target.value)}
                  placeholder="Ex. : tri des aliments, accueil, distribution"
                />
              </label>

              <div className="avis">
                <strong>Protection de tes renseignements</strong>
                <p>
                  Cette version locale conserve tes réponses seulement dans ce
                  navigateur. N’entre aucune donnée réelle pendant les tests.
                </p>
              </div>

              {message ? (
                <p className="message" role="status">
                  {message}
                </p>
              ) : null}

              <button className="primaire" type="submit" disabled={!quartId}>
                {donnees ? "Enregistrer mes changements" : "Confirmer mon inscription"}
              </button>

              {donnees ? (
                <button className="secondaire" type="button" onClick={effacerMesDonnees}>
                  Effacer mes données locales
                </button>
              ) : null}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
