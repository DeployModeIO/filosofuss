import { philosophers } from "./philosophers";
import type { Philosopher, Quote } from "@/types";
import { hashCode, normalize, pickRandom } from "@/lib/utils";
import { quotesBatch1 } from "./quotesBatch1";
import { quotesBatch2 } from "./quotesBatch2";
import { quotesBatch3 } from "./quotesBatch3";
import { quotesBatch4 } from "./quotesBatch4";

/**
 * Corpus de citas de Filosofuss.
 *
 * Todas las citas están en español y se han seleccionado entre los aforismos
 * más célebres y mejor documentados de cada autor. Cuando una formulación es
 * una paráfrasis fiel (no una cita literal) o su atribución es discutida por
 * la filología moderna, se intenta conservar la idea reconocida. Las citas
 * marcadas en la documentación del proyecto como «menos seguras» conviene
 * que un revisor las verifique contra la fuente original.
 */
export const quotes: Quote[] = [
  // ───────────────────────── Sócrates ─────────────────────────
  {
    id: "q-socrates-1",
    text: "Solo sé que no sé nada.",
    philosopherId: "socrates",
    tags: ["sabiduría", "conocimiento"],
    source: "Apología",
  },
  {
    id: "q-socrates-2",
    text: "Una vida no examinada no merece ser vivida.",
    philosopherId: "socrates",
    tags: ["vida", "sabiduría"],
    source: "Apología",
  },
  {
    id: "q-socrates-3",
    text: "Conócete a ti mismo.",
    philosopherId: "socrates",
    tags: ["sabiduría", "alma"],
  },
  {
    id: "q-socrates-4",
    text: "No soy ciudadano de Atenas ni de Grecia, sino ciudadano del mundo.",
    philosopherId: "socrates",
    tags: ["vida", "justicia"],
  },
  {
    id: "q-socrates-5",
    text: "Cásate, sin duda: si encuentras una buena esposa, serás feliz; si no, llegarás a ser filósofo.",
    philosopherId: "socrates",
    tags: ["vida", "felicidad"],
  },
  {
    id: "q-socrates-6",
    text: "La verdadera sabiduría está en reconocer la propia ignorancia.",
    philosopherId: "socrates",
    tags: ["sabiduría", "verdad"],
  },

  // ───────────────────────── Platón ─────────────────────────
  {
    id: "q-platon-1",
    text: "El conocimiento es la virtud; la ignorancia, el único vicio.",
    philosopherId: "platon",
    tags: ["conocimiento", "virtud"],
    source: "Protágoras",
  },
  {
    id: "q-platon-2",
    text: "El amor es el deseo de hallar la mitad que nos falta.",
    philosopherId: "platon",
    tags: ["amor", "alma"],
    source: "El banquete",
  },
  {
    id: "q-platon-3",
    text: "El principio es la parte más importante de toda obra.",
    philosopherId: "platon",
    tags: ["vida"],
    source: "La República",
  },
  {
    id: "q-platon-4",
    text: "La necesidad es la madre de la invención.",
    philosopherId: "platon",
    tags: ["conocimiento", "cambio"],
    source: "La República",
  },
  {
    id: "q-platon-5",
    text: "La música es para el alma lo que la gimnasia para el cuerpo.",
    philosopherId: "platon",
    tags: ["alma", "mente"],
    source: "La República",
  },
  {
    id: "q-platon-6",
    text: "La mayor penalidad es ser gobernado por un hombre peor, si uno no se quiere gobernar a sí mismo por la razón.",
    philosopherId: "platon",
    tags: ["razón", "justicia"],
    source: "La República",
  },

  // ───────────────────────── Aristóteles ─────────────────────────
  {
    id: "q-aristoteles-1",
    text: "El hombre es por naturaleza un animal político.",
    philosopherId: "aristoteles",
    tags: ["existencia", "ética"],
    source: "Política",
  },
  {
    id: "q-aristoteles-2",
    text: "Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto, sino un hábito.",
    philosopherId: "aristoteles",
    tags: ["virtud", "ética"],
    source: "Ética a Nicómaco",
  },
  {
    id: "q-aristoteles-3",
    text: "La felicidad depende de nosotros mismos.",
    philosopherId: "aristoteles",
    tags: ["felicidad"],
    source: "Ética a Nicómaco",
  },
  {
    id: "q-aristoteles-4",
    text: "La esperanza es el sueño del hombre despierto.",
    philosopherId: "aristoteles",
    tags: ["esperanza"],
  },
  {
    id: "q-aristoteles-5",
    text: "La amistad es un alma que habita en dos cuerpos.",
    philosopherId: "aristoteles",
    tags: ["amor", "alma"],
  },
  {
    id: "q-aristoteles-6",
    text: "La raíz de la educación es amarga, pero su fruto es dulce.",
    philosopherId: "aristoteles",
    tags: ["sabiduría"],
  },
  {
    id: "q-aristoteles-7",
    text: "Cualquiera puede enfadarse, eso es fácil; pero enfadarse con la persona adecuada, en el grado justo y en el momento oportuno, no es fácil.",
    philosopherId: "aristoteles",
    tags: ["virtud", "ética"],
    source: "Ética a Nicómaco",
  },

  // ───────────────────────── Epicuro ─────────────────────────
  {
    id: "q-epicuro-1",
    text: "Acostúmbrate a la idea de que la muerte no significa nada para nosotros.",
    philosopherId: "epicuro",
    tags: ["muerte", "existencia"],
    source: "Carta a Meneceo",
  },
  {
    id: "q-epicuro-2",
    text: "La muerte no es nada para nosotros: cuando existimos, no está presente; y cuando llega, ya no existimos.",
    philosopherId: "epicuro",
    tags: ["muerte", "sufrimiento"],
    source: "Carta a Meneceo",
  },
  {
    id: "q-epicuro-3",
    text: "La prudencia es la más valiosa de todas las virtudes.",
    philosopherId: "epicuro",
    tags: ["virtud", "sabiduría"],
    source: "Máximas capitales",
  },
  {
    id: "q-epicuro-4",
    text: "Quien no sabe contentarse con poco, jamás será feliz, aunque sea dueño del mundo.",
    philosopherId: "epicuro",
    tags: ["felicidad", "deseo"],
  },
  {
    id: "q-epicuro-5",
    text: "De todos los bienes que la sabiduría proporciona para la felicidad de toda la vida, el mayor con mucho es la amistad.",
    philosopherId: "epicuro",
    tags: ["amor", "felicidad"],
    source: "Máximas capitales",
  },
  {
    id: "q-epicuro-6",
    text: "Es imposible vivir placenteramente sin vivir con prudencia, honradez y justicia.",
    philosopherId: "epicuro",
    tags: ["ética", "virtud"],
    source: "Máximas capitales",
  },

  // ───────────────────────── Séneca ─────────────────────────
  {
    id: "q-seneca-1",
    text: "No es que tengamos poco tiempo, es que perdemos mucho.",
    philosopherId: "seneca",
    tags: ["tiempo", "vida"],
    source: "De la brevedad de la vida",
  },
  {
    id: "q-seneca-2",
    text: "Mientras esperamos vivir, la vida pasa.",
    philosopherId: "seneca",
    tags: ["tiempo", "vida"],
    source: "Epístolas morales a Lucilio",
  },
  {
    id: "q-seneca-3",
    text: "Si no sabes a qué puerto navegas, ningún viento te es favorable.",
    philosopherId: "seneca",
    tags: ["vida", "esperanza"],
    source: "Epístolas morales a Lucilio",
  },
  {
    id: "q-seneca-4",
    text: "La vida, si sabes usarla, es larga.",
    philosopherId: "seneca",
    tags: ["tiempo", "vida"],
    source: "De la brevedad de la vida",
  },
  {
    id: "q-seneca-5",
    text: "El que sufre antes de que sea necesario, sufre más de lo necesario.",
    philosopherId: "seneca",
    tags: ["sufrimiento", "miedo"],
    source: "Epístolas morales a Lucilio",
  },
  {
    id: "q-seneca-6",
    text: "La vida feliz es aquella que se ajusta a su propia naturaleza.",
    philosopherId: "seneca",
    tags: ["felicidad", "vida"],
    source: "De la vida feliz",
  },
  {
    id: "q-seneca-7",
    text: "Vivir es ser soldado.",
    philosopherId: "seneca",
    tags: ["vida", "virtud"],
    source: "Epístolas morales a Lucilio",
  },

  // ───────────────────────── Marco Aurelio ─────────────────────────
  {
    id: "q-aurelio-1",
    text: "Tienes poder sobre tu mente, no sobre los acontecimientos externos. Date cuenta de esto y encontrarás fuerza.",
    philosopherId: "aurelio",
    tags: ["mente", "libertad"],
    source: "Meditaciones",
  },
  {
    id: "q-aurelio-2",
    text: "La felicidad de tu vida depende de la calidad de tus pensamientos.",
    philosopherId: "aurelio",
    tags: ["felicidad", "mente"],
    source: "Meditaciones",
  },
  {
    id: "q-aurelio-3",
    text: "Si te duele alguna cosa exterior, no es la cosa la que te molesta, sino tu juicio sobre ella.",
    philosopherId: "aurelio",
    tags: ["mente", "sufrimiento"],
    source: "Meditaciones",
  },
  {
    id: "q-aurelio-4",
    text: "Mira el inmenso abismo del tiempo pasado y del tiempo futuro, y comprende cuán breve es tu vida.",
    philosopherId: "aurelio",
    tags: ["tiempo", "vida"],
    source: "Meditaciones",
  },
  {
    id: "q-aurelio-5",
    text: "La muerte sonríe a todos nosotros; lo único que podemos hacer es devolverle la sonrisa.",
    philosopherId: "aurelio",
    tags: ["muerte", "virtud"],
  },
  {
    id: "q-aurelio-6",
    text: "El mejor modo de vengarse es no parecerse al que causó el daño.",
    philosopherId: "aurelio",
    tags: ["virtud", "justicia"],
    source: "Meditaciones",
  },
  {
    id: "q-aurelio-7",
    text: "Lo que no hace mejor al hombre, tampoco hace mejor a su vida.",
    philosopherId: "aurelio",
    tags: ["vida", "virtud"],
    source: "Meditaciones",
  },

  // ───────────────────────── Epicteto ─────────────────────────
  {
    id: "q-epicteto-1",
    text: "No son las cosas las que nos perturban, sino la opinión que tenemos de ellas.",
    philosopherId: "epicteto",
    tags: ["mente", "sufrimiento"],
    source: "Enquiridión",
  },
  {
    id: "q-epicteto-2",
    text: "De todas las cosas existentes, unas dependen de nosotros y otras no están en nuestro poder.",
    philosopherId: "epicteto",
    tags: ["libertad", "vida"],
    source: "Enquiridión",
  },
  {
    id: "q-epicteto-3",
    text: "Recuerda que eres un actor en una obra teatral, y que el autor de la obra decide tu papel.",
    philosopherId: "epicteto",
    tags: ["existencia", "vida"],
    source: "Enquiridión",
  },
  {
    id: "q-epicteto-4",
    text: "Es imposible que un hombre aprenda lo que cree que ya sabe.",
    philosopherId: "epicteto",
    tags: ["conocimiento", "sabiduría"],
  },
  {
    id: "q-epicteto-5",
    text: "No exijas que lo que sucede suceda como tú quieres; quiere que lo que sucede suceda como sucede.",
    philosopherId: "epicteto",
    tags: ["vida", "libertad"],
    source: "Enquiridión",
  },
  {
    id: "q-epicteto-6",
    text: "Si quieres mejorar, resérvate el miedo a parecer ignorante en las cosas que importan.",
    philosopherId: "epicteto",
    tags: ["sabiduría", "conocimiento"],
    source: "Enquiridión",
  },

  // ───────────────────────── San Agustín ─────────────────────────
  {
    id: "q-agustin-1",
    text: "Ama y haz lo que quieras.",
    philosopherId: "agustin",
    tags: ["amor", "virtud"],
    source: "Tratados sobre la primera carta de Juan",
  },
  {
    id: "q-agustin-2",
    text: "La medida del amor es amar sin medida.",
    philosopherId: "agustin",
    tags: ["amor"],
    source: "Sermones",
  },
  {
    id: "q-agustin-3",
    text: "Tarde te amé, belleza tan antigua y tan nueva, tarde te amé.",
    philosopherId: "agustin",
    tags: ["dios", "alma"],
    source: "Confesiones",
  },
  {
    id: "q-agustin-4",
    text: "Nos has hecho, Señor, para ti, y nuestro corazón está inquieto hasta que descanse en ti.",
    philosopherId: "agustin",
    tags: ["dios", "alma"],
    source: "Confesiones (I.1)",
  },
  {
    id: "q-agustin-5",
    text: "No comprendemos para creer, sino que creemos para comprender.",
    philosopherId: "agustin",
    tags: ["dios", "conocimiento"],
    source: "Sermones",
  },
  {
    id: "q-agustin-6",
    text: "Dios no nos ha prometido días sin dificultad, sino un día sin fin.",
    philosopherId: "agustin",
    tags: ["dios", "esperanza"],
  },

  // ───────────────────────── Tomás de Aquino ─────────────────────────
  {
    id: "q-aquino-1",
    text: "La ley es una ordenación de la razón al bien común, promulgada por quien tiene el cuidado de la comunidad.",
    philosopherId: "aquino",
    tags: ["razón", "justicia"],
    source: "Suma teológica",
  },
  {
    id: "q-aquino-2",
    text: "El bien común es mejor y más divino que el bien de un solo individuo.",
    philosopherId: "aquino",
    tags: ["ética", "justicia"],
    source: "Comentario a la Ética a Nicómaco",
  },
  {
    id: "q-aquino-3",
    text: "La amistad del hombre para con Dios se fundamenta en la caridad.",
    philosopherId: "aquino",
    tags: ["dios", "amor"],
    source: "Suma teológica",
  },
  {
    id: "q-aquino-4",
    text: "Tres cosas se requieren para la salvación del hombre: saber lo que debe creer, lo que debe desear y lo que debe hacer.",
    philosopherId: "aquino",
    tags: ["vida", "alma"],
  },
  {
    id: "q-aquino-5",
    text: "Nada hay en el entendimiento que no haya estado antes en los sentidos.",
    philosopherId: "aquino",
    tags: ["conocimiento", "mente"],
  },

  // ───────────────────────── Maquiavelo ─────────────────────────
  {
    id: "q-maquiavelo-1",
    text: "Es preferible ser temido que amado, si no se puede ser las dos cosas a la vez.",
    philosopherId: "maquiavelo",
    tags: ["poder", "miedo"],
    source: "El príncipe",
  },
  {
    id: "q-maquiavelo-2",
    text: "Nunca se intenta vencer por la fuerza lo que se puede ganar con la razón.",
    philosopherId: "maquiavelo",
    tags: ["razón", "poder"],
    source: "Discursos sobre la primera década de Tito Livio",
  },
  {
    id: "q-maquiavelo-3",
    text: "Quien quiera engañar encontrará siempre a quien se deje engañar.",
    philosopherId: "maquiavelo",
    tags: ["verdad", "poder"],
    source: "El príncipe",
  },
  {
    id: "q-maquiavelo-4",
    text: "En las acciones de los hombres se mira al resultado.",
    philosopherId: "maquiavelo",
    tags: ["poder", "ética"],
    source: "El príncipe",
  },
  {
    id: "q-maquiavelo-5",
    text: "Los hombres son ingratos, volubles, simuladores, cobardes ante el peligro y ávidos de ganancia.",
    philosopherId: "maquiavelo",
    tags: ["vida", "poder"],
    source: "El príncipe",
  },

  // ───────────────────────── Descartes ─────────────────────────
  {
    id: "q-descartes-1",
    text: "Pienso, luego existo.",
    philosopherId: "descartes",
    tags: ["mente", "existencia"],
    source: "Discurso del método",
  },
  {
    id: "q-descartes-2",
    text: "Divide cada dificultad en cuantas partes sea posible y conveniente para resolverla mejor.",
    philosopherId: "descartes",
    tags: ["razón"],
    source: "Discurso del método",
  },
  {
    id: "q-descartes-3",
    text: "El sentido común es la cosa mejor repartida del mundo.",
    philosopherId: "descartes",
    tags: ["sabiduría"],
    source: "Discurso del método",
  },
  {
    id: "q-descartes-4",
    text: "Para buscar la verdad es preciso dudar, en cuanto sea posible, de todas las cosas.",
    philosopherId: "descartes",
    tags: ["verdad", "conocimiento"],
    source: "Principios de la filosofía",
  },
  {
    id: "q-descartes-5",
    text: "La duda es el principio de la sabiduría.",
    philosopherId: "descartes",
    tags: ["sabiduría", "verdad"],
  },
  {
    id: "q-descartes-6",
    text: "Vivir sin filosofar es, propiamente, tener los ojos cerrados sin tratar jamás de abrirlos.",
    philosopherId: "descartes",
    tags: ["vida", "sabiduría"],
    source: "Principios de la filosofía",
  },

  // ───────────────────────── Spinoza ─────────────────────────
  {
    id: "q-spinoza-1",
    text: "El hombre libre en nada piensa menos que en la muerte, y su sabiduría es una meditación sobre la vida.",
    philosopherId: "spinoza",
    tags: ["muerte", "vida", "sabiduría"],
    source: "Ética",
  },
  {
    id: "q-spinoza-2",
    text: "No llorar, no indignarse, no reír, sino comprender.",
    philosopherId: "spinoza",
    tags: ["razón", "mente"],
    source: "Tratado político",
  },
  {
    id: "q-spinoza-3",
    text: "El orden y la conexión de las ideas es el mismo que el orden y la conexión de las cosas.",
    philosopherId: "spinoza",
    tags: ["verdad", "razón"],
    source: "Ética",
  },
  {
    id: "q-spinoza-4",
    text: "El deseo es la esencia misma del hombre.",
    philosopherId: "spinoza",
    tags: ["deseo", "existencia"],
    source: "Ética",
  },
  {
    id: "q-spinoza-5",
    text: "Todo lo excelente es tan difícil como raro.",
    philosopherId: "spinoza",
    tags: ["virtud"],
    source: "Ética",
  },
  {
    id: "q-spinoza-6",
    text: "La paz no es ausencia de guerra, sino una virtud que nace de la fortaleza del ánimo.",
    philosopherId: "spinoza",
    tags: ["virtud", "justicia"],
    source: "Tratado teológico-político",
  },

  // ───────────────────────── Leibniz ─────────────────────────
  {
    id: "q-leibniz-1",
    text: "Vivimos en el mejor de los mundos posibles.",
    philosopherId: "leibniz",
    tags: ["dios", "existencia"],
    source: "Teodicea",
  },
  {
    id: "q-leibniz-2",
    text: "El presente está cargado del pasado y preñado del porvenir.",
    philosopherId: "leibniz",
    tags: ["tiempo", "cambio"],
  },
  {
    id: "q-leibniz-3",
    text: "La música es el placer que experimenta el alma al contar, sin darse cuenta de que cuenta.",
    philosopherId: "leibniz",
    tags: ["alma", "mente"],
  },
  {
    id: "q-leibniz-4",
    text: "Todo lo que existe tiene una razón suficiente para ser y para ser como es.",
    philosopherId: "leibniz",
    tags: ["razón", "verdad"],
  },
  {
    id: "q-leibniz-5",
    text: "Nada hay en el entendimiento que no haya estado antes en los sentidos, excepto el entendimiento mismo.",
    philosopherId: "leibniz",
    tags: ["conocimiento", "mente"],
    source: "Nuevos ensayos sobre el entendimiento humano",
  },

  // ───────────────────────── Locke ─────────────────────────
  {
    id: "q-locke-1",
    text: "La mente humana, al nacer, es como un papel en blanco, sin ningún carácter escrito.",
    philosopherId: "locke",
    tags: ["conocimiento", "mente"],
    source: "Ensayo sobre el entendimiento humano",
  },
  {
    id: "q-locke-2",
    text: "Todos los hombres nacen libres, iguales e independientes, y nadie puede ser sometido al poder de otro sin su consentimiento.",
    philosopherId: "locke",
    tags: ["libertad", "justicia"],
    source: "Segundo tratado sobre el gobierno",
  },
  {
    id: "q-locke-3",
    text: "Donde no hay propiedad, no hay justicia.",
    philosopherId: "locke",
    tags: ["justicia"],
    source: "Ensayo sobre el entendimiento humano",
  },
  {
    id: "q-locke-4",
    text: "Las únicas fuentes del conocimiento son los sentidos y la reflexión.",
    philosopherId: "locke",
    tags: ["conocimiento", "razón"],
    source: "Ensayo sobre el entendimiento humano",
  },
  {
    id: "q-locke-5",
    text: "El fin de la ley no es abolir ni restringir, sino preservar y ampliar la libertad.",
    philosopherId: "locke",
    tags: ["libertad", "justicia"],
    source: "Segundo tratado sobre el gobierno",
  },

  // ───────────────────────── Hume ─────────────────────────
  {
    id: "q-hume-1",
    text: "La razón es, y solo debe ser, esclava de las pasiones.",
    philosopherId: "hume",
    tags: ["razón", "deseo"],
    source: "Tratado de la naturaleza humana",
  },
  {
    id: "q-hume-2",
    text: "La costumbre es la gran guía de la vida humana.",
    philosopherId: "hume",
    tags: ["vida", "mente"],
    source: "Investigación sobre el entendimiento humano",
  },
  {
    id: "q-hume-3",
    text: "Nada es más libre que la imaginación del hombre.",
    philosopherId: "hume",
    tags: ["mente", "libertad"],
    source: "Tratado de la naturaleza humana",
  },
  {
    id: "q-hume-4",
    text: "La belleza no es una cualidad inherente a las cosas, sino que reside en la mente que las contempla.",
    philosopherId: "hume",
    tags: ["mente", "verdad"],
    source: "Del criterio del gusto",
  },
  {
    id: "q-hume-5",
    text: "Un hombre sabio proporciona sus creencias a la evidencia.",
    philosopherId: "hume",
    tags: ["sabiduría", "verdad"],
  },

  // ───────────────────────── Kant ─────────────────────────
  {
    id: "q-kant-1",
    text: "Obra de tal modo que la máxima de tu acción pueda convertirse en ley universal.",
    philosopherId: "kant",
    tags: ["ética", "razón"],
    source: "Fundamentación de la metafísica de las costumbres",
  },
  {
    id: "q-kant-2",
    text: "Dos cosas llenan el ánimo de admiración y respeto: el cielo estrellado sobre mí y la ley moral en mí.",
    philosopherId: "kant",
    tags: ["razón", "dios"],
    source: "Crítica de la razón práctica",
  },
  {
    id: "q-kant-3",
    text: "Obra de tal modo que uses a la humanidad, en tu persona y en la de los demás, siempre como fin y nunca simplemente como medio.",
    philosopherId: "kant",
    tags: ["ética", "justicia"],
    source: "Fundamentación de la metafísica de las costumbres",
  },
  {
    id: "q-kant-4",
    text: "Sapere aude: ten el valor de servirte de tu propio entendimiento.",
    philosopherId: "kant",
    tags: ["razón", "sabiduría"],
    source: "¿Qué es la Ilustración?",
  },
  {
    id: "q-kant-5",
    text: "Pensamientos sin contenido son vacíos; intuiciones sin conceptos son ciegas.",
    philosopherId: "kant",
    tags: ["conocimiento", "mente"],
    source: "Crítica de la razón pura",
  },
  {
    id: "q-kant-6",
    text: "La libertad es la independencia respecto a todo lo que no sea nuestra propia razón.",
    philosopherId: "kant",
    tags: ["libertad", "razón"],
  },
  {
    id: "q-kant-7",
    text: "Sin la sensibilidad ningún objeto nos sería dado, y sin el entendimiento ninguno podría ser pensado.",
    philosopherId: "kant",
    tags: ["conocimiento", "mente"],
    source: "Crítica de la razón pura",
  },

  // ───────────────────────── Hegel ─────────────────────────
  {
    id: "q-hegel-1",
    text: "Nada grande se ha realizado en el mundo sin pasión.",
    philosopherId: "hegel",
    tags: ["deseo", "vida"],
    source: "Fenomenología del espíritu",
  },
  {
    id: "q-hegel-2",
    text: "El búho de Minerva solo alza el vuelo al caer la tarde.",
    philosopherId: "hegel",
    tags: ["sabiduría", "conocimiento"],
    source: "Elementos de la filosofía del derecho",
  },
  {
    id: "q-hegel-3",
    text: "Lo racional es real, y lo real es racional.",
    philosopherId: "hegel",
    tags: ["razón", "verdad"],
    source: "Elementos de la filosofía del derecho",
  },
  {
    id: "q-hegel-4",
    text: "La historia es el progreso en la conciencia de la libertad.",
    philosopherId: "hegel",
    tags: ["libertad", "cambio"],
    source: "Lecciones sobre la filosofía de la historia",
  },
  {
    id: "q-hegel-5",
    text: "La verdad es el todo.",
    philosopherId: "hegel",
    tags: ["verdad"],
    source: "Fenomenología del espíritu",
  },
  {
    id: "q-hegel-6",
    text: "Cada hombre es hijo de su tiempo; por tanto, también lo es la filosofía.",
    philosopherId: "hegel",
    tags: ["cambio", "tiempo"],
    source: "Elementos de la filosofía del derecho",
  },

  // ───────────────────────── Schopenhauer ─────────────────────────
  {
    id: "q-schopenhauer-1",
    text: "La vida oscila como un péndulo entre el dolor y el aburrimiento.",
    philosopherId: "schopenhauer",
    tags: ["vida", "sufrimiento"],
    source: "El mundo como voluntad y representación",
  },
  {
    id: "q-schopenhauer-2",
    text: "El hombre puede hacer lo que quiere, pero no puede querer lo que quiere.",
    philosopherId: "schopenhauer",
    tags: ["libertad", "deseo"],
    source: "Sobre la libertad de la voluntad",
  },
  {
    id: "q-schopenhauer-3",
    text: "La compasión es el fundamento de toda moralidad.",
    philosopherId: "schopenhauer",
    tags: ["ética", "virtud"],
    source: "El fundamento de la moral",
  },
  {
    id: "q-schopenhauer-4",
    text: "La soledad es la suerte de todos los espíritus excelentes.",
    philosopherId: "schopenhauer",
    tags: ["sabiduría", "alma"],
    source: "Parega y paralipómena",
  },
  {
    id: "q-schopenhauer-5",
    text: "Cada hombre se imagina los límites del mundo como los límites de su propia inteligencia.",
    philosopherId: "schopenhauer",
    tags: ["mente", "verdad"],
  },
  {
    id: "q-schopenhauer-6",
    text: "El talento alcanza una meta que el genio tiene ante sus ojos.",
    philosopherId: "schopenhauer",
    tags: ["sabiduría"],
    source: "El mundo como voluntad y representación",
  },
  {
    id: "q-schopenhauer-7",
    text: "Tratar a los demás como uno mismo quiere ser tratado es el principio fundamental de toda moral.",
    philosopherId: "schopenhauer",
    tags: ["ética", "virtud"],
    source: "El fundamento de la moral",
  },

  // ───────────────────────── Kierkegaard ─────────────────────────
  {
    id: "q-kierkegaard-1",
    text: "La vida solo puede ser comprendida hacia atrás, pero debe ser vivida hacia delante.",
    philosopherId: "kierkegaard",
    tags: ["vida", "conocimiento"],
    source: "Diarios",
  },
  {
    id: "q-kierkegaard-2",
    text: "La angustia es el vértigo de la libertad.",
    philosopherId: "kierkegaard",
    tags: ["libertad", "miedo"],
    source: "El concepto de la angustia",
  },
  {
    id: "q-kierkegaard-3",
    text: "La enfermedad mortal es la desesperación.",
    philosopherId: "kierkegaard",
    tags: ["sufrimiento", "alma"],
    source: "La enfermedad mortal",
  },
  {
    id: "q-kierkegaard-4",
    text: "La vida no es un problema que deba resolverse, sino una realidad que debe experimentarse.",
    philosopherId: "kierkegaard",
    tags: ["vida", "existencia"],
    source: "Diarios",
  },
  {
    id: "q-kierkegaard-5",
    text: "Purifica tu corazón de tal modo que te atrevas a hacer lo que el amor te dicte.",
    philosopherId: "kierkegaard",
    tags: ["amor", "virtud"],
    source: "Las obras del amor",
  },
  {
    id: "q-kierkegaard-6",
    text: "La subjetividad, la interioridad, es la verdad.",
    philosopherId: "kierkegaard",
    tags: ["verdad", "existencia"],
    source: "Postscriptum concluyente no científico",
  },

  // ───────────────────────── Marx ─────────────────────────
  {
    id: "q-marx-1",
    text: "La religión es el opio del pueblo.",
    philosopherId: "marx",
    tags: ["dios", "sufrimiento"],
    source: "Contribución a la crítica de la filosofía del derecho de Hegel",
  },
  {
    id: "q-marx-2",
    text: "Los filósofos no han hecho más que interpretar de diversos modos el mundo; de lo que se trata es de transformarlo.",
    philosopherId: "marx",
    tags: ["cambio", "razón"],
    source: "Tesis sobre Feuerbach",
  },
  {
    id: "q-marx-3",
    text: "La historia de todas las sociedades hasta nuestros días es la historia de la lucha de clases.",
    philosopherId: "marx",
    tags: ["poder", "justicia"],
    source: "Manifiesto comunista",
  },
  {
    id: "q-marx-4",
    text: "Proletarios de todos los países, ¡uníos!",
    philosopherId: "marx",
    tags: ["libertad", "justicia"],
    source: "Manifiesto comunista",
  },
  {
    id: "q-marx-5",
    text: "De cada cual según sus capacidades, a cada cual según sus necesidades.",
    philosopherId: "marx",
    tags: ["justicia", "ética"],
    source: "Crítica del programa de Gotha",
  },
  {
    id: "q-marx-6",
    text: "Los hombres hacen su propia historia, pero no la hacen en condiciones libremente elegidas.",
    philosopherId: "marx",
    tags: ["cambio", "existencia"],
    source: "El dieciocho brumario de Luis Bonaparte",
  },

  // ───────────────────────── Nietzsche ─────────────────────────
  {
    id: "q-nietzsche-1",
    text: "Dios ha muerto. Dios permanece muerto. Y nosotros lo hemos matado.",
    philosopherId: "nietzsche",
    tags: ["dios", "existencia"],
    source: "La gaya ciencia",
  },
  {
    id: "q-nietzsche-2",
    text: "Lo que no me mata me hace más fuerte.",
    philosopherId: "nietzsche",
    tags: ["sufrimiento", "virtud"],
    source: "Crepúsculo de los ídolos",
  },
  {
    id: "q-nietzsche-3",
    text: "Quien tiene un porqué para vivir encontrará casi siempre el cómo.",
    philosopherId: "nietzsche",
    tags: ["vida", "esperanza"],
    source: "Crepúsculo de los ídolos",
  },
  {
    id: "q-nietzsche-4",
    text: "Cuando se mira largo tiempo a un abismo, el abismo también mira dentro de ti.",
    philosopherId: "nietzsche",
    tags: ["mente", "existencia"],
    source: "Más allá del bien y del mal",
  },
  {
    id: "q-nietzsche-5",
    text: "Quien lucha con monstruos debe cuidar de no convertirse él mismo en un monstruo.",
    philosopherId: "nietzsche",
    tags: ["poder", "virtud"],
    source: "Más allá del bien y del mal",
  },
  {
    id: "q-nietzsche-6",
    text: "Sin música, la vida sería un error.",
    philosopherId: "nietzsche",
    tags: ["vida", "alma"],
    source: "Crepúsculo de los ídolos",
  },
  {
    id: "q-nietzsche-7",
    text: "Aquello que se hace por amor siempre ocurre más allá del bien y del mal.",
    philosopherId: "nietzsche",
    tags: ["amor", "ética"],
    source: "La gaya ciencia",
  },
  {
    id: "q-nietzsche-8",
    text: "El hombre es una cuerda tendida entre la bestia y el superhombre, una cuerda sobre un abismo.",
    philosopherId: "nietzsche",
    tags: ["existencia", "esperanza"],
    source: "Así habló Zaratustra",
  },
  {
    id: "q-nietzsche-9",
    text: "Hay que llevar todavía el caos dentro de sí para poder dar a luz una estrella danzante.",
    philosopherId: "nietzsche",
    tags: ["vida", "esperanza"],
    source: "Así habló Zaratustra",
  },

  // ───────────────────────── William James ─────────────────────────
  {
    id: "q-james-1",
    text: "El mayor descubrimiento de mi generación es que el ser humano puede cambiar su vida cambiando sus actitudes.",
    philosopherId: "james",
    tags: ["vida", "mente"],
  },
  {
    id: "q-james-2",
    text: "Actúa como si lo que hiciese marcase la diferencia. Lo hace.",
    philosopherId: "james",
    tags: ["vida", "virtud"],
  },
  {
    id: "q-james-3",
    text: "El arte de ser sabio consiste en saber qué pasar por alto.",
    philosopherId: "james",
    tags: ["sabiduría"],
  },
  {
    id: "q-james-4",
    text: "Creer algo es estar dispuesto a actuar como si fuese verdad.",
    philosopherId: "james",
    tags: ["verdad", "conocimiento"],
    source: "La voluntad de creer",
  },
  {
    id: "q-james-5",
    text: "La verdad nos ocurre a nosotros, no la hacemos nosotros a la verdad.",
    philosopherId: "james",
    tags: ["verdad", "mente"],
    source: "Pragmatismo",
  },

  // ───────────────────────── Wittgenstein ─────────────────────────
  {
    id: "q-wittgenstein-1",
    text: "Los límites de mi lenguaje son los límites de mi mundo.",
    philosopherId: "wittgenstein",
    tags: ["mente", "conocimiento"],
    source: "Tractatus logico-philosophicus",
  },
  {
    id: "q-wittgenstein-2",
    text: "De lo que no se puede hablar, hay que callar.",
    philosopherId: "wittgenstein",
    tags: ["verdad"],
    source: "Tractatus logico-philosophicus",
  },
  {
    id: "q-wittgenstein-3",
    text: "El mundo es todo lo que acaece.",
    philosopherId: "wittgenstein",
    tags: ["existencia", "verdad"],
    source: "Tractatus logico-philosophicus",
  },
  {
    id: "q-wittgenstein-4",
    text: "Si un león pudiese hablar, no podríamos entenderlo.",
    philosopherId: "wittgenstein",
    tags: ["conocimiento", "mente"],
    source: "Investigaciones filosóficas",
  },
  {
    id: "q-wittgenstein-5",
    text: "La filosofía es una batalla contra el hechizo de nuestra inteligencia por medio del lenguaje.",
    philosopherId: "wittgenstein",
    tags: ["razón", "mente"],
    source: "Investigaciones filosóficas",
  },
  {
    id: "q-wittgenstein-6",
    text: "El mundo del feliz es distinto del mundo del infeliz.",
    philosopherId: "wittgenstein",
    tags: ["felicidad", "mente"],
    source: "Tractatus logico-philosophicus",
  },

  // ───────────────────────── Heidegger ─────────────────────────
  {
    id: "q-heidegger-1",
    text: "El lenguaje es la casa del ser.",
    philosopherId: "heidegger",
    tags: ["mente", "existencia"],
    source: "Carta sobre el humanismo",
  },
  {
    id: "q-heidegger-2",
    text: "El hombre es el pastor del ser.",
    philosopherId: "heidegger",
    tags: ["existencia", "naturaleza"],
    source: "Carta sobre el humanismo",
  },
  {
    id: "q-heidegger-3",
    text: "La angustia es el estado de ánimo fundamental que nos revela la nada.",
    philosopherId: "heidegger",
    tags: ["miedo", "existencia"],
    source: "¿Qué es metafísica?",
  },
  {
    id: "q-heidegger-4",
    text: "Solo un dios puede aún salvarnos.",
    philosopherId: "heidegger",
    tags: ["dios", "esperanza"],
    source: "Entrevista a Der Spiegel",
  },
  {
    id: "q-heidegger-5",
    text: "Anticipar resueltamente la propia muerte es asumir la posibilidad más propia de la existencia.",
    philosopherId: "heidegger",
    tags: ["muerte", "existencia"],
    source: "Ser y tiempo",
  },
  {
    id: "q-heidegger-6",
    text: "Pensar no es producir ideas, sino habitar la cercanía de la verdad del ser.",
    philosopherId: "heidegger",
    tags: ["sabiduría", "verdad"],
  },

  // ───────────────────────── Sartre ─────────────────────────
  {
    id: "q-sartre-1",
    text: "El infierno son los demás.",
    philosopherId: "sartre",
    tags: ["existencia", "miedo"],
    source: "A puerta cerrada",
  },
  {
    id: "q-sartre-2",
    text: "La existencia precede a la esencia.",
    philosopherId: "sartre",
    tags: ["existencia", "libertad"],
    source: "El existencialismo es un humanismo",
  },
  {
    id: "q-sartre-3",
    text: "El hombre está condenado a ser libre.",
    philosopherId: "sartre",
    tags: ["libertad"],
    source: "El existencialismo es un humanismo",
  },
  {
    id: "q-sartre-4",
    text: "El hombre no es otra cosa que lo que él hace de sí mismo.",
    philosopherId: "sartre",
    tags: ["existencia", "vida"],
    source: "El existencialismo es un humanismo",
  },
  {
    id: "q-sartre-5",
    text: "La libertad es lo que haces con lo que han hecho de ti.",
    philosopherId: "sartre",
    tags: ["libertad", "existencia"],
    source: "El existencialismo es un humanismo",
  },
  {
    id: "q-sartre-6",
    text: "El hombre es, antes que nada, un proyecto que se vive a sí mismo subjetivamente.",
    philosopherId: "sartre",
    tags: ["existencia", "deseo"],
    source: "El existencialismo es un humanismo",
  },

  // ───────────────────────── Camus ─────────────────────────
  {
    id: "q-camus-1",
    text: "Hay que imaginar a Sísifo feliz.",
    philosopherId: "camus",
    tags: ["existencia", "felicidad"],
    source: "El mito de Sísifo",
  },
  {
    id: "q-camus-2",
    text: "En medio del invierno, descubrí dentro de mí un verano invencible.",
    philosopherId: "camus",
    tags: ["esperanza", "vida"],
    source: "Retorno a Tipasa",
  },
  {
    id: "q-camus-3",
    text: "El hombre es la única criatura que se niega a ser lo que es.",
    philosopherId: "camus",
    tags: ["existencia"],
    source: "El hombre rebelde",
  },
  {
    id: "q-camus-4",
    text: "La verdadera generosidad para con el futuro consiste en darlo todo al presente.",
    philosopherId: "camus",
    tags: ["esperanza", "tiempo"],
    source: "El hombre rebelde",
  },
  {
    id: "q-camus-5",
    text: "No hay amor de la vida sin desesperación de vivir.",
    philosopherId: "camus",
    tags: ["vida", "sufrimiento"],
  },
  {
    id: "q-camus-6",
    text: "La rebelión nace del espectáculo del desorden y de la injusticia.",
    philosopherId: "camus",
    tags: ["cambio", "justicia"],
    source: "El hombre rebelde",
  },
  {
    id: "q-camus-7",
    text: "Sin cultura y sin libertad no hay ni hombre ni sociedad.",
    philosopherId: "camus",
    tags: ["libertad", "justicia"],
    source: "Discurso de Estocolmo",
  },

  // ───────────────────────── Beauvoir ─────────────────────────
  {
    id: "q-beauvoir-1",
    text: "No se nace mujer, se llega a serlo.",
    philosopherId: "beauvoir",
    tags: ["existencia", "libertad"],
    source: "El segundo sexo",
  },
  {
    id: "q-beauvoir-2",
    text: "Uno no nace, sino que se convierte en mujer.",
    philosopherId: "beauvoir",
    tags: ["existencia", "cambio"],
    source: "El segundo sexo",
  },
  {
    id: "q-beauvoir-3",
    text: "La libertad no consiste en elegir el bien, sino en poder elegir libremente.",
    philosopherId: "beauvoir",
    tags: ["libertad", "verdad"],
  },
  {
    id: "q-beauvoir-4",
    text: "Hoy en día la mujer se representa a la humanidad tanto como el hombre, y ella puede llegar tan lejos como él.",
    philosopherId: "beauvoir",
    tags: ["libertad", "justicia"],
    source: "El segundo sexo",
  },
  {
    id: "q-beauvoir-5",
    text: "La vida, la vejez y la muerte imponen una resignación que la juventud rechaza.",
    philosopherId: "beauvoir",
    tags: ["vida", "muerte"],
  },

  // ───────────────────────── Arendt ─────────────────────────
  {
    id: "q-arendt-1",
    text: "La triste verdad es que la mayor parte del mal lo hacen personas que nunca se decidieron a ser buenas ni malas.",
    philosopherId: "arendt",
    tags: ["ética", "poder"],
    source: "Eichmann en Jerusalén",
  },
  {
    id: "q-arendt-2",
    text: "Lo más escalofriante del mal es su banalidad.",
    philosopherId: "arendt",
    tags: ["poder", "ética"],
    source: "Eichmann en Jerusalén",
  },
  {
    id: "q-arendt-3",
    text: "Nadie tiene el derecho a obedecer.",
    philosopherId: "arendt",
    tags: ["libertad", "justicia"],
  },
  {
    id: "q-arendt-4",
    text: "El perdón es la única reacción que no se limita a reaccionar, sino que inaugura algo nuevo.",
    philosopherId: "arendt",
    tags: ["esperanza", "vida"],
    source: "La condición humana",
  },
  {
    id: "q-arendt-5",
    text: "La pluralidad es la condición básica de toda vida política.",
    philosopherId: "arendt",
    tags: ["justicia", "existencia"],
    source: "La condición humana",
  },
  {
    id: "q-arendt-6",
    text: "El sentido de la acción solo se revela en el relato.",
    philosopherId: "arendt",
    tags: ["vida", "verdad"],
    source: "La condición humana",
  },

  // ───────────────────────── Russell ─────────────────────────
  {
    id: "q-russell-1",
    text: "La ciencia es lo que sabemos; la filosofía, lo que ignoramos.",
    philosopherId: "russell",
    tags: ["conocimiento", "razón"],
  },
  {
    id: "q-russell-2",
    text: "El secreto de la felicidad es este: que tus intereses sean lo más amplios posibles.",
    philosopherId: "russell",
    tags: ["felicidad"],
    source: "La conquista de la felicidad",
  },
  {
    id: "q-russell-3",
    text: "Tres pasiones, simples pero abrumadoramente fuertes, han gobernado mi vida: el deseo de amor, la búsqueda del conocimiento y una insoportable piedad por el sufrimiento.",
    philosopherId: "russell",
    tags: ["amor", "conocimiento", "sufrimiento"],
    source: "Autobiografía",
  },
  {
    id: "q-russell-4",
    text: "El buen corazón es amigo de todos; el mal corazón no es amigo de nadie.",
    philosopherId: "russell",
    tags: ["amor", "virtud"],
  },
  {
    id: "q-russell-5",
    text: "La mayoría de los males de la vida proceden de un exceso de miedo y de un defecto de esperanza.",
    philosopherId: "russell",
    tags: ["miedo", "esperanza"],
  },
  {
    id: "q-russell-6",
    text: "No temas a los pensamientos excéntricos; en ellos suele hallarse la verdad.",
    philosopherId: "russell",
    tags: ["verdad", "razón"],
  },

  // ───────────────────────── Foucault ─────────────────────────
  {
    id: "q-foucault-1",
    text: "Donde hay poder, hay resistencia.",
    philosopherId: "foucault",
    tags: ["poder", "libertad"],
    source: "Historia de la sexualidad",
  },
  {
    id: "q-foucault-2",
    text: "El poder y el saber se implican mutuamente: no hay relación de poder sin constitución de un saber.",
    philosopherId: "foucault",
    tags: ["poder", "conocimiento"],
    source: "Vigilar y castigar",
  },
  {
    id: "q-foucault-3",
    text: "Las personas saben lo que hacen; con frecuencia saben por qué lo hacen; pero ignoran lo que hace lo que hacen.",
    philosopherId: "foucault",
    tags: ["poder", "existencia"],
  },
  {
    id: "q-foucault-4",
    text: "El cuerpo es también una realidad directamente inmersa en un campo de poder.",
    philosopherId: "foucault",
    tags: ["poder", "existencia"],
    source: "Historia de la sexualidad",
  },
  {
    id: "q-foucault-5",
    text: "Mi trabajo no consiste en resolver problemas, sino en problematizar lo que se da por sentado.",
    philosopherId: "foucault",
    tags: ["razón", "verdad"],
  },
  {
    id: "q-foucault-6",
    text: "El panóptico es el mecanismo de poder por excelencia de la modernidad.",
    philosopherId: "foucault",
    tags: ["poder", "mente"],
    source: "Vigilar y castigar",
  },

  // ───────────────────────── Popper ─────────────────────────
  {
    id: "q-popper-1",
    text: "Una teoría científica, para ser válida, debe ser susceptible de refutación.",
    philosopherId: "popper",
    tags: ["conocimiento", "verdad"],
    source: "La lógica de la investigación científica",
  },
  {
    id: "q-popper-2",
    text: "La tolerancia ilimitada conduce inevitablemente a la desaparición de la tolerancia.",
    philosopherId: "popper",
    tags: ["libertad", "justicia"],
    source: "La sociedad abierta y sus enemigos",
  },
  {
    id: "q-popper-3",
    text: "Nuestra ignorancia es ilimitada: debemos abandonar la pretensión de verdad absoluta.",
    philosopherId: "popper",
    tags: ["conocimiento", "verdad"],
  },
  {
    id: "q-popper-4",
    text: "La vida consiste en resolver problemas.",
    philosopherId: "popper",
    tags: ["vida", "razón"],
    source: "Toda vida es resolución de problemas",
  },
  {
    id: "q-popper-5",
    text: "La verdadera ignorancia no es la ausencia de conocimiento, sino el rechazo a adquirirlo.",
    philosopherId: "popper",
    tags: ["conocimiento", "sabiduría"],
  },

  // ───────────────────────── Confucio ─────────────────────────
  {
    id: "q-confucio-1",
    text: "No hagas a los demás lo que no quieres que te hagan a ti.",
    philosopherId: "confucio",
    tags: ["ética", "virtud"],
    source: "Analectas",
  },
  {
    id: "q-confucio-2",
    text: "Estudiar sin pensar es inútil; pensar sin estudiar es peligroso.",
    philosopherId: "confucio",
    tags: ["conocimiento", "razón"],
    source: "Analectas",
  },
  {
    id: "q-confucio-3",
    text: "El hombre noble busca la justicia; el hombre vulgar busca el provecho.",
    philosopherId: "confucio",
    tags: ["virtud", "justicia"],
    source: "Analectas",
  },
  {
    id: "q-confucio-4",
    text: "La virtud no está sola: forzosamente tendrá quien la acompañe.",
    philosopherId: "confucio",
    tags: ["virtud", "sabiduría"],
    source: "Analectas (IV.25)",
  },
  {
    id: "q-confucio-5",
    text: "Cuando veas a un hombre bueno, trata de imitarlo; cuando veas a uno malo, examina tu propio corazón.",
    philosopherId: "confucio",
    tags: ["virtud", "sabiduría"],
    source: "Analectas (IV.17)",
  },
  {
    id: "q-confucio-6",
    text: "Quien gobierna por la virtud es como la estrella polar: permanece en su lugar y las demás estrellas le rinden homenaje.",
    philosopherId: "confucio",
    tags: ["virtud", "poder"],
    source: "Analectas",
  },
  {
    id: "q-confucio-7",
    text: "El hombre que ha cometido un error y no lo corrige comete otro error mayor.",
    philosopherId: "confucio",
    tags: ["sabiduría", "cambio"],
    source: "Analectas",
  },

  // ───────────────────────── Lao-Tsé ─────────────────────────
  {
    id: "q-laotse-1",
    text: "Un viaje de mil leguas comienza con un solo paso.",
    philosopherId: "laotse",
    tags: ["vida", "cambio"],
    source: "Tao Te Ching",
  },
  {
    id: "q-laotse-2",
    text: "Conocer a los demás es inteligencia; conocerse a sí mismo es verdadera sabiduría.",
    philosopherId: "laotse",
    tags: ["sabiduría", "alma"],
    source: "Tao Te Ching",
  },
  {
    id: "q-laotse-3",
    text: "Dominar a los demás es fuerza; dominarse a sí mismo es verdadero poder.",
    philosopherId: "laotse",
    tags: ["poder", "virtud"],
    source: "Tao Te Ching",
  },
  {
    id: "q-laotse-4",
    text: "Quien se contenta es rico.",
    philosopherId: "laotse",
    tags: ["felicidad", "sabiduría"],
    source: "Tao Te Ching",
  },
  {
    id: "q-laotse-5",
    text: "El camino que se puede recorrer no es el verdadero Camino.",
    philosopherId: "laotse",
    tags: ["verdad", "conocimiento"],
    source: "Tao Te Ching",
  },
  {
    id: "q-laotse-6",
    text: "Nada en el mundo es más blando que el agua y, sin embargo, nada mejor vence a lo duro y fuerte.",
    philosopherId: "laotse",
    tags: ["cambio", "naturaleza"],
    source: "Tao Te Ching",
  },
  {
    id: "q-laotse-7",
    text: "El sabio actúa sin acción y enseña sin palabras.",
    philosopherId: "laotse",
    tags: ["sabiduría", "naturaleza"],
    source: "Tao Te Ching",
  },

  // ───────────────────────── Buda ─────────────────────────
  {
    id: "q-buda-1",
    text: "Somos lo que pensamos. Todo lo que somos surge con nuestros pensamientos.",
    philosopherId: "buda",
    tags: ["mente", "existencia"],
    source: "Dhammapada",
  },
  {
    id: "q-buda-2",
    text: "El odio no cesa por el odio; el odio cesa únicamente por el amor.",
    philosopherId: "buda",
    tags: ["amor", "virtud"],
    source: "Dhammapada",
  },
  {
    id: "q-buda-3",
    text: "La paz viene de dentro. No la busques fuera.",
    philosopherId: "buda",
    tags: ["alma", "sabiduría"],
  },
  {
    id: "q-buda-4",
    text: "No creas en algo solo porque lo diga la tradición; tras examinarlo, acéptalo solo si coincide con la razón y redunda en tu bien.",
    philosopherId: "buda",
    tags: ["razón", "conocimiento"],
    source: "Sutra de los Kalama",
  },
  {
    id: "q-buda-5",
    text: "Tres cosas no pueden ocultarse mucho tiempo: el sol, la luna y la verdad.",
    philosopherId: "buda",
    tags: ["verdad"],
  },
  {
    id: "q-buda-6",
    text: "Mejor que mil palabras sin sentido es una palabra sensata que apacigua a quien la escucha.",
    philosopherId: "buda",
    tags: ["sabiduría", "verdad"],
    source: "Dhammapada",
  },
  {
    id: "q-buda-7",
    text: "Sujeta tu mente tan firme como una montaña ante los vientos del deseo.",
    philosopherId: "buda",
    tags: ["mente", "deseo"],
  },

  // ───────────────────────── Zhuangzi ─────────────────────────
  {
    id: "q-zhuangzi-1",
    text: "Una rana en el fondo de un pozo no puede hablar del océano.",
    philosopherId: "zhuangzi",
    tags: ["conocimiento", "mente"],
    source: "Zhuangzi",
  },
  {
    id: "q-zhuangzi-2",
    text: "El hombre perfecto no tiene yo; el hombre sagrado no tiene mérito; el hombre verdadero no tiene nombre.",
    philosopherId: "zhuangzi",
    tags: ["existencia", "sabiduría"],
    source: "Zhuangzi",
  },
  {
    id: "q-zhuangzi-3",
    text: "Fluye con todo lo que sucede y deja que tu mente esté libre.",
    philosopherId: "zhuangzi",
    tags: ["libertad", "mente"],
    source: "Zhuangzi",
  },
  {
    id: "q-zhuangzi-4",
    text: "Cuando el arquero dispara por diversión, tiene toda su habilidad; cuando dispara por una hebilla de bronce, se pone nervioso.",
    philosopherId: "zhuangzi",
    tags: ["mente", "libertad"],
    source: "Zhuangzi",
  },
  {
    id: "q-zhuangzi-5",
    text: "La gran sabiduría es generosa; la pequeña sabiduría es mezquina.",
    philosopherId: "zhuangzi",
    tags: ["sabiduría", "mente"],
    source: "Zhuangzi",
  },
  {
    id: "q-zhuangzi-6",
    text: "El sabio abraza todas las cosas y se funde con ellas en la unidad.",
    philosopherId: "zhuangzi",
    tags: ["naturaleza", "sabiduría"],
    source: "Zhuangzi",
  },

  // ───────────────────────── Ortega y Gasset ─────────────────────────
  {
    id: "q-ortega-1",
    text: "Yo soy yo y mi circunstancia, y si no la salvo a ella no me salvo yo.",
    philosopherId: "ortega",
    tags: ["existencia", "vida"],
    source: "Meditaciones del Quijote",
  },
  {
    id: "q-ortega-2",
    text: "Cada vida humana es un punto de vista sobre el universo.",
    philosopherId: "ortega",
    tags: ["existencia", "verdad"],
    source: "El espectador",
  },
  {
    id: "q-ortega-3",
    text: "La vida es un quehacer: el hombre no está dado de antemano, sino que tiene que hacerse a sí mismo.",
    philosopherId: "ortega",
    tags: ["vida", "existencia"],
  },
  {
    id: "q-ortega-4",
    text: "Vivir es hallarse arrojado en un mundo y en una circunstancia que no hemos elegido.",
    philosopherId: "ortega",
    tags: ["vida", "existencia"],
    source: "¿Qué es filosofía?",
  },
  {
    id: "q-ortega-5",
    text: "La vida es la realidad radical: ninguna otra es real sino viviéndose a sí misma.",
    philosopherId: "ortega",
    tags: ["vida", "verdad"],
    source: "¿Qué es filosofía?",
  },
  {
    id: "q-ortega-6",
    text: "La masa es el hombre medio que se cree con derecho a todo sin habérselo ganado.",
    philosopherId: "ortega",
    tags: ["vida", "poder"],
    source: "La rebelión de las masas",
  },

  // ───────────────────────── Unamuno ─────────────────────────
  {
    id: "q-unamuno-1",
    text: "Venceréis, pero no convenceréis.",
    philosopherId: "unamuno",
    tags: ["verdad", "poder"],
    source: "Discurso de Salamanca",
  },
  {
    id: "q-unamuno-2",
    text: "El dolor es el camino de la conciencia, y la conciencia es el camino de la vida.",
    philosopherId: "unamuno",
    tags: ["sufrimiento", "vida"],
  },
  {
    id: "q-unamuno-3",
    text: "La fe que no duda es fe muerta.",
    philosopherId: "unamuno",
    tags: ["dios", "alma"],
    source: "Del sentimiento trágico de la vida",
  },
  {
    id: "q-unamuno-4",
    text: "El hombre es un animal enfermo de conciencia.",
    philosopherId: "unamuno",
    tags: ["existencia", "mente"],
  },
  {
    id: "q-unamuno-5",
    text: "Sólo quien vive bajo el peso del dolor sabe lo que pesa la vida.",
    philosopherId: "unamuno",
    tags: ["sufrimiento", "vida"],
  },
  {
    id: "q-unamuno-6",
    text: "El progreso consiste en conservar lo esencial y cambiar lo accesorio.",
    philosopherId: "unamuno",
    tags: ["cambio", "esperanza"],
  },
  // ═══════════════════════════════════════════════════════════
  // Corpus ampliado (lotes adicionales)
  // ═══════════════════════════════════════════════════════════
  ...quotesBatch1,
  ...quotesBatch2,
  ...quotesBatch3,
  ...quotesBatch4,
];

