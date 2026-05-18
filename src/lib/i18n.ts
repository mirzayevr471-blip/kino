import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "movies": "Movies",
        "series": "Series",
        "anime": "Anime",
        "drama": "Drama",
        "cartoons": "Cartoons",
        "all": "All",
        "search": "Search"
      },
      "hero": {
        "watch_now": "Watch Now",
        "add_watchlist": "Add to Watchlist"
      },
      "sections": {
        "trending": "Trending Now",
        "popular_series": "Popular Series",
        "anime_picks": "Anime Picks",
        "continue_watching": "Continue Watching"
      }
    }
  },
  uz: {
    translation: {
      "nav": {
        "home": "Bosh sahifa",
        "movies": "Kinolar",
        "series": "Seriallar",
        "anime": "Anime",
        "drama": "Dramalar",
        "cartoons": "Multfilmlar",
        "all": "Barchasi",
        "search": "Qidiruv"
      },
      "hero": {
        "watch_now": "Hozir ko'rish",
        "add_watchlist": "Ro'yxatga qo'shish"
      },
      "sections": {
        "trending": "Trenddagilar",
        "popular_series": "Mashhur seriallar",
        "anime_picks": "Anime tanlovlari",
        "continue_watching": "Ko'rishni davom ettiring"
      }
    }
  },
  ru: {
    translation: {
      "nav": {
        "home": "Главная",
        "movies": "Фильмы",
        "series": "Сериалы",
        "anime": "Аниме",
        "drama": "Драмы",
        "cartoons": "Мультфильмы",
        "all": "Все",
        "search": "Поиск"
      },
      "hero": {
        "watch_now": "Смотреть сейчас",
        "add_watchlist": "В список"
      },
      "sections": {
        "trending": "В тренде",
        "popular_series": "Популярные сериалы",
        "anime_picks": "Аниме подборки",
        "continue_watching": "Продолжить просмотр"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "uz",
    lng: "uz",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
