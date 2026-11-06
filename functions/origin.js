// Language and country of notifications (see index.js). No Firebase imports,
// so tests run it with plain Node.
const I18N = require("./i18n.json");

const contentLanguage = (item) => (I18N[item?.language] ? item.language : "pt");
const preferredLanguage = (user) => (I18N[user?.preferredLanguage] ? user.preferredLanguage : "pt");
const country = (item) => item?.country || "BR";

/** Should `user` hear about `content`? Same country and same language. */
function sameOrigin(user, content) {
  return country(user) === country(content) && preferredLanguage(user) === contentLanguage(content);
}

function message(language, key, vars = {}) {
  return I18N[language].messages[key].replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  );
}

const categoryLabel = (language, category) => I18N[language].categories[category] || category;

module.exports = { categoryLabel, contentLanguage, country, message, preferredLanguage, sameOrigin };