// ─────────────────────────────────────────────────────────────
// Helpers / utilidades derivadas
// ─────────────────────────────────────────────────────────────

/** Índices construidos una sola vez para búsquedas O(1). */
const philosopherById = new Map<string, Philosopher>(
  philosophers.map((p): [string, Philosopher] => [p.id, p]),
);

const quoteById = new Map<string, Quote>(
  quotes.map((q): [string, Quote] => [q.id, q]),
);

/** Devuelve el filósofo cuyo id coincide, o `undefined`. */
export function getPhilosopherById(id: string): Philosopher | undefined {
  return philosopherById.get(id);
}

/** Devuelve todas las citas de un filósofo, en el orden del corpus. */
export function getQuotesByPhilosopher(philosopherId: string): Quote[] {
  return quotes.filter((q) => q.philosopherId === philosopherId);
}

/** Devuelve la cita con ese id, o `undefined`. */
export function getQuoteById(id: string): Quote | undefined {
  return quoteById.get(id);
}

/**
 * Devuelve una cita aleatoria. Si se pasa `excludeId`, no devolverá esa cita
 * (salvo que sea la única disponible).
 */
export function getRandomQuote(excludeId?: string): Quote {
  if (excludeId === undefined) return pickRandom(quotes);
  const pool = quotes.filter((q) => q.id !== excludeId);
  return pickRandom(pool.length > 0 ? pool : quotes);
}

