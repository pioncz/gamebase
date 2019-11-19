import i18n from 'i18next';
import { initReactI18next, } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // load translation using xhr -> see /public/locales
  // learn more: https://github.com/i18next/i18next-xhr-backend
  // .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      checkWhitelist: false,
    },
    resources: {
      en: {
        translation: {
          languages: {
            en: 'English',
            pl: 'Polish',
          },
          commons: {
            loading: 'Loading',
            required: "Required",
            submit: 'Submit',
            login: 'Login',
            email: 'Email',
            password: 'Password',
          },
          home: {
            pickGame: 'Pick game',
            findGame: 'Find game',
          },
          navigation: {
            login: 'Login',
            register: 'Register',
            home: 'Home',
            engine: 'Engine',
            admin: 'Admin panel',
          },
          fullscreenModal: {
            info: 'Consider playing in fullscreen by clicking fullscreen button below or in the right botom corner of your screen.',
          },
          loginModal: {
            header: 'Login',
          },
        },
      },
      pl: {
        translation: {
          languages: { en: 'Angielski', pl: 'Polski', },
          commons: {
            loading: 'Wczytywanie',
            required: "Wymagane",
            submit: 'Wyślij',
            login: 'Login',
            email: 'Email',
            password: 'Hasło',
          },
          home: {
            pickGame: 'Wybierz grę',
            findGame: 'Znajdź grę',
          },
          room: {

          },
          navigation: {
            login: 'Logowanie',
            register: 'Rejestracja',
            home: 'Start',
            engine: 'Silnik',
            admin: 'Admin panel',
          },
          fullscreenModal: {
            info: 'Graj na pełnym ekranie, klikając przycisk pełnego ekranu poniżej lub w prawym dolnym rogu ekranu.',
          },
          loginModal: {
            header: 'Zaloguj',
          },
          registrationModal: {
            header: 'Rejestracja',
          },
        },
      },
    },
  });


export default i18n;