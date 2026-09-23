import { getRun } from "@/content/runs";
import { NODES, nodeById, pathFor, type Locale, type NodeId } from "@/lib/map-graph";
import { RESUME_URL, getDictionary, publishedLocales } from "@/lib/site";
import Contact from "./Contact";
import Core from "./Core";
import Experience from "./Experience";
import Footer from "./Footer";
import Explorer from "./map/Explorer";
import MapLabels from "./map/MapLabels";
import MapStage from "./map/MapStage";
import Room from "./map/Room";
import RouteBar from "./map/RouteBar";
import Nav from "./Nav";
import Projects from "./Projects";
import Hood from "./rooms/Hood";
import Training from "./rooms/Training";
import WhoIAm from "./rooms/WhoIAm";
import Skills from "./Skills";

/**
 * La página entera, para cualquier ruta del mapa.
 *
 * Todas las rutas —el mapa, un nodo, un subnodo— renderizan este mismo
 * árbol: el HTML trae siempre el contenido completo (que es lo que se ve en
 * Modo CV, sin JavaScript y lo que lee un buscador), y la ruta sólo decide
 * qué sala llega abierta. Navegar entre nodos es un pushState.
 */
export default function Site({ lang, node, sub }: { lang: Locale; node: NodeId | null; sub: string | null }) {
  const dict = getDictionary(lang);
  const run = getRun(lang);

  // La etiqueta sale del idioma ACTUAL: `switchTo` es el texto que esta
  // página muestra para irse al otro idioma, escrito en ese otro idioma. El
  // destino es la misma ruta del mapa en el otro idioma.
  const otro = publishedLocales().find((l) => l !== lang);
  const languageSwitch = otro ? { href: pathFor(otro, node, sub), label: dict.nav.switchTo } : null;

  const labels = Object.fromEntries(NODES.map((n) => [n.id, { agent: n.agent, name: dict.map.nodes[n.id].name }])) as Record<NodeId, { agent: string | null; name: string }>;
  const navLink = (id: NodeId) => ({ href: `${pathFor(lang, id)}#${nodeById(id).slug[lang]}`, label: dict.map.nodes[id].name, enter: id });
  const room = (id: NodeId) => ({ id, locale: lang, agent: nodeById(id).agent, name: dict.map.nodes[id].name, closeLabel: dict.map.close, active: node === id });

  return (
    <>
      <Nav
        links={(["prompt", "memory", "outputs", "tools", "training", "api", "hood"] as NodeId[]).map(navLink)}
        labels={{ menu: dict.nav.menu, close: dict.nav.close, mode: { cv: dict.map.cvMode, explore: dict.map.exploreMode } }}
        // Apagado hasta que exista el PDF: ver RESUME_URL en src/lib/site.ts.
        cta={RESUME_URL ? { href: RESUME_URL, label: dict.hero.ctaResume } : null}
        languageSwitch={languageSwitch}
        home={pathFor(lang)}
      />
      <RouteBar locale={lang} ariaLabel={dict.map.routeAria} home={dict.map.home} node={node} sub={sub} />
      <MapStage />
      <MapLabels locale={lang} copy={labels} ariaLabel={dict.map.mapAria} node={node} sub={sub} />
      <Explorer locale={lang} node={node} sub={sub} />

      <main id="main" className="page">
        <Core dict={dict} />

        <Room {...room("prompt")} title={dict.who.title} intro={dict.who.intro}>
          <WhoIAm dict={dict} />
        </Room>

        <Room {...room("memory")} title={dict.experience.title}>
          <Experience dict={dict} locale={lang} activeSub={node === "memory" ? sub : null} />
        </Room>

        <Room {...room("outputs")} title={dict.projects.title} intro={dict.projects.intro}>
          <Projects dict={dict} />
        </Room>

        <Room {...room("tools")} title={dict.skills.title}>
          <Skills dict={dict} />
        </Room>

        <Room {...room("training")} title={dict.training.title}>
          <Training dict={dict} />
        </Room>

        <Room {...room("api")} title={dict.contact.title} intro={dict.contact.body}>
          <Contact dict={dict} />
        </Room>

        <Room {...room("hood")} title={dict.context.title} intro={dict.context.intro}>
          <Hood dict={dict} run={run} />
        </Room>
      </main>

      <Footer dict={dict} />
    </>
  );
}
