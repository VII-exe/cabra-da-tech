/**
 * ============================================
 * LANGUAGE SWITCHER - Troca de Idioma
 * ============================================
 * 
 * Gerencia interface de seleção de idiomas
 * e sincroniza mudanças em todo o site
 * 
 * Funcionalidades:
 * - Select dropdown com bandeiras
 * - Sincronização com LocaleDetector
 * - Atualização de i18n
 * - Atualização de RTL
 * - Atualização de fontes
 * - Atualização de formatadores
 * - Persistência de preferência
 * - Loading states
 * - Anúncios para leitores de tela
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO
    // ============================================

    const CONFIG = {
        selectId: 'select-language',
        storageKey: 'cabradatech_locale',
        loadingClass: 'loading',
        liveRegionId: 'live-region',
        announceDelay: 300, // ms
        debug: true
    };

    // Metadados dos idiomas
    const LANGUAGE_DATA = {
        'pt-BR': {
            code: 'pt-BR',
            name: 'Português',
            nativeName: 'Português (Brasil)',
            flag: '🇧🇷',
            dir: 'ltr'
        },
        'en': {
            code: 'en',
            name: 'English',
            nativeName: 'English (US)',
            flag: '🇺🇸',
            dir: 'ltr'
        },
        'es': {
            code: 'es',
            name: 'Spanish',
            nativeName: 'Español',
            flag: '🇪🇸',
            dir: 'ltr'
        },
        'ar': {
            code: 'ar',
            name: 'Arabic',
            nativeName: 'العربية',
            flag: '🇸🇦',
            dir: 'rtl'
        },
        'hi': {
            code: 'hi',
            name: 'Hindi',
            nativeName: 'हिन्दी',
            flag: '🇮🇳',
            dir: 'ltr'
        },
        'ja': {
            code: 'ja',
            name: 'Japanese',
            nativeName: '日本語',
            flag: '🇯🇵',
            dir: 'ltr'
        },
        'ru': {
            code: 'ru',
            name: 'Russian',
            nativeName: 'Русский',
            flag: '🇷🇺',
            dir: 'ltr'
        }
    };

    // ============================================
    // CLASSE LANGUAGE SWITCHER
    // ============================================

    class LanguageSwitcher {
        constructor() {
            this.selectElement = null;
            this.currentLocale = 'pt-BR';
            this.isChanging = false;
            this.liveRegion = null;
        }

        /**
         * Obter elemento select
         * @returns {HTMLSelectElement}
         */
        getSelectElement() {
            if (!this.selectElement) {
                this.selectElement = document.getElementById(CONFIG.selectId);
            }
            return this.selectElement;
        }

        /**
         * Obter live region para anúncios
         * @returns {HTMLElement}
         */
        getLiveRegion() {
            if (!this.liveRegion) {
                this.liveRegion = document.getElementById(CONFIG.liveRegionId);

                // Criar se não existir
                if (!this.liveRegion) {
                    this.liveRegion = document.createElement('div');
                    this.liveRegion.id = CONFIG.liveRegionId;
                    this.liveRegion.setAttribute('role', 'status');
                    this.liveRegion.setAttribute('aria-live', 'polite');
                    this.liveRegion.setAttribute('aria-atomic', 'true');
                    this.liveRegion.className = 'sr-only';
                    document.body.appendChild(this.liveRegion);
                }
            }
            return this.liveRegion;
        }

        /**
         * Anunciar mensagem para leitores de tela
         * @param {string} message
         */
        announce(message) {
            const liveRegion = this.getLiveRegion();

            // Limpar conteúdo anterior
            liveRegion.textContent = '';

            // Aguardar um momento para garantir que seja anunciado
            setTimeout(() => {
                liveRegion.textContent = message;
            }, CONFIG.announceDelay);

            this.log('📢 Anunciado:', message);
        }

        /**
         * Obter dados do idioma
         * @param {string} locale
         * @returns {object}
         */
        getLanguageData(locale) {
            return LANGUAGE_DATA[locale] || LANGUAGE_DATA['pt-BR'];
        }

        /**
         * Atualizar valor do select
         * @param {string} locale
         */
        updateSelectValue(locale) {
            const select = this.getSelectElement();
            if (select && select.value !== locale) {
                select.value = locale;
                this.log(`✅ Select atualizado para: ${locale}`);
            }
        }

        /**
         * Adicionar loading state
         */
        setLoading(isLoading) {
            const select = this.getSelectElement();
            if (!select) return;

            if (isLoading) {
                select.classList.add(CONFIG.loadingClass);
                select.disabled = true;
                this.isChanging = true;
            } else {
                select.classList.remove(CONFIG.loadingClass);
                select.disabled = false;
                this.isChanging = false;
            }
        }

        /**
         * Mudar idioma
         * @param {string} newLocale
         * @returns {Promise}
         */
        async changeLanguage(newLocale) {
            if (this.isChanging) {
                this.log('⚠️ Mudança de idioma já em progresso');
                return false;
            }

            if (this.currentLocale === newLocale) {
                this.log(`ℹ️ Idioma já está definido como: ${newLocale}`);
                return true;
            }

            const langData = this.getLanguageData(newLocale);
            this.log(`🌍 Iniciando mudança de idioma: ${this.currentLocale} → ${newLocale}`);

            try {
                // Ativar loading
                this.setLoading(true);

                // 1. Atualizar LocaleDetector
                if (window.setLocale) {
                    window.setLocale(newLocale);
                }

                // 2. Carregar fontes para novo idioma
                if (window.FontLoader) {
                    this.log('🔤 Carregando fontes...');
                    await window.FontLoader.loadFontsForLocale(newLocale);
                }

                // 3. Atualizar i18n (traduzir página)
                if (window.i18n) {
                    this.log('🌐 Traduzindo página...');
                    await window.i18n.changeLocale(newLocale);
                }

                // 4. Atualizar RTL se necessário
                if (window.RTLSupport) {
                    this.log('↔️ Ajustando direção...');
                    const direction = window.RTLSupport.getDirection(newLocale);
                    window.RTLSupport.setDirection(direction);
                }

                // 5. Atualizar formatadores
                if (window.IntlFormatter) {
                    this.log('📊 Atualizando formatadores...');
                    window.IntlFormatter.setLocale(newLocale);
                    window.IntlFormatter.formatElements();
                }

                // 6. Atualizar VLibras (só para pt-BR)
                this.updateVLibras(newLocale);

                // Atualizar estado
                this.currentLocale = newLocale;

                // Anunciar mudança
                const announcement = this.getChangeAnnouncement(newLocale);
                this.announce(announcement);

                // Disparar evento personalizado
                const event = new CustomEvent('languagechanged', {
                    detail: {
                        locale: newLocale,
                        previousLocale: this.currentLocale,
                        languageData: langData
                    }
                });
                window.dispatchEvent(event);

                this.log(`✅ Idioma alterado com sucesso para: ${newLocale}`);
                return true;

            } catch (error) {
                this.error(`❌ Erro ao mudar idioma para ${newLocale}:`, error);

                // Restaurar select para idioma anterior
                this.updateSelectValue(this.currentLocale);

                // Anunciar erro
                this.announce('Erro ao mudar idioma. Por favor, tente novamente.');

                return false;

            } finally {
                // Desativar loading
                this.setLoading(false);
            }
        }

        /**
         * Obter mensagem de anúncio de mudança
         * @param {string} locale
         * @returns {string}
         */
        getChangeAnnouncement(locale) {
            const langData = this.getLanguageData(locale);

            // Mensagens em diferentes idiomas
            const announcements = {
                'pt-BR': `Idioma alterado para Português Brasil`,
                'en': `Language changed to English`,
                'es': `Idioma cambiado a Español`,
                'ar': `تم تغيير اللغة إلى العربية`,
                'hi': `भाषा हिन्दी में बदली गई`,
                'ja': `言語が日本語に変更されました`,
                'ru': `Язык изменен на Русский`
            };

            return announcements[locale] || `Language changed to ${langData.nativeName}`;
        }

        /**
         * Atualizar visibilidade do VLibras
         * @param {string} locale
         */
        updateVLibras(locale) {
            const librasContainer = document.getElementById('libras-container');
            const vlibrasWidget = document.querySelector('[vw]');

            if (locale === 'pt-BR') {
                // Mostrar VLibras apenas para português
                if (librasContainer) {
                    librasContainer.style.display = 'flex';
                }
                if (vlibrasWidget) {
                    vlibrasWidget.style.display = 'block';
                }
            } else {
                // Ocultar para outros idiomas
                if (librasContainer) {
                    librasContainer.style.display = 'none';
                }
                if (vlibrasWidget) {
                    vlibrasWidget.style.display = 'none';
                }
            }
        }

        /**
         * Adicionar event listener ao select
         */
        attachEventListener() {
            const select = this.getSelectElement();
            if (!select) {
                this.error('❌ Elemento select não encontrado');
                return;
            }

            select.addEventListener('change', async (event) => {
                const newLocale = event.target.value;
                await this.changeLanguage(newLocale);
            });

            // Acessibilidade: permitir navegação por teclado
            select.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    select.click();
                }
            });

            this.log('✅ Event listener adicionado ao select');
        }

        /**
         * Popular opções do select com bandeiras
         */
        populateSelect() {
            const select = this.getSelectElement();
            if (!select) return;

            // Limpar opções existentes
            select.innerHTML = '';

            // Adicionar opções
            Object.values(LANGUAGE_DATA).forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.textContent = `${lang.flag} ${lang.nativeName}`;
                option.setAttribute('data-flag', lang.flag);

                // Adicionar atributo dir para melhor suporte a RTL
                if (lang.dir === 'rtl') {
                    option.setAttribute('dir', 'rtl');
                }

                select.appendChild(option);
            });

            this.log('✅ Select populado com', Object.keys(LANGUAGE_DATA).length, 'idiomas');
        }

        /**
         * Criar badge visual do idioma atual (opcional)
         */
        createLanguageBadge() {
            const existingBadge = document.getElementById('current-language-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            const langData = this.getLanguageData(this.currentLocale);

            const badge = document.createElement('span');
            badge.id = 'current-language-badge';
            badge.className = 'language-badge';
            badge.textContent = `${langData.flag} ${langData.nativeName}`;
            badge.setAttribute('aria-label', `Idioma atual: ${langData.nativeName}`);

            // Inserir próximo ao select
            const select = this.getSelectElement();
            if (select && select.parentNode) {
                select.parentNode.insertBefore(badge, select);
            }
        }

        /**
         * Adicionar atalhos de teclado
         */
        addKeyboardShortcuts() {
            document.addEventListener('keydown', (event) => {
                // Ctrl/Cmd + Shift + L = Focar seletor de idioma
                if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
                    event.preventDefault();
                    const select = this.getSelectElement();
                    if (select) {
                        select.focus();
                        this.announce('Seletor de idioma focado');
                    }
                }
            });

            this.log('✅ Atalhos de teclado adicionados (Ctrl+Shift+L)');
        }

        /**
         * Sincronizar com mudanças externas
         */
        syncWithExternalChanges() {
            // Escutar mudanças de locale de outras fontes
            window.addEventListener('localechanged', (event) => {
                const newLocale = event.detail.locale;
                if (newLocale !== this.currentLocale) {
                    this.currentLocale = newLocale;
                    this.updateSelectValue(newLocale);
                }
            });

            window.addEventListener('i18nchanged', (event) => {
                const newLocale = event.detail.locale;
                if (newLocale !== this.currentLocale) {
                    this.currentLocale = newLocale;
                    this.updateSelectValue(newLocale);
                }
            });
        }

        /**
         * Obter estado atual
         * @returns {object}
         */
        getState() {
            return {
                currentLocale: this.currentLocale,
                isChanging: this.isChanging,
                availableLanguages: Object.keys(LANGUAGE_DATA),
                languageData: this.getLanguageData(this.currentLocale)
            };
        }

        /**
         * Logging condicional
         * @private
         */
        log(...args) {
            if (CONFIG.debug) {
                console.log('[LanguageSwitcher]', ...args);
            }
        }

        error(...args) {
            console.error('[LanguageSwitcher]', ...args);
        }

        /**
         * Inicializar Language Switcher
         * @param {string} initialLocale
         */
        init(initialLocale = null) {
            this.log('🚀 Inicializando Language Switcher...');

            // Obter idioma inicial
            initialLocale = initialLocale || window.getLocale?.() || 'pt-BR';
            this.currentLocale = initialLocale;

            // Popular select
            this.populateSelect();

            // Definir valor inicial
            this.updateSelectValue(initialLocale);

            // Atualizar VLibras
            this.updateVLibras(initialLocale);

            // Adicionar event listener
            this.attachEventListener();

            // Sincronizar com mudanças externas
            this.syncWithExternalChanges();

            // Adicionar atalhos de teclado
            this.addKeyboardShortcuts();

            this.log('✅ Language Switcher inicializado');
            this.log('📍 Idioma atual:', initialLocale);
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    // Criar instância global
    window.LanguageSwitcher = new LanguageSwitcher();

    // Inicializar quando i18n estiver pronto
    window.addEventListener('i18nready', (event) => {
        window.LanguageSwitcher.init(event.detail.locale);
    });

    // Fallback: inicializar no DOMContentLoaded se i18n não existir
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (!window.LanguageSwitcher.getSelectElement()?.value) {
                    window.LanguageSwitcher.init();
                }
            }, 500);
        });
    }

    // ============================================
    // API GLOBAL
    // ============================================

    /**
     * Mudar idioma programaticamente
     */
    window.changeLanguage = async (locale) => {
        return window.LanguageSwitcher.changeLanguage(locale);
    };

    /**
     * Obter idioma atual
     */
    window.getCurrentLanguage = () => {
        return window.LanguageSwitcher.currentLocale;
    };

    /**
     * Obter estado do switcher
     */
    window.getLanguageSwitcherState = () => {
        return window.LanguageSwitcher.getState();
    };

    /**
     * Obter dados do idioma
     */
    window.getLanguageData = (locale) => {
        return window.LanguageSwitcher.getLanguageData(locale);
    };

    console.log('✅ Language Switcher carregado');
    console.log('📦 API global disponível:', {
        LanguageSwitcher: 'window.LanguageSwitcher',
        changeLanguage: 'window.changeLanguage(locale)',
        getCurrentLanguage: 'window.getCurrentLanguage()',
        getLanguageSwitcherState: 'window.getLanguageSwitcherState()',
        getLanguageData: 'window.getLanguageData(locale)'
    });

    console.log('⌨️ Atalho de teclado: Ctrl+Shift+L para focar seletor de idioma');

})();