/**
 * Cita del día: determinista para una misma fecha de calendario.
 * Combina el año-mes-día en una semilla mediante hashCode y selecciona
 * `quotes[seed % length]`. Siempre devuelve la misma cita para el mismo día.
 */
export function getQuoteOfTheDay(date: Date = new Date()): Quote {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // getMonth() es 0-based.
  const d = date.getDate();
  const seed = hashCode(`${y}-${m}-${d}`);
  const len = quotes.length;
  const index = ((seed % len) + len) % len; // módulo seguro para negativos.
  return quotes[index];
}

/** Devuelve valores únicos y ordenados (orden amigable con el español). */
function uniqueSorted(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );
}

/** Eras distintas presentes en el catálogo, ordenadas. */
export const allEras: string[] = uniqueSorted(philosophers.map((p) => p.era));

/** Escuelas/movimientos distintos, ordenados. */
export const allSchools: string[] = uniqueSorted(
  philosophers.map((p) => p.school),
);

/** Temas del vocabulario controlado realmente usados, ordenados. */
export const allTags: string[] = uniqueSorted(quotes.flatMap((q) => q.tags));

/**
 * Búsqueda libre: insensible a mayúsculas y a acentos. Busca en el texto de
 * la cita, el autor (nombre y nombre completo), escuela, era, obra y temas.
 * Devuelve todas las coincidencias.
 */
export function searchQuotes(query: string): Quote[] {
  const needle = normalize(query.trim());
  if (needle.length === 0) return [];
  return quotes.filter((quote) => {
    const author = philosopherById.get(quote.philosopherId);
    const haystack = normalize(
      [
        quote.text,
        quote.source ?? "",
        quote.tags.join(" "),
        author?.name ?? "",
        author?.fullName ?? "",
        author?.school ?? "",
        author?.era ?? "",
      ].join(" "),
    );
    return haystack.includes(needle);
  });
}
