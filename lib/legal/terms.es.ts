import {
  BLOCK_APPEAL_DAYS,
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  MINIMUM_AGE,
  OPPORTUNITY_DAYS,
  OPPORTUNITY_REMINDER_DAYS,
  REPORT_REVIEW_HOURS,
  TERMS_CHANGE_NOTICE_DAYS,
} from "@skillsy/shared/terms";
import type { LegalDocumentContent } from "./types";

// Spanish (Latin America) translation of terms.ts (first version, to be
// reviewed). Section ids stay the same in every language: other pages link
// to them.
export const TERMS_ES: Omit<LegalDocumentContent, "updatedAt"> = {
  title: "Términos de Uso",
  intro: [
    "Estos Términos de Uso son el contrato entre tú y Skillsy. Explican cómo funciona la plataforma, qué hace y qué no hace Skillsy, y cuáles son tus responsabilidades al ofrecer o contratar servicios.",
    "Al crear una cuenta, declaras que leíste y aceptas estos términos y la Política de Privacidad. Quien solo navega por la plataforma también debe respetar estas reglas.",
  ],
  summary: {
    title: "Lo esencial, en pocas líneas",
    items: [
      `Solo pueden registrarse en Skillsy personas de ${MINIMUM_AGE} años o más. Navegar por el sitio no requiere registro.`,
      "Skillsy es y siempre será gratuito para los usuarios.",
      "Skillsy solo acerca a las personas: no participa en los pagos, en la ejecución ni en la programación de los servicios.",
      "Toda la responsabilidad por los servicios acordados y por los datos informados es de los propios usuarios.",
      "Skillsy no se responsabiliza por infracciones, daños o conductas de sus usuarios.",
      "No se permite contenido inapropiado: a quien lo publique se le elimina el perfil.",
      "El contenido contrario a la ley o a estas reglas bloquea el perfil hasta que se elimine y puede llevar a la expulsión.",
    ],
  },
  sections: [
    {
      id: "sobre",
      title: "Sobre Skillsy y estos términos",
      blocks: [
        { type: "p", text: "Skillsy es una plataforma de conexiones: ayuda a los profesionales a presentar sus servicios y a las personas a encontrar a quien necesitan, con recomendaciones y reseñas de la comunidad." },
        { type: "p", text: `Skillsy es mantenida por ${CONTROLLER_NAME}, persona física responsable de la plataforma, con quien celebras este contrato.` },
        { type: "p", text: "Skillsy es una iniciativa independiente. No está afiliada, administrada, patrocinada ni respaldada por La Iglesia de Jesucristo de los Santos de los Últimos Días, y no representa a barrios, estacas, unidades locales ni departamentos de la Iglesia." },
        { type: "p", text: "Estos términos siguen la legislación brasileña, incluidos el Código de Defensa del Consumidor (Código de Defesa do Consumidor), el Marco Civil de Internet (Marco Civil da Internet) y la Ley General de Protección de Datos Personales (LGPD)." },
      ],
    },
    {
      id: "quem-pode-usar",
      title: "Quién puede registrarse",
      blocks: [
        { type: "callout", tone: "warning", title: `Solo pueden registrarse personas de ${MINIMUM_AGE} años o más`, items: [
          `Para crear una cuenta necesitas tener ${MINIMUM_AGE} años o más. Al registrarte, declaras que cumples este requisito.`,
          "Navegar por el sitio y consultar perfiles, oportunidades, artículos y empleos no requiere registro.",
          "Las cuentas de menores de edad se eliminan en cuanto se identifican.",
        ] },
        { type: "list", items: [
          "Los datos que informes deben ser verdaderos.",
          "Una cuenta por persona. La cuenta es personal y no se puede transferir.",
          "La plataforma está orientada a servicios prestados en Brasil.",
        ] },
      ],
    },
    {
      id: "gratuidade",
      title: "Gratuidad",
      blocks: [
        { type: "callout", tone: "info", items: [
          "El uso de Skillsy es y siempre será gratuito para los usuarios: crear una cuenta, anunciar servicios, buscar profesionales, publicar oportunidades, recomendar, calificar y leer artículos y empleos.",
          "Skillsy no cobra comisión por los servicios acordados entre usuarios.",
        ] },
      ],
    },
    {
      id: "como-funciona",
      title: "Cómo funciona la plataforma",
      blocks: [
        { type: "list", items: [
          "Perfiles: quien anuncia servicios crea un perfil público con nombre, foto, servicio, ciudad, contacto y galería de fotos.",
          "Contacto: las conversaciones ocurren directamente entre las personas, generalmente por WhatsApp, fuera de la plataforma.",
          "Recomendaciones y reseñas: los miembros recomiendan profesionales de confianza y califican los servicios que contrataron.",
          `Oportunidades: quien necesita un servicio puede publicar una solicitud en el Tablero. Queda disponible durante ${OPPORTUNITY_DAYS} días, los profesionales de la misma categoría y estado reciben un aviso, y el autor recibe un recordatorio a los ${OPPORTUNITY_REMINDER_DAYS} días. El WhatsApp del autor es visible para los profesionales mientras la solicitud esté activa.`,
          "Artículos y empleos: los miembros verificados pueden publicar artículos y empleos. El equipo puede destacar, rechazar o retirar publicaciones que violen estas reglas.",
          "Avisos: la plataforma envía notificaciones en el propio sitio y en la app y, si lo permites en tu celular, notificaciones push sobre oportunidades, artículos y empleos. Las notificaciones push se pueden desactivar en la configuración del celular.",
        ] },
      ],
    },
    {
      id: "papel-da-skillsy",
      title: "El papel de Skillsy y los límites de su responsabilidad",
      blocks: [
        { type: "callout", tone: "warning", title: "Skillsy no participa en los servicios acordados entre usuarios", items: [
          "No intermedia, recibe ni garantiza pagos.",
          "No ejecuta, supervisa ni fiscaliza los servicios.",
          "No programa servicios ni controla plazos, horarios o entregas.",
          "No emplea, selecciona ni certifica a los profesionales anunciados.",
        ] },
        { type: "p", text: "Por eso, Skillsy no se responsabiliza por:" },
        { type: "list", items: [
          "Infracciones, actos ilícitos o conductas inadecuadas de los usuarios, dentro o fuera de la plataforma.",
          "La calidad, el precio, el plazo, la seguridad o el resultado de los servicios contratados.",
          "Pagos, cobros, reembolsos, daños, perjuicios, accidentes o desacuerdos entre usuarios, incluidos los que ocurran por WhatsApp, por teléfono o en persona.",
          "La veracidad de la información publicada por los usuarios: perfiles, reseñas, recomendaciones, oportunidades, artículos y empleos.",
        ] },
        { type: "p", text: "Estas limitaciones se aplican en la máxima medida permitida por la ley. Nada en estos términos excluye la responsabilidad de Skillsy en los casos en que la ley no permite esa exclusión." },
        { type: "p", text: "Skillsy se compromete a mantener la plataforma funcionando con cuidado y seguridad, proteger los datos personales según la Política de Privacidad y analizar los reportes recibidos. La plataforma puede no estar disponible durante mantenimientos o por fallas técnicas." },
      ],
    },
    {
      id: "responsabilidades-do-usuario",
      title: "Responsabilidades del usuario",
      blocks: [
        { type: "callout", tone: "warning", title: "Toda la responsabilidad por los servicios y por los datos informados es del usuario", items: [
          "Quien ofrece servicios responde por la ejecución, la calidad, la seguridad, el precio y el plazo de lo que acuerde.",
          "Quien contrata responde por lo que acuerde con el profesional, incluidos el pago y las condiciones.",
          "Cada usuario responde por la veracidad y la legalidad de los datos que informa y de todo lo que publica.",
        ] },
        { type: "list", items: [
          "Cumplir los requisitos legales de su actividad, como impuestos, licencias y registros profesionales.",
          "Publicar solo fotos y textos sobre los que tenga derechos, o con autorización de las personas que aparecen en ellos.",
          "Publicar solo empleos reales, sin discriminación de ningún tipo (Ley brasileña n.º 9.029/1995) y sin cobrar nada a los candidatos.",
          "Mantener en secreto la contraseña de la cuenta y avisar a Skillsy sobre cualquier uso indebido.",
        ] },
      ],
    },
    {
      id: "dados-de-filiacao-religiosa",
      title: "Datos de afiliación religiosa",
      blocks: [
        { type: "callout", tone: "info", title: "Consentimiento específico", items: [
          "Informar el barrio y el año de bautismo es opcional. Estos datos indican afiliación religiosa y la LGPD los considera datos personales sensibles.",
          "Al informarlos en tu perfil, das tu consentimiento específico para que Skillsy los trate para confirmar la insignia de miembro verificado y para mostrar el barrio en tu perfil, visible solo para quienes iniciaron sesión en la plataforma.",
          "Puedes retirar este consentimiento en cualquier momento borrando el barrio y el año de bautismo en Editar perfil. La insignia de miembro verificado deja de aparecer.",
        ] },
        { type: "p", text: "La insignia de miembro verificado solo confirma los datos informados por el propio usuario. No es una certificación de competencia, honradez ni calidad del servicio." },
      ],
    },
    {
      id: "conteudo",
      title: "Contenido publicado y propiedad intelectual",
      blocks: [
        { type: "list", items: [
          "El contenido que publicas sigue siendo tuyo. Al publicarlo, autorizas a Skillsy, de forma gratuita, a alojarlo, mostrarlo y adaptarlo al formato de la plataforma (sitio, app y notificaciones) mientras esté publicado.",
          "Skillsy solo usa tu perfil, tus fotos o tus testimonios en difusiones fuera de la plataforma, como redes sociales, con tu autorización.",
          "La marca, el nombre, la imagen visual y el código de Skillsy pertenecen a Skillsy y no se pueden usar sin autorización.",
        ] },
      ],
    },
    {
      id: "condutas-proibidas",
      title: "Lo que no está permitido",
      blocks: [
        { type: "callout", tone: "warning", title: "No se permite contenido inapropiado en Skillsy", items: [
          "A quien publique contenido sexual, violento, que incite al odio o que viole derechos de autor se le elimina el perfil de la plataforma.",
          "Cualquier otro contenido contrario a la ley o a estas reglas bloquea el perfil hasta que se elimine y puede llevar a la expulsión.",
        ] },
        { type: "table", head: ["Conducta", "Ejemplos"], rows: [
          ["Perfil falso o engañoso", "Usar el nombre, la foto o los datos de otra persona, o prometer formación, registro o experiencia que no tienes."],
          ["Reseñas y recomendaciones falsas", "Calificarte o recomendarte a ti mismo, acordar reseñas, ofrecer ventajas a cambio de una calificación o crear cuentas para eso."],
          ["Actividades ilegales", "Servicios ilícitos, productos prohibidos, esquemas piramidales e “inversiones” con promesa de rendimiento."],
          ["Estafas y fraude", "Cobrar sin prestar el servicio, pedir pagos por adelantado de mala fe o usar la plataforma para obtener datos o dinero de terceros."],
          ["Falta de respeto", "Acoso, amenazas, discriminación o lenguaje ofensivo, incluso en conversaciones iniciadas a través de Skillsy, como por WhatsApp."],
          ["Spam", "Publicaciones repetidas, publicidad sin relación con la propuesta de la plataforma y mensajes masivos."],
          ["Datos de terceros", "Publicar el teléfono, la dirección, fotos o información de otras personas sin autorización."],
          ["Uso indebido de nombres y marcas", "Dar a entender que Skillsy, un anuncio o un perfil es oficial o está respaldado por alguna institución, incluida la Iglesia y sus unidades."],
          ["Contenido inapropiado", "Contenido sexual, violento, que incite al odio o que viole derechos de autor."],
          ["Perjudicar la plataforma", "Intentar invadirla, copiar datos de forma masiva, eludir bloqueos o crear otra cuenta después de una eliminación."],
        ] },
      ],
    },
    {
      id: "denuncias-e-bloqueio",
      title: "Reportes, bloqueo y eliminación de perfiles",
      blocks: [
        { type: "callout", tone: "warning", title: "El contenido contrario a la ley o a las reglas lleva al bloqueo, la eliminación o la expulsión del perfil", items: [
          "Cualquier usuario puede reportar un perfil o una publicación con el botón Reportar.",
          `El equipo analiza los reportes en un plazo de hasta ${REPORT_REVIEW_HOURS} horas, siempre que sea posible. La persona que reporta no se identifica ante la persona reportada.`,
          "Una vez confirmada la infracción, el perfil se bloquea, se elimina o se expulsa, según la gravedad.",
        ] },
        { type: "table", head: ["Medida", "Cuándo", "Qué sucede"], rows: [
          ["Bloqueo hasta que se elimine el contenido", "Publicar un perfil, foto, reseña, recomendación, oportunidad, artículo o empleo contrario a la ley o a estas reglas.", "El perfil se bloquea y sale de las búsquedas hasta que se elimine el contenido. Para eso, pide una revisión en la pantalla de cuenta bloqueada: el equipo elimina el contenido o te devuelve el acceso para que lo retires."],
          ["Eliminación del perfil", "Contenido inapropiado (sexual, violento, de odio o que viole derechos de autor), fraude, estafa, amenaza, acoso grave, perfil falso o actividad ilegal.", "El perfil se elimina de la plataforma."],
          ["Expulsión", "Reincidencia después de un bloqueo o de una eliminación, o una infracción grave que ponga a personas en riesgo.", "La cuenta se cierra de forma definitiva y no se permite crear otra."],
        ] },
        { type: "list", items: [
          "Las infracciones graves, como estafas, amenazas o riesgos para la seguridad de alguien, llevan al bloqueo inmediato, sin aviso previo. Cuando sea necesario, la información se conserva y se entrega a las autoridades.",
          `Quien tenga la cuenta bloqueada ve el motivo al iniciar sesión y puede pedir una revisión en un plazo de hasta ${BLOCK_APPEAL_DAYS} días, en la propia pantalla de cuenta bloqueada. La decisión de la revisión es definitiva.`,
          "Un reporte falso, hecho de mala fe, también es una infracción.",
          "Las reseñas y recomendaciones no se eliminan por ser negativas, solo cuando violan estas reglas.",
        ] },
      ],
    },
    {
      id: "cancelamento",
      title: "Cancelación de la cuenta y cambios en el servicio",
      blocks: [
        { type: "list", items: [
          "Puedes cancelar tu cuenta en cualquier momento, en la configuración del perfil. Tus datos personales se eliminan, con las excepciones descritas en la Política de Privacidad.",
          "Skillsy puede modificar, suspender o cerrar funciones. Si la plataforma cierra, se avisará a los usuarios con anticipación.",
        ] },
      ],
    },
    {
      id: "alteracoes",
      title: "Cambios en estos términos",
      blocks: [
        { type: "p", text: `Los cambios importantes en estos términos o en la Política de Privacidad se avisan en la plataforma con al menos ${TERMS_CHANGE_NOTICE_DAYS} días de anticipación. Cuando el cambio lo requiera, se te pedirá que vuelvas a aceptarlos al iniciar sesión.` },
      ],
    },
    {
      id: "disposicoes-gerais",
      title: "Disposiciones generales",
      blocks: [
        { type: "list", items: [
          "Estos términos se rigen por la legislación brasileña. Se elige el fuero del domicilio del usuario para resolver cualquier cuestión.",
          "Si alguna cláusula se considera inválida, las demás siguen vigentes.",
          "Si Skillsy deja de exigir alguna regla en un caso, eso no significa que haya renunciado a ella.",
          "Si estos términos se traducen, prevalece la versión en portugués.",
          `Dudas y solicitudes: Contáctanos, en la página de inicio, o por correo a ${CONTACT_EMAIL}. Reportes: botón Reportar, en el perfil o en la publicación.`,
        ] },
      ],
    },
    {
      id: "seguranca",
      title: "Consejos de seguridad",
      blocks: [
        { type: "list", items: [
          "Acuerda por escrito el servicio, el precio y el plazo antes de empezar.",
          "Desconfía de los pedidos de pago total por adelantado.",
          "No compartas contraseñas ni códigos recibidos por SMS.",
          "Califica después del servicio y usa el botón Reportar ante cualquier comportamiento sospechoso.",
        ] },
      ],
    },
  ],
};
