/**
 * ============================================
 * LOCALE DETECTOR - Detecção de Idioma
 * ============================================
 * 
 * Detecta automaticamente o idioma do navegador
 * e define o idioma inicial da página
 * 
 * Suporta:
 * - Detecção via navigator.language
 * - Fallback para idiomas similares
 * - Persistência via localStorage
 * - Lista de idiomas suportados
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO
    // ============================================

    const SUPPORTED_LOCALES = [
        'pt-BR',  // Português Brasil
        'en',     // English
        'es',     // Español
        'ar',     // العربية (Arabic)
        'hi',     // हिन्दी (Hindi)
        'ja',     // 日本語 (Japanese)
        'ru'      // Русский (Russian)
    ];

    const DEFAULT_LOCALE = 'pt-BR';
    const STORAGE_KEY = 'cabradatech_locale';

    // Mapeamento de códigos de idioma para fallback
    const LOCALE_FALLBACKS = {
        'pt': 'pt-BR',      // Português genérico → Português Brasil
        'pt-PT': 'pt-BR',   // Português Portugal → Português Brasil
        'en-US': 'en',      // English US → English
        'en-GB': 'en',      // English UK → English
        'es-ES': 'es',      // Español España → Español
        'es-MX': 'es',      // Español México → Español
        'ar-SA': 'ar',      // Arabic Saudi → Arabic
        'ar-EG': 'ar',      // Arabic Egypt → Arabic
        'hi-IN': 'hi',      // Hindi India → Hindi
        'ja-JP': 'ja',      // Japanese Japan → Japanese
        'ru-RU': 'ru',      // Russian Russia → Russian
        'zh': 'en',         // Chinese → English (não suportado ainda)
        'fr': 'en',         // French → English (não suportado ainda)
        'de': 'en'          // German → English (não suportado ainda)
    };

    // ============================================
    // CLASSE LOCALE DETECTOR
    // ============================================

    class LocaleDetector {
        constructor() {
            this.currentLocale = null;
            this.detectedLocale = null;
            this.userPreferredLocale = null;
        }

        /**
         * Detectar idioma do navegador
         * @returns {string} Código do idioma detectado
         */
        detectBrowserLocale() {
            // Tentar obter idioma do navegador
            const browserLanguages = [
                navigator.language,
                ...(navigator.languages || [])
            ];

            console.log('🌍 Idiomas do navegador:', browserLanguages);

            // Procurar primeiro idioma suportado
            for (const lang of browserLanguages) {
                const normalizedLang = this.normalizeLocale(lang);

                if (SUPPORTED_LOCALES.includes(normalizedLang)) {
                    console.log('✅ Idioma suportado encontrado:', normalizedLang);
                    return normalizedLang;
                }

                // Tentar fallback
                if (LOCALE_FALLBACKS[normalizedLang]) {
                    const fallback = LOCALE_FALLBACKS[normalizedLang];
                    console.log(`🔄 Usando fallback: ${normalizedLang} → ${fallback}`);
                    return fallback;
                }

                // Tentar apenas o código base (ex: 'pt' de 'pt-BR')
                const baseCode = normalizedLang.split('-')[0];
                if (LOCALE_FALLBACKS[baseCode]) {
                    const fallback = LOCALE_FALLBACKS[baseCode];
                    console.log(`🔄 Usando fallback base: ${baseCode} → ${fallback}`);
                    return fallback;
                }
            }

            console.log('⚠️ Nenhum idioma suportado encontrado, usando padrão:', DEFAULT_LOCALE);
            return DEFAULT_LOCALE;
        }

        /**
         * Normalizar código de idioma
         * @param {string} locale - Código de idioma
         * @returns {string} Código normalizado
         */
        normalizeLocale(locale) {
            if (!locale) return DEFAULT_LOCALE;

            // Remover espaços e converter para lowercase
            locale = locale.trim().toLowerCase();

            // Tratar formatos diferentes
            // 'pt_BR' → 'pt-BR'
            locale = locale.replace('_', '-');

            // 'pt-br' → 'pt-BR' (apenas para pt-BR)
            if (locale === 'pt-br') {
                return 'pt-BR';
            }

            return locale;
        }

        /**
         * Obter idioma salvo no localStorage
         * @returns {string|null} Idioma salvo ou null
         */
        getSavedLocale() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved && SUPPORTED_LOCALES.includes(saved)) {
                    console.log('💾 Idioma salvo encontrado:', saved);
                    return saved;
                }
            } catch (error) {
                console.warn('⚠️ Erro ao acessar localStorage:', error);
            }
            return null;
        }

        /**
         * Salvar idioma no localStorage
         * @param {string} locale - Código do idioma
         */
        saveLocale(locale) {
            try {
                localStorage.setItem(STORAGE_KEY, locale);
                console.log('💾 Idioma salvo:', locale);
            } catch (error) {
                console.warn('⚠️ Erro ao salvar no localStorage:', error);
            }
        }

        /**
         * Obter idioma via parâmetro URL
         * @returns {string|null} Idioma da URL ou null
         */
        getLocaleFromURL() {
            const params = new URLSearchParams(window.location.search);
            const urlLocale = params.get('lang') || params.get('locale');

            if (urlLocale) {
                const normalized = this.normalizeLocale(urlLocale);
                if (SUPPORTED_LOCALES.includes(normalized)) {
                    console.log('🔗 Idioma via URL:', normalized);
                    return normalized;
                }
            }
            return null;
        }

        /**
         * Detectar idioma com prioridade:
         * 1. URL (?lang=pt-BR)
         * 2. localStorage (preferência do usuário)
         * 3. Navegador (navigator.language)
         * 4. Default (pt-BR)
         * 
         * @returns {string} Código do idioma a ser usado
         */
        detect() {
            // 1. Verificar URL
            const urlLocale = this.getLocaleFromURL();
            if (urlLocale) {
                this.currentLocale = urlLocale;
                this.saveLocale(urlLocale);
                return urlLocale;
            }

            // 2. Verificar localStorage
            const savedLocale = this.getSavedLocale();
            if (savedLocale) {
                this.currentLocale = savedLocale;
                this.userPreferredLocale = savedLocale;
                return savedLocale;
            }

            // 3. Detectar do navegador
            const detectedLocale = this.detectBrowserLocale();
            this.detectedLocale = detectedLocale;
            this.currentLocale = detectedLocale;

            // Salvar detecção inicial
            this.saveLocale(detectedLocale);

            return detectedLocale;
        }

        /**
         * Verificar se idioma é RTL (Right-to-Left)
         * @param {string} locale - Código do idioma
         * @returns {boolean} true se for RTL
         */
        isRTL(locale) {
            const rtlLocales = ['ar']; // Adicionar outros se necessário (he, fa, ur)
            return rtlLocales.includes(locale);
        }

        /**
         * Obter informações completas do idioma
         * @param {string} locale - Código do idioma
         * @returns {object} Informações do idioma
         */
        getLocaleInfo(locale) {
            const localeData = {
                'pt-BR': {
                    code: 'pt-BR',
                    name: 'Português',
                    nativeName: 'Português (Brasil)',
                    dir: 'ltr',
                    flag: '🇧🇷',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: 'HH:mm',
                    currency: 'BRL',
                    currencySymbol: 'R$',
                    decimalSeparator: ',',
                    thousandsSeparator: '.'
                },
                'en': {
                    code: 'en',
                    name: 'English',
                    nativeName: 'English (US)',
                    dir: 'ltr',
                    flag: '🇺🇸',
                    dateFormat: 'MM/DD/YYYY',
                    timeFormat: 'hh:mm A',
                    currency: 'USD',
                    currencySymbol: '$',
                    decimalSeparator: '.',
                    thousandsSeparator: ','
                },
                'es': {
                    code: 'es',
                    name: 'Spanish',
                    nativeName: 'Español',
                    dir: 'ltr',
                    flag: '🇪🇸',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: 'HH:mm',
                    currency: 'EUR',
                    currencySymbol: '€',
                    decimalSeparator: ',',
                    thousandsSeparator: '.'
                },
                'ar': {
                    code: 'ar',
                    name: 'Arabic',
                    nativeName: 'العربية',
                    dir: 'rtl',
                    flag: '🇸🇦',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: 'HH:mm',
                    currency: 'SAR',
                    currencySymbol: 'ر.س',
                    decimalSeparator: '.',
                    thousandsSeparator: ','
                },
                'hi': {
                    code: 'hi',
                    name: 'Hindi',
                    nativeName: 'हिन्दी',
                    dir: 'ltr',
                    flag: '🇮🇳',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: 'HH:mm',
                    currency: 'INR',
                    currencySymbol: '₹',
                    decimalSeparator: '.',
                    thousandsSeparator: ','
                },
                'ja': {
                    code: 'ja',
                    name: 'Japanese',
                    nativeName: '日本語',
                    dir: 'ltr',
                    flag: '🇯🇵',
                    dateFormat: 'YYYY/MM/DD',
                    timeFormat: 'HH:mm',
                    currency: 'JPY',
                    currencySymbol: '¥',
                    decimalSeparator: '.',
                    thousandsSeparator: ','
                },
                'ru': {
                    code: 'ru',
                    name: 'Russian',
                    nativeName: 'Русский',
                    dir: 'ltr',
                    flag: '🇷🇺',
                    dateFormat: 'DD.MM.YYYY',
                    timeFormat: 'HH:mm',
                    currency: 'RUB',
                    currencySymbol: '₽',
                    decimalSeparator: ',',
                    thousandsSeparator: ' '
                }
            };

            return localeData[locale] || localeData[DEFAULT_LOCALE];
        }

        /**
         * Aplicar idioma ao documento HTML
         * @param {string} locale - Código do idioma
         */
        applyToDocument(locale) {
            const html = document.documentElement;
            const info = this.getLocaleInfo(locale);

            // Definir atributos no HTML
            html.setAttribute('lang', locale);
            html.setAttribute('dir', info.dir);

            // Adicionar classe para facilitar CSS
            html.classList.remove('lang-pt-BR', 'lang-en', 'lang-es', 'lang-ar', 'lang-hi', 'lang-ja', 'lang-ru');
            html.classList.add(`lang-${locale}`);

            // Adicionar classe RTL se necessário
            if (info.dir === 'rtl') {
                html.classList.add('rtl');
            } else {
                html.classList.remove('rtl');
            }

            console.log(`🌍 Idioma aplicado ao documento: ${locale} (${info.dir})`);
        }

        /**
         * Obter lista de idiomas suportados
         * @returns {Array} Lista de objetos com informações dos idiomas
         */
        getSupportedLocales() {
            return SUPPORTED_LOCALES.map(locale => this.getLocaleInfo(locale));
        }

        /**
         * Inicializar detector
         * @returns {string} Idioma detectado
         */
        init() {
            console.log('🚀 Inicializando Locale Detector...');

            const locale = this.detect();
            this.applyToDocument(locale);

            // Disparar evento customizado
            const event = new CustomEvent('localedetected', {
                detail: {
                    locale: locale,
                    info: this.getLocaleInfo(locale),
                    isRTL: this.isRTL(locale)
                }
            });
            window.dispatchEvent(event);

            console.log('✅ Locale Detector inicializado');
            console.log('📍 Idioma atual:', locale);

            return locale;
        }
    }

    // ============================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ============================================

    // Criar instância global
    window.LocaleDetector = new LocaleDetector();

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.LocaleDetector.init();
        });
    } else {
        window.LocaleDetector.init();
    }

    // ============================================
    // API PÚBLICA
    // ============================================

    /**
     * API global para facilitar uso em outros scripts
     */
    window.getLocale = function () {
        return window.LocaleDetector.currentLocale || DEFAULT_LOCALE;
    };

    window.setLocale = function (locale) {
        if (SUPPORTED_LOCALES.includes(locale)) {
            window.LocaleDetector.currentLocale = locale;
            window.LocaleDetector.saveLocale(locale);
            window.LocaleDetector.applyToDocument(locale);

            // Disparar evento de mudança
            const event = new CustomEvent('localechanged', {
                detail: {
                    locale: locale,
                    info: window.LocaleDetector.getLocaleInfo(locale)
                }
            });
            window.dispatchEvent(event);

            return true;
        }
        return false;
    };

    window.getLocaleInfo = function (locale) {
        return window.LocaleDetector.getLocaleInfo(locale || window.getLocale());
    };

    window.isRTL = function (locale) {
        return window.LocaleDetector.isRTL(locale || window.getLocale());
    };

    window.getSupportedLocales = function () {
        return window.LocaleDetector.getSupportedLocales();
    };

    // Log de carregamento
    console.log('✅ LocaleDetector carregado e pronto');
    console.log('📦 API global disponível:', {
        getLocale: 'window.getLocale()',
        setLocale: 'window.setLocale(locale)',
        getLocaleInfo: 'window.getLocaleInfo(locale)',
        isRTL: 'window.isRTL(locale)',
        getSupportedLocales: 'window.getSupportedLocales()'
    });

})();