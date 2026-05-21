import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-sprinter.jpg";
import vybavaImg from "@/assets/vybavaImg.jpg";
import outdoorImg from "@/assets/outdoorImg.jpg";
import { useReveal } from "@/hooks/use-reveal";
import { SiteNav } from "@/components/site-nav";
import { Link } from "@tanstack/react-router";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "KYNOX" },
      {
        name: "description",
        content:
          "KYNOX. Tréningové protokoly pre tých, čo posúvajú hranicu. Sila, rýchlosť, odolnosť.",
      },
    ],
  }),
});

const tickerItems = [
  "FUTBAL",
  "HOKEJ",
  "BOX",
  "BASKETBALL",
  "VOLEJBAL",
  "HOME GYM",
  "PROTEÍN",
  "9 ŠPORTOV",
  "1 OBCHOD",
  "DROP 026",
];

function Index() {
  useReveal();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SiteNav active="home" />

      {/* Hero */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Šprintér v plnom behu"
            width={1920}
            height={1088}
            className="w-full h-full object-cover opacity-60 grayscale brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-32 hidden sm:block" />

        <div className="relative z-10 px-4 sm:px-6 md:px-12 pb-24 sm:pb-28">
          <div className="max-w-7xl mx-auto">
            <span className="font-mono text-[10px] sm:text-xs text-primary uppercase tracking-[0.3em] mb-4 sm:mb-6 block animate-slide-up">
              Athletic Performance Lab — 026
            </span>
            <h1 className="font-display text-[clamp(3.5rem,16vw,14rem)] leading-[0.85] uppercase -tracking-[0.04em] italic mb-6 sm:mb-8 animate-slide-up break-words">
              Športuj<br />Lepšie.
            </h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-slide-up [animation-delay:200ms]">
              <p className="max-w-md text-base sm:text-xl font-medium text-balance text-foreground/90">
                Protokoly stavané pre tých, čo nehľadajú pohodlie. Surová sila, neúprosný tempo, žiadne kompromisy.
              </p>
              <Link to="/store" className="inline-block">
                <button className="bg-primary text-background font-display text-lg sm:text-2xl px-8 sm:px-12 py-3 sm:py-4 uppercase skew-x-[-12deg] hover:bg-primary-dark transition-all w-full md:w-auto">
                  <span className="block skew-x-[12deg] whitespace-nowrap">Do obchodu</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
              
        <div className="absolute bottom-0 w-full bg-primary text-background py-2 overflow-hidden whitespace-nowrap border-y border-primary">
          <div className="flex gap-8 sm:gap-12 font-mono text-xs sm:text-sm font-bold uppercase animate-ticker w-max">
            {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i} className="flex items-center gap-8 sm:gap-12">
                {t} <span>•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="metrics" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 sm:mb-16 flex items-end justify-between border-b border-border pb-6 sm:pb-8 reveal">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter italic">
              Čísla nepoznajú výhovorky
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
            {[
               {[
                 {
                   tag: "01 / VÝBER",
                   val: "9+",
                   desc: "Športov pokrytých v jednom obchode. Futbal, hokej, box, basketball a ďalšie — všetko na jednom mieste.",
                 },
                 {
                   tag: "02 / VÝBAVA",
                   val: "DROP 026",
                   desc: "Nová kolekcia. Kopačky, hokejky, proteín, tašky. Veci, ktoré prežijú každý tréning.",
                 },
                 {
                   tag: "03 / ODHODLANIE",
                   val: "0 výhovoriek",
                   desc: "Správna výbava eliminuje každú výhovorku. Zostáva len tréning a výsledok.",
                 },
               ]}
            ].map((s, idx) => (
              <div
                key={s.tag}
                className="bg-background p-6 sm:p-10 lg:p-12 hover:bg-card transition-colors duration-500 reveal min-w-0 overflow-hidden"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className="font-mono text-primary mb-3 sm:mb-4 block text-[10px] sm:text-xs tracking-widest">
                  {s.tag}
                </span>
                <h3 className="font-display text-[clamp(2.5rem,7vw,5rem)] uppercase mb-4 sm:mb-6 leading-none break-words">
                  {s.val}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="protocols" className="pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10 sm:mb-16 border-b border-border pb-6 sm:pb-8 gap-4 reveal">
            <div>
              <span className="font-mono text-[10px] sm:text-xs text-primary uppercase tracking-[0.3em] mb-2 sm:mb-3 block">
                Tréningové protokoly
              </span>
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter italic">
                Vyber si bolesť
              </h2>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden md:block whitespace-nowrap">
              [ 02 — disciplíny ]
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            {[
              {
                tag: "Výbava",
                title: "Všetko, čo ťa robí lepším.",
                desc: "Kopačky. Činky. Proteín. Žiadne výhovorky.",
                img: vybavaImg,
                alt: "Atlét s činkou a proteínom v kopačkách",
              },
              {
                tag: "Hydratácia",
                title: "Vždy nabitý. Vždy hydratovaný.",
                desc: "Fľaše a tašky, ktoré idú všade kam ty.",
                img: outdoorImg,
                alt: "Atletka s Nike taškou a Adidas fľašou",
              },
            ].map((p, i) => (
              <div
                key={p.title}
                className={`relative aspect-[4/5] overflow-hidden group reveal hover-lift ${i === 1 ? "md:mt-24 reveal-delay-2" : "reveal-delay-1"}`}
              >
                <img
                  src={p.img}
                  alt={p.alt}
                  width={800}
                  height={1024}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 sm:p-8 w-full">
                  <div className="flex justify-between items-end gap-3">
                    <div className="min-w-0">
                      <span className="bg-primary text-background font-mono text-[10px] px-2 py-1 uppercase mb-3 inline-block tracking-widest">
                        {p.tag}
                      </span>
                      <h4 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase leading-none mb-2">
                        {p.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-foreground/80 max-w-xs">
                        {p.desc}
                      </p>
                    </div>
                    <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-foreground/40 grid place-items-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <div className="w-2 h-2 bg-foreground group-hover:bg-background" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="join" className="bg-primary py-16 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center reveal">
          <span className="font-mono text-[10px] sm:text-xs text-background uppercase tracking-[0.3em] mb-4 sm:mb-6 block">
            Posledná zastávka pred odhodlaním
          </span>
          <h2 className="font-display text-[clamp(2.75rem,11vw,10rem)] text-background leading-[0.9] uppercase mb-8 sm:mb-12 tracking-tighter break-words">
            Žiadne výhovorky.<br />Iba výkon.
          </h2>
          <Link
            to="/store"
            className="bg-background text-foreground font-display text-xl sm:text-3xl md:text-4xl px-8 sm:px-16 md:px-20 py-5 sm:py-7 md:py-8 uppercase hover:scale-105 hover:tracking-wide transition-all duration-500 w-full sm:w-auto animate-pulse-glow"
          >
            Do obchodu
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-border">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                <div>
                  <div className="font-display text-lg sm:text-xl uppercase tracking-tighter text-muted-foreground">
                    KYNOX © 2026 — Athletic Lab
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-1">
                    Made by PiCore Industries
                  </div>
                </div>
                <div className="flex gap-6 sm:gap-12 font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
                  <a href="#" className="hover:text-primary transition-colors">Súkromie</a>
                  <a href="#" className="hover:text-primary transition-colors">Podmienky</a>
                  <a href="#" className="hover:text-primary transition-colors">Lab</a>
                </div>
              </div>
        </footer>
    </div>
  );
}
