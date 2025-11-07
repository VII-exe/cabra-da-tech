/**
 * ============================================
 * FONT LOADER - Carregamento de Fontes
 * ============================================
 * 
 * Carrega dinamicamente fontes específicas
 * para cada idioma/script
 * 
 * Funcionalidades:
 * - Carregamento sob demanda de fontes
 * - Suporte a múltiplos scripts (Latino, Árabe, Devanágari, CJK, Cirílico)
 * - Font loading API
 * - Fallbacks para fontes do sistema
 * - Cache de fontes carregadas
 * - Performance otimizada
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO DE FONTES
    // ============================================

    const FONT_CONFIG = {
        // Fontes padrão do sistema (sempre disponíveis)
        system: {
            latin: ['Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
            arabic: ['Arial', 'Tahoma', 'sans-serif'],
            devanagari: ['Mangal', 'Noto Sans Devanagari', 'sans-serif'],
            japanese: ['Yu Gothic', 'Meiryo', 'MS PGothic', 'sans-serif'],
            cyrillic: ['Arial', 'Tahoma', 'sans-serif']
        },

        // Fontes web para carregamento sob demanda
        web: {
            // Google Fonts
            'Noto Sans Arabic': {
                url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap',
                family: 'Noto Sans Arabic',
                script: 'arabic',
                weight: [400, 600, 700]
            },
            'Noto Sans Devanagari': {
                url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap',
                family: 'Noto Sans Devanagari',
                script: 'devanagari',
                weight: [400, 600, 700]
            },
            'Noto Sans JP': {
                url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap',
                family: 'Noto Sans JP',
                script: 'japanese',
                weight: [400, 600, 700]
            },
            'Amiri': {
                url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
                family: 'Amiri',
                script: 'arabic',
                weight: [400, 700],
                serif: true
            },
            'Roboto': {
                url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
                family: 'Roboto',
                script: 'latin',
                weight: [400, 500, 700]
            }
        },

        // Mapeamento idioma → script
        localeToScript: {
            'pt-BR': 'latin',
            'en': 'latin',
            'es': 'latin',
            'ar': 'arabic',
            'hi': 'devanagari',
            'ja': 'japanese',
            'ru': 'cyrillic'
        },

        // Fontes preferenciais por idioma
        preferredFonts: {
            'pt-BR': ['Roboto', 'Segoe UI'],
            'en': ['Roboto', 'Segoe UI'],
            'es': ['Roboto', 'Segoe UI'],
            'ar': ['Amiri', 'Noto Sans Arabic'],
            'hi': ['Noto Sans Devanagari'],
            'ja': ['Noto Sans JP'],
            'ru': ['Roboto']
        }
    };

    // ============================================
    // CLASSE FONT LOADER
    // ============================================

    class FontLoader {
        constructor() {
            this.loadedFonts = new Set();
            this.loadingPromises = new Map();
            this.currentLocale = 'pt-BR';
            this.fontFaceObserver = null;
            this.supportsLoadAPI = 'fonts' in document;
        }

        /**
         * Obter script do idioma
         * @param {string} locale
         * @returns {string}
         */
        getScriptForLocale(locale) {
            return FONT_CONFIG.localeToScript[locale] || 'latin';
        }

        /**
         * Obter fontes preferenciais para idioma
         * @param {string} locale
         * @returns {Array}
         */
        getPreferredFonts(locale) {
            return FONT_CONFIG.preferredFonts[locale] || ['Roboto'];
        }

        /**
         * Obter fontes de fallback do sistema
         * @param {string} script
         * @returns {Array}
         */
        getSystemFallbacks(script) {
            return FONT_CONFIG.system[script] || FONT_CONFIG.system.latin;
        }

        /**
         * Verificar se fonte já está carregada
         * @param {string} fontFamily
         * @returns {boolean}
         */
        isFontLoaded(fontFamily) {
            return this.loadedFonts.has(fontFamily);
        }

        /**
         * Carregar fonte via CSS link
         * @private
         */
        _loadFontCSS(fontConfig) {
            return new Promise((resolve, reject) => {
                // Verificar se já existe
                const existingLink = document.querySelector(`link[href="${fontConfig.url}"]`);
                if (existingLink) {
                    console.log(`✅ Fonte já carregada: ${fontConfig.family}`);
                    resolve();
                    return;
                }

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = fontConfig.url;

                link.onload = () => {
                    console.log(`✅ CSS da fonte carregado: ${fontConfig.family}`);
                    resolve();
                };

                link.onerror = () => {
                    console.error(`❌ Erro ao carregar CSS da fonte: ${fontConfig.family}`);
                    reject(new Error(`Falha ao carregar ${fontConfig.url}`));
                };

                document.head.appendChild(link);
            });
        }

        /**
         * Aguardar fonte estar disponível usando Font Loading API
         * @private
         */
        async _waitForFontLoad(fontFamily, weight = 400) {
            if (!this.supportsLoadAPI) {
                // Fallback: aguardar tempo fixo
                await new Promise(resolve => setTimeout(resolve, 1000));
                return;
            }

            try {
                // Tentar carregar com Font Loading API
                await document.fonts.load(`${weight} 16px "${fontFamily}"`);
                console.log(`✅ Fonte renderizável: ${fontFamily}`);
            } catch (error) {
                console.warn(`⚠️ Font Loading API falhou para ${fontFamily}:`, error);
            }
        }

        /**
         * Carregar uma fonte específica
         * @param {string} fontName - Nome da fonte
         * @returns {Promise}
         */
        async loadFont(fontName) {
            // Verificar se já está carregada
            if (this.isFontLoaded(fontName)) {
                console.log(`ℹ️ Fonte já carregada: ${fontName}`);
                return true;
            }

            // Verificar se já está carregando
            if (this.loadingPromises.has(fontName)) {
                return this.loadingPromises.get(fontName);
            }

            // Obter configuração da fonte
            const fontConfig = FONT_CONFIG.web[fontName];
            if (!fontConfig) {
                console.warn(`⚠️ Configuração não encontrada para fonte: ${fontName}`);
                return false;
            }

            console.log(`🔄 Carregando fonte: ${fontName}...`);

            const loadPromise = (async () => {
                try {
                    // 1. Carregar CSS
                    await this._loadFontCSS(fontConfig);

                    // 2. Aguardar fonte estar disponível
                    await this._waitForFontLoad(fontConfig.family, fontConfig.weight[0]);

                    // 3. Marcar como carregada
                    this.loadedFonts.add(fontName);

                    console.log(`✅ Fonte carregada com sucesso: ${fontName}`);
                    return true;

                } catch (error) {
                    console.error(`❌ Erro ao carregar fonte ${fontName}:`, error);
                    return false;
                }
            })();

            this.loadingPromises.set(fontName, loadPromise);
            const result = await loadPromise;
            this.loadingPromises.delete(fontName);

            return result;
        }

        /**
         * Carregar múltiplas fontes em paralelo
         * @param {Array} fontNames - Lista de nomes de fontes
         * @returns {Promise}
         */
        async loadFonts(fontNames) {
            if (!Array.isArray(fontNames) || fontNames.length === 0) {
                return [];
            }

            console.log(`📦 Carregando ${fontNames.length} fonte(s):`, fontNames);

            const promises = fontNames.map(name => this.loadFont(name));
            const results = await Promise.allSettled(promises);

            const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
            console.log(`✅ ${success}/${fontNames.length} fontes carregadas`);

            return results;
        }

        /**
         * Carregar fontes para um idioma específico
         * @param {string} locale - Código do idioma
         * @returns {Promise}
         */
        async loadFontsForLocale(locale) {
            console.log(`🌍 Carregando fontes para: ${locale}`);

            this.currentLocale = locale;
            const preferredFonts = this.getPreferredFonts(locale);

            try {
                await this.loadFonts(preferredFonts);
                this.applyFonts(locale);
                return true;
            } catch (error) {
                console.error(`❌ Erro ao carregar fontes para ${locale}:`, error);
                return false;
            }
        }

        /**
         * Aplicar fontes ao documento
         * @param {string} locale
         */
        applyFonts(locale) {
            const script = this.getScriptForLocale(locale);
            const preferredFonts = this.getPreferredFonts(locale);
            const systemFallbacks = this.getSystemFallbacks(script);

            // Construir font-family stack
            const loadedWebFonts = preferredFonts.filter(font => this.isFontLoaded(font));
            const fontStack = [...loadedWebFonts, ...systemFallbacks].join(', ');

            // Aplicar ao elemento HTML
            document.documentElement.style.fontFamily = fontStack;

            console.log(`✅ Fontes aplicadas: ${fontStack}`);

            // Disparar evento
            const event = new CustomEvent('fontsloaded', {
                detail: {
                    locale: locale,
                    fonts: loadedWebFonts,
                    fontStack: fontStack
                }
            });
            window.dispatchEvent(event);
        }

        /**
         * Pré-carregar fontes essenciais
         * Carrega fontes de forma assíncrona sem bloquear renderização
         */
        async preloadEssentialFonts() {
            console.log('📦 Pré-carregando fontes essenciais...');

            // Fontes latinas básicas (usadas pela maioria dos idiomas)
            const essentials = ['Roboto'];

            try {
                await this.loadFonts(essentials);
                console.log('✅ Fontes essenciais pré-carregadas');
            } catch (error) {
                console.warn('⚠️ Erro ao pré-carregar fontes:', error);
            }
        }

        /**
         * Obter informações sobre fontes disponíveis
         * @returns {object}
         */
        getFontInfo() {
            return {
                loaded: Array.from(this.loadedFonts),
                currentLocale: this.currentLocale,
                currentScript: this.getScriptForLocale(this.currentLocale),
                supportsLoadAPI: this.supportsLoadAPI,
                available: Object.keys(FONT_CONFIG.web)
            };
        }

        /**
         * Verificar se navegador suporta Font Loading API
         * @returns {boolean}
         */
        supportsFontLoadingAPI() {
            return this.supportsLoadAPI;
        }

        /**
         * Detectar fontes disponíveis no sistema (experimental)
         * @param {string} fontFamily
         * @returns {boolean}
         */
        isSystemFontAvailable(fontFamily) {
            // Técnica de detecção básica
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const testString = 'mmmmmmmmmmlli';
            const testSize = '72px';

            context.font = `${testSize} monospace`;
            const baselineWidth = context.measureText(testString).width;

            context.font = `${testSize} ${fontFamily}, monospace`;
            const testWidth = context.measureText(testString).width;

            return baselineWidth !== testWidth;
        }

        /**
         * Limpar cache de fontes
         */
        clearCache() {
            this.loadedFonts.clear();
            console.log('🧹 Cache de fontes limpo');
        }

        /**
         * Inicializar Font Loader
         * @param {string} locale - Idioma inicial
         */
        async init(locale = null) {
            console.log('🚀 Inicializando FontLoader...');

            locale = locale || window.getLocale?.() || 'pt-BR';

            // Pré-carregar fontes essenciais em background
            this.preloadEssentialFonts();

            // Carregar fontes do idioma atual
            await this.loadFontsForLocale(locale);

            console.log('✅ FontLoader inicializado');
            console.log('📊 Fontes carregadas:', Array.from(this.loadedFonts));
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    // Criar instância global
    window.FontLoader = new FontLoader();

    // Sincronizar com mudanças de idioma
    window.addEventListener('localedetected', async (event) => {
        const locale = event.detail.locale;
        await window.FontLoader.loadFontsForLocale(locale);
    });

    window.addEventListener('i18nchanged', async (event) => {
        const locale = event.detail.locale;
        await window.FontLoader.loadFontsForLocale(locale);
    });

    // Inicializar quando i18n estiver pronto
    window.addEventListener('i18nready', async (event) => {
        await window.FontLoader.init(event.detail.locale);
    });

    // ============================================
    // API GLOBAL
    // ============================================

    /**
     * Carregar fonte
     */
    window.loadFont = async (fontName) => {
        return window.FontLoader.loadFont(fontName);
    };

    /**
     * Obter info de fontes
     */
    window.getFontInfo = () => {
        return window.FontLoader.getFontInfo();
    };

    /**
     * Verificar se fonte está carregada
     */
    window.isFontLoaded = (fontName) => {
        return window.FontLoader.isFontLoaded(fontName);
    };

    console.log('✅ FontLoader carregado');
    console.log('📦 API global disponível:', {
        FontLoader: 'window.FontLoader',
        loadFont: 'window.loadFont(fontName)',
        getFontInfo: 'window.getFontInfo()',
        isFontLoaded: 'window.isFontLoaded(fontName)'
    });

    // ============================================
    // DEBUG INFO
    // ============================================

    if (window.location.search.includes('debug=fonts')) {
        console.log('🔍 FontLoader Debug Info:');
        console.log('Fontes configuradas:', FONT_CONFIG.web);
        console.log('Suporte Font Loading API:', window.FontLoader.supportsFontLoadingAPI());

        // Testar fontes do sistema
        const systemFonts = ['Arial', 'Segoe UI', 'Roboto', 'Noto Sans'];
        console.log('Fontes do sistema disponíveis:');
        systemFonts.forEach(font => {
            const available = window.FontLoader.isSystemFontAvailable(font);
            console.log(`  ${font}: ${available ? '✅' : '❌'}`);
        });
    }

})();