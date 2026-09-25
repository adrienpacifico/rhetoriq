import { AlertTriangle, Captions, Check, LayoutGrid, Scale, SearchCheck, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { KIND_COLOR } from '../lib/format'

const STEPS = [
  {
    icon: Captions,
    title: 'Transcription',
    text: "Les sous-titres de la vidéo sont récupérés et alignés au mot près. La vidéo n'est jamais téléchargée : elle est lue dans le lecteur YouTube intégré.",
  },
  {
    icon: Users,
    title: 'Qui parle ?',
    text: 'Un premier agent (Claude Sonnet) attribue chaque passage à un intervenant et découpe la vidéo en chapitres.',
  },
  {
    icon: Sparkles,
    title: 'Trois analyses en parallèle',
    text: "Trois agents indépendants (Claude Opus) lisent l'intégralité de la transcription, chacun avec sa propre grille de lecture.",
  },
  {
    icon: ShieldCheck,
    title: 'Contrôle et ancrage',
    text: "Chaque annotation doit citer mot pour mot un passage du transcript. Un script vérifie les citations, les intervenants et les champs avant publication, puis tout est synchronisé avec la vidéo.",
  },
]

const LENSES = [
  {
    icon: AlertTriangle,
    color: KIND_COLOR.fallacy,
    title: 'Sophismes et procédés',
    text: "Homme de paille, faux dilemme, généralisation hâtive, esquive, cadrage… Chaque passage relevé est expliqué, avec une gravité et un indice de confiance.",
  },
  {
    icon: SearchCheck,
    color: KIND_COLOR.fact,
    title: 'Vérification des faits',
    text: 'Chiffres, lois, rapports, événements : chaque affirmation vérifiable fait l’objet d’une recherche web, en privilégiant sources institutionnelles, presse de référence et fact-checkers. Les sources sont citées.',
  },
  {
    icon: Scale,
    color: '#2ec4b6',
    title: 'Éthique de la discussion',
    text: 'D’après Jürgen Habermas : vérité, justesse, sincérité et intelligibilité des propos, et « situation idéale de parole » — égalité de parole, absence de pression, primauté du meilleur argument.',
  },
]

const PRINCIPLES = [
  'Les mêmes grilles pour tous les intervenants, quel que soit leur camp — modérateur compris lorsqu’il oriente une question.',
  'On juge la forme de l’argument, pas l’opinion défendue : un désaccord légitime n’est pas un sophisme.',
  'Rien sans citation : chaque annotation renvoie au passage exact et au moment de la vidéo, pour juger sur pièce.',
  'Les incertitudes restent visibles : indice de confiance, affirmations invérifiables signalées comme telles.',
  'Le mode « No spoil » ne révèle les annotations qu’au fil de la vidéo, pour se forger un avis avant de lire celui de la machine.',
]

export function About() {
  return (
    <div className="gallery about-page">
      <header className="gallery-header">
        <a className="brand as-link" href="#" title="Retour à la bibliothèque">
          <span className="brand-mark" aria-hidden>
            <Sparkles size={16} />
          </span>
          <span className="brand-name">Rhetoriq</span>
          <span className="brand-tag">analyse du discours</span>
        </a>
        <a className="btn ghost about-nav" href="#">
          <LayoutGrid size={14} />
          Vidéos
        </a>
      </header>

      <main className="about">
        <section className="about-hero">
          <div className="about-kicker">À propos</div>
          <h1>Analyser le discours politique, le plus objectivement possible</h1>
          <p className="about-lead">
            Rhetoriq confie à des modèles de langage (LLM) l’analyse de débats, d’interviews et de discours politiques. Chaque prise de parole passe au crible des mêmes
            grilles : sophismes et procédés rhétoriques, vérification des faits, qualité du débat au sens de Habermas. Le but n’est pas de dire qui a raison, mais de
            rendre visible la manière dont on argumente.
          </p>
          <p className="about-byline">
            Un projet d’<strong>Adrien Pacifico</strong>
          </p>
        </section>

        <section>
          <h2>La démarche</h2>
          <ol className="about-steps">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} style={{ animationDelay: `${i * 60}ms` }}>
                <span className="about-step-icon">
                  <Icon size={16} />
                </span>
                <div>
                  <h3>
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span> {title}
                  </h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2>Trois grilles de lecture</h2>
          <div className="about-lenses">
            {LENSES.map(({ icon: Icon, color, title, text }) => (
              <article key={title} className="about-lens" style={{ ['--c' as string]: color }}>
                <Icon size={18} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Viser l’objectivité</h2>
          <ul className="about-principles">
            {PRINCIPLES.map((p) => (
              <li key={p}>
                <Check size={15} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-limits">
          <h2>
            <AlertTriangle size={16} /> Limites
          </h2>
          <p>
            Un modèle de langage peut se tromper, surinterpréter un passage ou reproduire des biais issus de ses données d’entraînement. Les sous-titres automatiques
            déforment parfois les noms propres, et l’attribution des tours de parole est déduite du seul texte. Les scores sont des indicateurs, pas des verdicts.
          </p>
          <p>Rhetoriq est une expérimentation : un outil pour exercer son esprit critique, pas un arbitre.</p>
        </section>

        <footer className="about-foot">
          <span>Rhetoriq · un projet d’Adrien Pacifico</span>
          <a className="btn primary" href="#">
            <LayoutGrid size={14} />
            Voir les vidéos analysées
          </a>
        </footer>
      </main>
    </div>
  )
}
