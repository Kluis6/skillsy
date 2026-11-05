import {
  CONTACT_EMAIL,
  CONTROLLER_NAME,
  MINIMUM_AGE,
  PRIVACY_REPLY_DAYS,
  TERMS_CHANGE_NOTICE_DAYS,
} from "@skillsy/shared/terms";
import type { LegalDocumentContent } from "./types";

// Spanish (Latin America) translation of privacy.ts (first version, to be
// reviewed). Section ids stay the same in every language.
export const PRIVACY_ES: Omit<LegalDocumentContent, "updatedAt"> = {
  title: "Política de Privacidad",
  intro: [
    "Esta política explica qué datos personales trata Skillsy, para qué, qué es público, con quién se comparten los datos y cómo ejerces tus derechos, según la Ley General de Protección de Datos Personales de Brasil (LGPD).",
  ],
  summary: {
    title: "Lo esencial, en pocas líneas",
    items: [
      `Solo pueden registrarse en Skillsy personas de ${MINIMUM_AGE} años o más.`,
      "Tratamos solo los datos necesarios para que la plataforma funcione y no vendemos datos personales.",
      "El perfil de quien anuncia servicios es público en internet, incluido el WhatsApp informado, y puede aparecer en buscadores como Google.",
      "El barrio y el año de bautismo son opcionales y solo se tratan con tu consentimiento.",
      "Puedes corregir o borrar datos, o cancelar tu cuenta, cuando quieras.",
      `Solicitudes sobre tus datos: ${CONTACT_EMAIL}.`,
    ],
  },
  sections: [
    {
      id: "controlador",
      title: "Quién trata tus datos",
      blocks: [
        { type: "p", text: `Skillsy es mantenida por ${CONTROLLER_NAME}, persona física responsable de la plataforma y responsable del tratamiento de los datos personales tratados en ella. Para cualquier tema de privacidad, incluido el ejercicio de tus derechos, escribe a ${CONTACT_EMAIL} o usa Contáctanos en la página de inicio.` },
      ],
    },
    {
      id: "dados-coletados",
      title: "Qué datos tratamos",
      blocks: [
        { type: "table", head: ["Tipo", "Ejemplos"], rows: [
          ["Registro", "Nombre, correo electrónico, foto de la cuenta de Google (si inicias sesión con Google) e identificadores de la cuenta."],
          ["Perfil", "Foto, portada, biografía, servicio y categoría, empresa, ciudad y estado, días y horarios de atención, WhatsApp, teléfono, redes sociales, sitio web y galería de fotos."],
          ["Afiliación religiosa (dato sensible)", "Barrio, año de bautismo y si eres miembro o amigo de la comunidad. Son opcionales."],
          ["Actividad en la plataforma", "Recomendaciones, reseñas, contactos guardados, oportunidades, artículos y empleos que publicas, reportes y mensajes enviados por Contáctanos."],
          ["Dispositivos y avisos", "Identificador del celular para notificaciones push, cuando lo permites, y las notificaciones recibidas."],
          ["Registros de la cuenta", "Versión de los Términos de Uso aceptada y la fecha de aceptación, además del motivo y la fecha de un eventual bloqueo."],
        ] },
      ],
    },
    {
      id: "finalidades",
      title: "Para qué los usamos y con qué base legal",
      blocks: [
        { type: "table", head: ["Finalidad", "Base legal (LGPD)"], rows: [
          ["Crear y mantener tu cuenta, mostrar perfiles, permitir búsquedas, contactos, recomendaciones, reseñas, oportunidades, artículos y empleos", "Ejecución del contrato (art. 7, V)"],
          ["Enviar avisos de oportunidades, artículos y empleos en el sitio, en la app y por push", "Ejecución del contrato (art. 7, V)"],
          ["Confirmar la insignia de miembro verificado y mostrar el barrio y el año de bautismo en el perfil", "Consentimiento específico (art. 11, I), dado al informar esos datos"],
          ["Prevenir fraudes, spam y abusos, analizar reportes y mantener la seguridad", "Interés legítimo (art. 7, IX)"],
          ["Conservar los registros exigidos por la ley y defender derechos en procesos", "Obligación legal y ejercicio regular de derechos (art. 7, II y VI)"],
        ] },
      ],
    },
    {
      id: "o-que-e-publico",
      title: "Qué es público",
      blocks: [
        { type: "callout", tone: "warning", title: "Los perfiles de quienes anuncian servicios son públicos", items: [
          "Nombre, foto, portada, servicio, empresa, ciudad y estado, biografía, galería, horarios de atención, contactos informados (incluido el WhatsApp), barrio e insignia de miembro verificado, reseñas y recomendaciones recibidas.",
          "Cualquier persona puede ver estos perfiles, incluso sin cuenta, y pueden aparecer en buscadores como Google.",
          "Para dejar de tener un perfil público, desactiva \"Anunciar mis servicios\" en Editar perfil o cancela tu cuenta.",
        ] },
        { type: "list", items: [
          "Las recomendaciones y reseñas que haces muestran tu nombre y tu foto a quien visita el perfil calificado.",
          "Las oportunidades activas, incluido el WhatsApp del autor, son visibles para quienes usan la plataforma.",
          "Los artículos y empleos publicados muestran el nombre del autor.",
        ] },
      ],
    },
    {
      id: "compartilhamento",
      title: "Con quién compartimos",
      blocks: [
        { type: "p", text: "Skillsy no vende ni alquila datos personales y no los usa para publicidad de terceros. Los datos son tratados por proveedores que operan la plataforma en nuestro nombre:" },
        { type: "table", head: ["Proveedor", "Para qué"], rows: [
          ["Google (Firebase)", "Inicio de sesión, base de datos, almacenamiento de imágenes, funciones del servidor y notificaciones push."],
          ["Google (inicio de sesión)", "Iniciar sesión con la cuenta de Google, cuando eliges esa opción."],
          ["Vercel", "Alojamiento del sitio."],
          ["ViaCEP y OpenStreetMap", "Completar la dirección y la ubicación a partir del código postal (CEP) o de tu ubicación, cuando usas esa función."],
          ["jsDelivr", "Entrega de un componente que se usa para reducir el tamaño de las imágenes que subes."],
        ] },
        { type: "p", text: "También podemos compartir datos con autoridades públicas cuando exista una obligación legal o una orden judicial, o para proteger la seguridad de las personas." },
      ],
    },
    {
      id: "onde-ficam",
      title: "Dónde se guardan tus datos",
      blocks: [
        { type: "p", text: "La base de datos de Skillsy está en Brasil (São Paulo). Las imágenes subidas y el alojamiento del sitio están en servidores de los Estados Unidos, operados por Google y Vercel, que adoptan estándares de seguridad y cláusulas de protección de datos compatibles con la LGPD (art. 33)." },
      ],
    },
    {
      id: "retencao",
      title: "Por cuánto tiempo los guardamos",
      blocks: [
        { type: "p", text: "Los datos se guardan mientras tu cuenta esté activa. Cuando cancelas la cuenta:" },
        { type: "list", items: [
          "Se eliminan: perfil público, foto, portada, biografía, contactos, galería, servicio, dirección, barrio, año de bautismo y demás datos del perfil.",
          "Se conservan: el correo electrónico y el registro de que la cuenta se canceló, para evitar fraudes y permitir la defensa en eventuales disputas, además de los reportes y registros de seguridad durante el tiempo que exija la ley.",
          "Las recomendaciones y reseñas que hiciste en perfiles de otras personas siguen visibles, porque forman parte de la reputación de esos profesionales. Puedes pedir que se eliminen por el correo de contacto.",
        ] },
      ],
    },
    {
      id: "seguranca",
      title: "Seguridad",
      blocks: [
        { type: "p", text: "Usamos medidas técnicas para proteger los datos, como conexiones cifradas, reglas de acceso que limitan quién puede leer y modificar cada información y registros de actividad. Ningún sistema es totalmente inmune a fallas; en caso de un incidente que pueda representar un riesgo para los titulares, avisaremos a los afectados y a la Autoridad Nacional de Protección de Datos de Brasil (ANPD), como exige la LGPD." },
      ],
    },
    {
      id: "direitos",
      title: "Tus derechos",
      blocks: [
        { type: "list", items: [
          "Confirmar si tratamos datos tuyos y acceder a ellos.",
          "Corregir datos incompletos, inexactos o desactualizados. Puedes corregir la mayoría tú mismo en Editar perfil.",
          "Pedir la anonimización, el bloqueo o la eliminación de datos innecesarios o tratados en desacuerdo con la LGPD.",
          "Pedir la portabilidad de tus datos.",
          "Saber con quién se comparten tus datos.",
          "Retirar el consentimiento dado para los datos de afiliación religiosa, borrándolos en Editar perfil.",
          "Pedir la eliminación de tus datos y cancelar tu cuenta en la configuración del perfil.",
        ] },
        { type: "p", text: `Las solicitudes se pueden enviar a ${CONTACT_EMAIL}. Respondemos en un plazo de hasta ${PRIVACY_REPLY_DAYS} días. También puedes presentar un reclamo ante la ANPD.` },
      ],
    },
    {
      id: "cookies",
      title: "Cookies y almacenamiento en el navegador",
      blocks: [
        { type: "list", items: [
          "Esenciales: mantienen tu sesión iniciada y protegen tu cuenta. Sin ellas, la plataforma no funciona.",
          "Preferencias: recuerdan elecciones como el tema claro u oscuro. Solo se guardan después de que elijas en el aviso de cookies, y rechazarlas no impide usar la plataforma.",
          "Skillsy no usa cookies de publicidad ni herramientas de análisis de terceros. Si esto cambia, esta política se actualizará y se te pedirá tu consentimiento antes.",
        ] },
      ],
    },
    {
      id: "menores",
      title: "Menores de edad",
      blocks: [
        { type: "p", text: `Solo pueden registrarse en Skillsy personas de ${MINIMUM_AGE} años o más, y la plataforma no recopila de forma intencional datos de menores. Navegar por el sitio no requiere registro. Si identificamos una cuenta de un menor de edad, se eliminará.` },
      ],
    },
    {
      id: "alteracoes",
      title: "Cambios en esta política",
      blocks: [
        { type: "p", text: `Los cambios importantes se avisan en la plataforma con al menos ${TERMS_CHANGE_NOTICE_DAYS} días de anticipación y, cuando sea necesario, se te pedirá que vuelvas a aceptar. La versión más reciente está siempre en esta página.` },
      ],
    },
  ],
};
