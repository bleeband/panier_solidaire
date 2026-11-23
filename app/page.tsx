import Image from "next/image";

export default function Home() {
  return (
    <main className="attente">
      <div className="attente-lueur attente-lueur-gauche" aria-hidden="true" />
      <div className="attente-lueur attente-lueur-droite" aria-hidden="true" />

      <header className="attente-entete">
        <a className="attente-marque" href="#contenu" aria-label="Le Panier solidaire — accueil">
          <span className="attente-monogramme" aria-hidden="true">PS</span>
          <span>Le Panier solidaire</span>
        </a>
        <span className="attente-statut">
          <span aria-hidden="true" />
          En préparation
        </span>
      </header>

      <section id="contenu" className="attente-contenu" aria-labelledby="titre-attente">
        <div className="attente-texte">
          <p className="attente-surtitre">Une initiative locale et solidaire</p>
          <h1 id="titre-attente">Quelque chose de bon se prépare.</h1>
          <p className="attente-description">
            Notre nouvelle plateforme arrive bientôt pour faciliter l’engagement
            bénévole et soutenir la communauté.
          </p>
          <div className="attente-separateur" aria-hidden="true" />
          <p className="attente-note">Revenez nous voir bientôt.</p>
        </div>

        <aside className="attente-partenaire" aria-label="Partenaire technologique">
          <p>Conçu et développé avec soin par</p>
          <div className="attente-logo">
            <Image
              src="/pentabyte-logo.jpg"
              alt="Pentabyte"
              width={2048}
              height={2048}
              priority
            />
          </div>
        </aside>
      </section>

      <footer className="attente-pied">
        <span>Le Panier solidaire</span>
        <span>Montréal, Québec</span>
      </footer>
    </main>
  );
}
