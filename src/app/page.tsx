import Catalog from "@/components/Catalog";
import Navbar from "@/components/Navbar";

const notas = [
  { titulo: "Florales", texto: "Rosa de Damasco, jazmín y peonía en composiciones luminosas.", tono: "bg-rose-soft" },
  { titulo: "Amaderadas", texto: "Sándalo, cedro y vetiver para una presencia cálida y serena.", tono: "bg-sage-soft" },
  { titulo: "Orientales", texto: "Ámbar, vainilla y especias que perduran hasta el anochecer.", tono: "bg-sand" },
];

export default function Home() {
  return (
    <main>
      <Navbar />

      <section className="relative overflow-hidden bg-ink text-sand">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_10%,rgba(176,141,87,0.28),transparent_55%),radial-gradient(ellipse_at_5%_95%,rgba(201,169,157,0.14),transparent_50%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        />
        <div className="page-container relative flex flex-col items-start gap-8 py-28 sm:py-40">
          <p className="text-[0.68rem] uppercase tracking-[0.4em] text-gold-light">Perfumería de autor</p>
          <h1 className="max-w-3xl font-serif text-[2.9rem] font-light leading-[1.02] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            El arte de llevar <em className="font-normal text-gold-light">un recuerdo</em> en la piel.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-sand-dark/80 sm:text-lg">
            Fragancias seleccionadas con paciencia, de pequeñas casas perfumistas, para quienes
            entienden que un aroma también cuenta una historia.
          </p>
          <a
            href="#catalogo"
            className="btn mt-2 border border-gold/80 text-gold-light hover:bg-gold hover:text-ink"
          >
            Descubrir
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      <section className="page-container py-20 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">Familias olfativas</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">Tres maneras de contar una historia</h2>
          <div className="rule mx-auto mt-6" />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {notas.map((n) => (
            <div
              key={n.titulo}
              className={`${n.tono} rounded-sm p-8 transition-shadow duration-300 hover:shadow-soft`}
            >
              <h3 className="font-serif text-3xl font-light text-ink">{n.titulo}</h3>
              <div className="mt-4 h-px w-8 bg-gold" />
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">{n.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <Catalog />
    </main>
  );
}
