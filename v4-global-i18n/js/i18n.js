/**
 * ============================================
 * I18N.JS - Sistema de Internacionalização
 * ============================================
 * 
 * VERSÃO CORRIGIDA - isLoaded funciona corretamente
 */

class I18n {
    constructor() {
        this.currentLocale = this.detectLocale();
        this.translations = {};
        this.isLoaded = false;
        this.observers = [];
        this.translationCache = new Map();
        
        console.log('📦 i18n construído, locale:', this.currentLocale);
    }

    detectLocale() {
        // 1. Verificar localStorage
        const saved = localStorage.getItem('preferredLocale');
        if (saved) return saved;

        // 2. Verificar atributo HTML
        const htmlLang = document.documentElement.getAttribute('lang');
        if (htmlLang) return htmlLang;

        // 3. Detectar do navegador
        const browserLang = navigator.language || navigator.userLanguage;

        // Mapear locales
        const localeMap = {
            'pt': 'pt-BR',
            'pt-BR': 'pt-BR',
            'en': 'en',
            'en-US': 'en',
            'es': 'es',
            'es-ES': 'es',
            'ar': 'ar',
            'hi': 'hi',
            'ja': 'ja',
            'ru': 'ru'
        };

        return localeMap[browserLang] || localeMap[browserLang.split('-')[0]] || 'pt-BR';
    }

    async loadTranslations(locale) {
        try {
            console.log(`🌍 Carregando traduções: ${locale}`);

            const response = await fetch(`./locales/${locale}.json`);

            if (!response.ok) {
                throw new Error(`Erro ao carregar ${locale}.json: ${response.status}`);
            }

            const data = await response.json();

            if (!data.translations) {
                throw new Error(`Arquivo ${locale}.json não contém campo "translations"`);
            }

            this.translations = data.translations;
            this.currentLocale = locale;
            this.isLoaded = true; // ← IMPORTANTE!

            // Salvar preferência
            localStorage.setItem('preferredLocale', locale);

            // Atualizar atributos HTML
            document.documentElement.setAttribute('lang', locale);
            document.documentElement.setAttribute('dir', data.direction || 'ltr');

            // Limpar cache
            this.translationCache.clear();

            console.log(`✅ Traduções carregadas: ${locale} (isLoaded = true)`);

            // Notificar observers
            this.notifyObservers();

            return true;

        } catch (error) {
            console.error(`❌ Erro ao carregar traduções:`, error);

            // Fallback para pt-BR
            if (locale !== 'pt-BR') {
                console.warn('⚠️ Tentando fallback para pt-BR...');
                return await this.loadTranslations('pt-BR');
            }

            return false;
        }
    }

    t(key, params = {}) {
        if (!this.isLoaded) {
            console.warn(`⚠️ Traduções não carregadas ainda. Chave: ${key}`);
            return key;
        }

        // Verificar cache
        const cacheKey = `${key}-${JSON.stringify(params)}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }

        // Navegar pelo objeto de traduções
        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`⚠️ Chave de tradução não encontrada: ${key}`);
                return key;
            }
        }

        // Se chegou aqui, value contém a tradução
        if (typeof value !== 'string') {
            console.warn(`⚠️ Tradução não é string: ${key}`, value);
            return key;
        }

        // Substituir parâmetros {{param}}
        let result = value;
        for (const [param, paramValue] of Object.entries(params)) {
            const regex = new RegExp(`\\{\\{${param}\\}\\}`, 'g');
            result = result.replace(regex, paramValue);
        }

        // Adicionar ao cache
        this.translationCache.set(cacheKey, result);

        return result;
    }

    applyTranslations() {
        if (!this.isLoaded) {
            console.warn('⚠️ Tentando aplicar traduções antes do carregamento');
            return;
        }

        console.log('🔄 Aplicando traduções no DOM...');

        // Elementos com data-i18n
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            // Aplicar tradução
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Elementos com data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Elementos com data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Elementos com data-i18n-aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });

        // Elementos com data-i18n-alt
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            element.alt = this.t(key);
        });

        console.log(`✅ Traduções aplicadas: ${elements.length} elementos`);
    }

    async changeLocale(locale) {
        console.log(`🔄 Mudando idioma para: ${locale}`);

        const success = await this.loadTranslations(locale);

        if (success) {
            this.applyTranslations();
            this.announceLocaleChange(locale);
            return true;
        }

        return false;
    }

    announceLocaleChange(locale) {
        const announcement = this.t('announcements.languageChanged', { language: locale });

        let liveRegion = document.getElementById('i18n-announcer');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'i18n-announcer';
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = announcement;
    }

    formatDate(date, options = {}) {
        const locale = this.currentLocale;
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    }

    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLocale, options).format(number);
    }

    formatCurrency(amount, currency = 'BRL', options = {}) {
        const defaultOptions = {
            style: 'currency',
            currency: currency
        };

        return new Intl.NumberFormat(this.currentLocale, { ...defaultOptions, ...options }).format(amount);
    }

    relativeTime(date) {
        const now = new Date();
        const past = typeof date === 'string' ? new Date(date) : date;
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) {
            return this.t('time.justNow');
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return this.t('time.minutesAgo.other', { count: diffInMinutes });
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return this.t('time.hoursAgo.other', { count: diffInHours });
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return this.t('time.daysAgo.other', { count: diffInDays });
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return this.t('time.weeksAgo.other', { count: diffInWeeks });
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return this.t('time.monthsAgo.other', { count: diffInMonths });
        }

        const diffInYears = Math.floor(diffInDays / 365);
        return this.t('time.yearsAgo.other', { count: diffInYears });
    }

    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLocale));
    }

    getDirection() {
        const rtlLocales = ['ar', 'he', 'fa', 'ur'];
        return rtlLocales.includes(this.currentLocale) ? 'rtl' : 'ltr';
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Criar instância global IMEDIATAMENTE
const i18n = new I18n();
window.i18n = i18n; // ← Expor ANTES do DOMContentLoaded
window.t = (key, params) => i18n.t(key, params);

console.log('📦 Módulo i18n carregado');
console.log('🔗 window.i18n disponível (isLoaded:', i18n.isLoaded, ')');

// Carregar traduções quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌍 Inicializando sistema i18n...');

    const success = await i18n.loadTranslations(i18n.currentLocale);

    if (success) {
        i18n.applyTranslations();
        console.log('✅ Sistema i18n inicializado (isLoaded = true)');
    } else {
        console.error('❌ Falha ao inicializar sistema i18n');
    }
});