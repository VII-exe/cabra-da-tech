/**
 * ============================================
 * i18n - INTERNACIONALIZAÇÃO
 * ============================================
 * 
 * Sistema completo de tradução multilíngue
 * 
 * Funcionalidades:
 * - Carregamento dinâmico de arquivos de idioma
 * - Tradução de textos via data-i18n
 * - Suporte a pluralização
 * - Interpolação de variáveis
 * - Cache de traduções
 * - Fallback para idioma padrão
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO
    // ============================================

    const CONFIG = {
        defaultLocale: 'pt-BR',
        fallbackLocale: 'en',
        translationsPath: './locales/',
        cacheExpiration: 3600000, // 1 hora em ms
        debug: true
    };

    // ============================================
    // CLASSE i18n
    // ============================================

    class I18n {
        constructor() {
            this.currentLocale = CONFIG.defaultLocale;
            this.translations = {};
            this.cache = new Map();
            this.loadingPromises = new Map();
            this.observers = [];
        }

        /**
         * Carregar arquivo de tradução
         * @param {string} locale - Código do idioma
         * @returns {Promise} Promise com traduções
         */
        async loadTranslations(locale) {
            // Verificar se já está carregando
            if (this.loadingPromises.has(locale)) {
                return this.loadingPromises.get(locale);
            }

            // Verificar cache
            const cached = this.getFromCache(locale);
            if (cached) {
                this.log(`📦 Traduções carregadas do cache: ${locale}`);
                this.translations[locale] = cached;
                return cached;
            }

            // Carregar arquivo
            const promise = this._fetchTranslations(locale);
            this.loadingPromises.set(locale, promise);

            try {
                const translations = await promise;
                this.translations[locale] = translations;
                this.saveToCache(locale, translations);
                this.log(`✅ Traduções carregadas: ${locale}`);
                return translations;
            } catch (error) {
                this.error(`❌ Erro ao carregar traduções ${locale}:`, error);

                // Tentar fallback
                if (locale !== CONFIG.fallbackLocale) {
                    this.log(`🔄 Tentando fallback: ${CONFIG.fallbackLocale}`);
                    return this.loadTranslations(CONFIG.fallbackLocale);
                }

                throw error;
            } finally {
                this.loadingPromises.delete(locale);
            }
        }

        /**
         * Buscar arquivo de tradução
         * @private
         */
        async _fetchTranslations(locale) {
            const url = `${CONFIG.translationsPath}${locale}.json`;

            try {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                throw new Error(`Falha ao carregar ${url}: ${error.message}`);
            }
        }

        /**
         * Obter tradução do cache
         * @private
         */
        getFromCache(locale) {
            const cached = this.cache.get(locale);
            if (!cached) return null;

            const now = Date.now();
            if (now - cached.timestamp > CONFIG.cacheExpiration) {
                this.cache.delete(locale);
                return null;
            }

            return cached.data;
        }

        /**
         * Salvar tradução no cache
         * @private
         */
        saveToCache(locale, data) {
            this.cache.set(locale, {
                data: data,
                timestamp: Date.now()
            });
        }

        /**
         * Obter valor aninhado de objeto
         * Ex: get(obj, 'user.name.first')
         * @private
         */
        _getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => {
                return current?.[key];
            }, obj);
        }

        /**
         * Traduzir chave
         * @param {string} key - Chave de tradução (ex: 'nav.home')
         * @param {object} params - Parâmetros para interpolação
         * @param {string} locale - Idioma (opcional)
         * @returns {string} Texto traduzido
         */
        t(key, params = {}, locale = null) {
            locale = locale || this.currentLocale;

            // Obter traduções do idioma
            const translations = this.translations[locale];
            if (!translations) {
                this.warn(`⚠️ Traduções não carregadas para: ${locale}`);
                return key;
            }

            // Buscar tradução
            let translation = this._getNestedValue(translations, key);

            // Fallback para idioma padrão
            if (translation === undefined && locale !== CONFIG.fallbackLocale) {
                const fallbackTranslations = this.translations[CONFIG.fallbackLocale];
                if (fallbackTranslations) {
                    translation = this._getNestedValue(fallbackTranslations, key);
                    if (translation !== undefined) {
                        this.log(`🔄 Usando fallback para: ${key}`);
                    }
                }
            }

            // Se não encontrar, retornar chave
            if (translation === undefined) {
                this.warn(`⚠️ Tradução não encontrada: ${key} (${locale})`);
                return key;
            }

            // Interpolação de variáveis
            if (Object.keys(params).length > 0) {
                translation = this._interpolate(translation, params);
            }

            return translation;
        }

        /**
         * Interpolar variáveis no texto
         * Ex: "Olá {{name}}" com {name: "João"} → "Olá João"
         * @private
         */
        _interpolate(text, params) {
            return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                return params[key] !== undefined ? params[key] : match;
            });
        }

        /**
         * Traduzir com pluralização
         * @param {string} key - Chave base (ex: 'items')
         * @param {number} count - Quantidade
         * @param {object} params - Parâmetros adicionais
         * @returns {string} Texto traduzido com plural correto
         */
        tp(key, count, params = {}) {
            const pluralKey = this._getPluralKey(key, count);
            return this.t(pluralKey, { ...params, count }, this.currentLocale);
        }

        /**
         * Determinar chave de plural baseado na quantidade
         * @private
         */
        _getPluralKey(key, count) {
            // Regras de pluralização simplificadas
            // Para idiomas mais complexos, usar biblioteca como 'intl-pluralrules'

            if (count === 0) {
                return `${key}.zero`;
            } else if (count === 1) {
                return `${key}.one`;
            } else {
                return `${key}.other`;
            }
        }

        /**
         * Traduzir todos os elementos com data-i18n
         */
        translatePage() {
            const elements = document.querySelectorAll('[data-i18n]');

            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (!key) return;

                // Obter parâmetros adicionais se houver
                const paramsAttr = element.getAttribute('data-i18n-params');
                const params = paramsAttr ? JSON.parse(paramsAttr) : {};

                // Traduzir
                const translation = this.t(key, params);

                // Aplicar tradução ao elemento apropriado
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    const placeholder = element.getAttribute('data-i18n-placeholder');
                    if (placeholder) {
                        element.placeholder = this.t(placeholder);
                    }

                    const ariaLabel = element.getAttribute('data-i18n-aria');
                    if (ariaLabel) {
                        element.setAttribute('aria-label', this.t(ariaLabel));
                    }
                } else if (element.tagName === 'IMG') {
                    element.alt = translation;
                } else {
                    // Preservar elementos HTML internos se necessário
                    if (element.children.length === 0) {
                        element.textContent = translation;
                    } else {
                        // Substituir apenas texto direto
                        const textNode = Array.from(element.childNodes)
                            .find(node => node.nodeType === Node.TEXT_NODE);
                        if (textNode) {
                            textNode.textContent = translation;
                        }
                    }
                }
            });

            // Traduzir placeholders separados
            const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
            placeholders.forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                element.placeholder = this.t(key);
            });

            // Traduzir títulos (title attribute)
            const titles = document.querySelectorAll('[data-i18n-title]');
            titles.forEach(element => {
                const key = element.getAttribute('data-i18n-title');
                element.title = this.t(key);
            });

            // Traduzir aria-label
            const ariaLabels = document.querySelectorAll('[data-i18n-aria]');
            ariaLabels.forEach(element => {
                const key = element.getAttribute('data-i18n-aria');
                element.setAttribute('aria-label', this.t(key));
            });

            this.log(`✅ Página traduzida: ${elements.length} elementos`);
        }

        /**
         * Mudar idioma atual
         * @param {string} locale - Código do idioma
         * @returns {Promise} Promise que resolve quando tradução estiver aplicada
         */
        async changeLocale(locale) {
            if (this.currentLocale === locale) {
                this.log(`ℹ️ Idioma já está definido como: ${locale}`);
                return;
            }

            this.log(`🌍 Mudando idioma: ${this.currentLocale} → ${locale}`);

            try {
                // Carregar traduções se necessário
                if (!this.translations[locale]) {
                    await this.loadTranslations(locale);
                }

                // Atualizar idioma atual
                const oldLocale = this.currentLocale;
                this.currentLocale = locale;

                // Traduzir página
                this.translatePage();

                // Notificar observadores
                this._notifyObservers(locale, oldLocale);

                // Disparar evento
                const event = new CustomEvent('i18nchanged', {
                    detail: {
                        locale: locale,
                        oldLocale: oldLocale
                    }
                });
                window.dispatchEvent(event);

                this.log(`✅ Idioma alterado para: ${locale}`);

            } catch (error) {
                this.error(`❌ Erro ao mudar idioma para ${locale}:`, error);
                throw error;
            }
        }

        /**
         * Adicionar observador de mudança de idioma
         * @param {Function} callback - Função a ser chamada
         */
        addObserver(callback) {
            if (typeof callback === 'function') {
                this.observers.push(callback);
            }
        }

        /**
         * Remover observador
         * @param {Function} callback - Função a remover
         */
        removeObserver(callback) {
            const index = this.observers.indexOf(callback);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        }

        /**
         * Notificar observadores
         * @private
         */
        _notifyObservers(newLocale, oldLocale) {
            this.observers.forEach(callback => {
                try {
                    callback(newLocale, oldLocale);
                } catch (error) {
                    this.error('Erro em observador i18n:', error);
                }
            });
        }

        /**
         * Obter idioma atual
         * @returns {string} Código do idioma atual
         */
        getLocale() {
            return this.currentLocale;
        }

        /**
         * Verificar se idioma está carregado
         * @param {string} locale - Código do idioma
         * @returns {boolean}
         */
        isLoaded(locale) {
            return this.translations[locale] !== undefined;
        }

        /**
         * Limpar cache
         */
        clearCache() {
            this.cache.clear();
            this.log('🧹 Cache de traduções limpo');
        }

        /**
         * Inicializar i18n
         * @param {string} locale - Idioma inicial
         * @returns {Promise}
         */
        async init(locale = null) {
            this.log('🚀 Inicializando i18n...');

            // Usar idioma detectado ou padrão
            locale = locale || window.getLocale?.() || CONFIG.defaultLocale;
            this.currentLocale = locale;

            try {
                // Carregar traduções do idioma inicial
                await this.loadTranslations(locale);

                // Carregar fallback em paralelo
                if (locale !== CONFIG.fallbackLocale) {
                    this.loadTranslations(CONFIG.fallbackLocale).catch(err => {
                        this.warn('Aviso ao carregar idioma fallback:', err);
                    });
                }

                // Traduzir página
                this.translatePage();

                this.log('✅ i18n inicializado com sucesso');
                this.log('📍 Idioma atual:', locale);

            } catch (error) {
                this.error('❌ Erro ao inicializar i18n:', error);
                throw error;
            }
        }

        /**
         * Logging condicional
         * @private
         */
        log(...args) {
            if (CONFIG.debug) {
                console.log('[i18n]', ...args);
            }
        }

        warn(...args) {
            if (CONFIG.debug) {
                console.warn('[i18n]', ...args);
            }
        }

        error(...args) {
            console.error('[i18n]', ...args);
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    // Criar instância global
    window.i18n = new I18n();

    // Aguardar LocaleDetector e inicializar
    window.addEventListener('localedetected', async (event) => {
        const detectedLocale = event.detail.locale;

        try {
            await window.i18n.init(detectedLocale);

            // Disparar evento de inicialização completa
            const readyEvent = new CustomEvent('i18nready', {
                detail: { locale: detectedLocale }
            });
            window.dispatchEvent(readyEvent);

        } catch (error) {
            console.error('Erro fatal ao inicializar i18n:', error);
        }
    });

    // ============================================
    // API GLOBAL SIMPLIFICADA
    // ============================================

    /**
     * Função global de tradução (atalho)
     * @param {string} key - Chave de tradução
     * @param {object} params - Parâmetros
     * @returns {string} Texto traduzido
     */
    window.t = function (key, params) {
        return window.i18n.t(key, params);
    };

    /**
     * Tradução com plural
     */
    window.tp = function (key, count, params) {
        return window.i18n.tp(key, count, params);
    };

    /**
     * Observador de mudança de idioma
     */
    window.onLocaleChange = function (callback) {
        window.i18n.addObserver(callback);
    };

    // Log de carregamento
    console.log('✅ i18n carregado e pronto');
    console.log('📦 API global disponível:', {
        i18n: 'window.i18n',
        t: 'window.t(key, params)',
        tp: 'window.tp(key, count, params)',
        onLocaleChange: 'window.onLocaleChange(callback)'
    });

})();