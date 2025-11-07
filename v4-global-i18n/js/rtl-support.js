/**
 * ============================================
 * RTL SUPPORT - Suporte Right-to-Left
 * ============================================
 * 
 * Gerencia mudança dinâmica de direção de layout
 * para idiomas RTL (Right-to-Left) como árabe
 * 
 * Funcionalidades:
 * - Detecção automática de idiomas RTL
 * - Troca dinâmica LTR ↔ RTL
 * - Ajuste de margens, paddings e posicionamento
 * - Inversão de ícones e setas
 * - Suporte a transições suaves
 * - Preservação de comportamento de elementos específicos
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO
    // ============================================

    const CONFIG = {
        // Idiomas RTL
        rtlLocales: ['ar', 'he', 'fa', 'ur'],

        // Propriedades CSS que devem ser invertidas
        invertProperties: [
            'margin-left',
            'margin-right',
            'padding-left',
            'padding-right',
            'left',
            'right',
            'border-left',
            'border-right',
            'border-left-width',
            'border-right-width',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'text-align'
        ],

        // Elementos que NÃO devem ser afetados por RTL
        excludeSelectors: [
            '.no-rtl',
            '.ltr-only',
            '[dir="ltr"]',
            'code',
            'pre',
            '.code-block'
        ],

        // Transição suave ao mudar direção
        transitionDuration: 300, // ms

        debug: true
    };

    // ============================================
    // CLASSE RTL SUPPORT
    // ============================================

    class RTLSupport {
        constructor() {
            this.currentDirection = 'ltr';
            this.isRTL = false;
            this.observer = null;
            this.excludedElements = new Set();
        }

        /**
         * Verificar se idioma é RTL
         * @param {string} locale - Código do idioma
         * @returns {boolean}
         */
        isRTLLocale(locale) {
            return CONFIG.rtlLocales.includes(locale);
        }

        /**
         * Obter direção do idioma
         * @param {string} locale
         * @returns {string} 'ltr' ou 'rtl'
         */
        getDirection(locale) {
            return this.isRTLLocale(locale) ? 'rtl' : 'ltr';
        }

        /**
         * Aplicar direção ao documento
         * @param {string} direction - 'ltr' ou 'rtl'
         */
        setDirection(direction) {
            if (this.currentDirection === direction) {
                this.log(`ℹ️ Direção já está definida como: ${direction}`);
                return;
            }

            this.log(`🔄 Mudando direção: ${this.currentDirection} → ${direction}`);

            const html = document.documentElement;
            const body = document.body;

            // Adicionar classe de transição
            if (CONFIG.transitionDuration > 0) {
                html.classList.add('rtl-transitioning');
            }

            // Atualizar atributo dir
            html.setAttribute('dir', direction);

            // Atualizar classes
            html.classList.remove('ltr', 'rtl');
            html.classList.add(direction);

            // Atualizar estado
            this.currentDirection = direction;
            this.isRTL = (direction === 'rtl');

            // Ajustar elementos específicos
            this.adjustElements();

            // Ajustar scrollbar
            this.adjustScrollbar();

            // Remover classe de transição após animação
            if (CONFIG.transitionDuration > 0) {
                setTimeout(() => {
                    html.classList.remove('rtl-transitioning');
                }, CONFIG.transitionDuration);
            }

            // Disparar evento
            const event = new CustomEvent('directionchanged', {
                detail: {
                    direction: direction,
                    isRTL: this.isRTL
                }
            });
            window.dispatchEvent(event);

            this.log(`✅ Direção alterada para: ${direction}`);
        }

        /**
         * Ajustar elementos específicos para RTL
         */
        adjustElements() {
            // Ajustar ícones e setas
            this.adjustIcons();

            // Ajustar tooltips
            this.adjustTooltips();

            // Ajustar dropdowns
            this.adjustDropdowns();

            // Ajustar modals
            this.adjustModals();

            // Ajustar breadcrumbs
            this.adjustBreadcrumbs();
        }

        /**
         * Ajustar ícones direcionais (setas)
         */
        adjustIcons() {
            // Ícones que devem ser invertidos em RTL
            const directionalIcons = document.querySelectorAll(`
        .bi-arrow-left,
        .bi-arrow-right,
        .bi-chevron-left,
        .bi-chevron-right,
        .bi-caret-left,
        .bi-caret-right
      `);

            directionalIcons.forEach(icon => {
                if (this.isExcluded(icon)) return;

                if (this.isRTL) {
                    // Inverter ícones em RTL
                    if (icon.classList.contains('bi-arrow-left')) {
                        icon.classList.replace('bi-arrow-left', 'bi-arrow-right');
                        icon.setAttribute('data-rtl-inverted', 'true');
                    } else if (icon.classList.contains('bi-arrow-right')) {
                        icon.classList.replace('bi-arrow-right', 'bi-arrow-left');
                        icon.setAttribute('data-rtl-inverted', 'true');
                    }

                    if (icon.classList.contains('bi-chevron-left')) {
                        icon.classList.replace('bi-chevron-left', 'bi-chevron-right');
                        icon.setAttribute('data-rtl-inverted', 'true');
                    } else if (icon.classList.contains('bi-chevron-right')) {
                        icon.classList.replace('bi-chevron-right', 'bi-chevron-left');
                        icon.setAttribute('data-rtl-inverted', 'true');
                    }
                } else {
                    // Restaurar ícones em LTR
                    if (icon.getAttribute('data-rtl-inverted') === 'true') {
                        if (icon.classList.contains('bi-arrow-left')) {
                            icon.classList.replace('bi-arrow-left', 'bi-arrow-right');
                        } else if (icon.classList.contains('bi-arrow-right')) {
                            icon.classList.replace('bi-arrow-right', 'bi-arrow-left');
                        }

                        if (icon.classList.contains('bi-chevron-left')) {
                            icon.classList.replace('bi-chevron-left', 'bi-chevron-right');
                        } else if (icon.classList.contains('bi-chevron-right')) {
                            icon.classList.replace('bi-chevron-right', 'bi-chevron-left');
                        }

                        icon.removeAttribute('data-rtl-inverted');
                    }
                }
            });

            this.log(`✅ ${directionalIcons.length} ícones ajustados`);
        }

        /**
         * Ajustar tooltips
         */
        adjustTooltips() {
            const tooltips = document.querySelectorAll('[data-tooltip-position]');

            tooltips.forEach(tooltip => {
                if (this.isExcluded(tooltip)) return;

                const position = tooltip.getAttribute('data-tooltip-position');

                if (this.isRTL) {
                    // Inverter posição left ↔ right
                    if (position === 'left') {
                        tooltip.setAttribute('data-tooltip-position', 'right');
                        tooltip.setAttribute('data-tooltip-original', 'left');
                    } else if (position === 'right') {
                        tooltip.setAttribute('data-tooltip-position', 'left');
                        tooltip.setAttribute('data-tooltip-original', 'right');
                    }
                } else {
                    // Restaurar posição original
                    const original = tooltip.getAttribute('data-tooltip-original');
                    if (original) {
                        tooltip.setAttribute('data-tooltip-position', original);
                        tooltip.removeAttribute('data-tooltip-original');
                    }
                }
            });
        }

        /**
         * Ajustar dropdowns
         */
        adjustDropdowns() {
            const dropdowns = document.querySelectorAll('.dropdown-menu');

            dropdowns.forEach(dropdown => {
                if (this.isExcluded(dropdown)) return;

                if (this.isRTL) {
                    // Ajustar alinhamento
                    if (dropdown.classList.contains('dropdown-menu-right')) {
                        dropdown.classList.replace('dropdown-menu-right', 'dropdown-menu-left');
                        dropdown.setAttribute('data-rtl-swapped', 'true');
                    }
                } else {
                    // Restaurar alinhamento
                    if (dropdown.getAttribute('data-rtl-swapped') === 'true') {
                        dropdown.classList.replace('dropdown-menu-left', 'dropdown-menu-right');
                        dropdown.removeAttribute('data-rtl-swapped');
                    }
                }
            });
        }

        /**
         * Ajustar modals
         */
        adjustModals() {
            const modals = document.querySelectorAll('.modal');

            modals.forEach(modal => {
                if (this.isExcluded(modal)) return;

                // Garantir que texto dentro de modals seja RTL
                if (this.isRTL) {
                    modal.setAttribute('dir', 'rtl');
                } else {
                    modal.setAttribute('dir', 'ltr');
                }
            });
        }

        /**
         * Ajustar breadcrumbs (separadores)
         */
        adjustBreadcrumbs() {
            const breadcrumbs = document.querySelectorAll('.breadcrumb');

            breadcrumbs.forEach(breadcrumb => {
                if (this.isExcluded(breadcrumb)) return;

                const separators = breadcrumb.querySelectorAll('.breadcrumb-separator');

                separators.forEach(separator => {
                    if (this.isRTL) {
                        // Inverter separador: / → \
                        if (separator.textContent === '/') {
                            separator.textContent = '\\';
                            separator.setAttribute('data-rtl-inverted', 'true');
                        } else if (separator.textContent === '>') {
                            separator.textContent = '<';
                            separator.setAttribute('data-rtl-inverted', 'true');
                        }
                    } else {
                        // Restaurar separador
                        if (separator.getAttribute('data-rtl-inverted') === 'true') {
                            if (separator.textContent === '\\') {
                                separator.textContent = '/';
                            } else if (separator.textContent === '<') {
                                separator.textContent = '>';
                            }
                            separator.removeAttribute('data-rtl-inverted');
                        }
                    }
                });
            });
        }

        /**
         * Ajustar posição da scrollbar
         */
        adjustScrollbar() {
            // Alguns navegadores movem scrollbar automaticamente
            // Este método garante consistência

            if (this.isRTL) {
                document.body.classList.add('rtl-scrollbar');
            } else {
                document.body.classList.remove('rtl-scrollbar');
            }
        }

        /**
         * Verificar se elemento deve ser excluído de RTL
         * @param {HTMLElement} element
         * @returns {boolean}
         */
        isExcluded(element) {
            // Verificar cache
            if (this.excludedElements.has(element)) {
                return true;
            }

            // Verificar seletores de exclusão
            for (const selector of CONFIG.excludeSelectors) {
                if (element.matches(selector) || element.closest(selector)) {
                    this.excludedElements.add(element);
                    return true;
                }
            }

            return false;
        }

        /**
         * Adicionar estilos CSS para suporte RTL
         */
        injectStyles() {
            const styleId = 'rtl-support-styles';

            // Verificar se já existe
            if (document.getElementById(styleId)) {
                return;
            }

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        /* Transição suave ao mudar direção */
        .rtl-transitioning * {
          transition: margin ${CONFIG.transitionDuration}ms ease,
                      padding ${CONFIG.transitionDuration}ms ease,
                      left ${CONFIG.transitionDuration}ms ease,
                      right ${CONFIG.transitionDuration}ms ease,
                      transform ${CONFIG.transitionDuration}ms ease !important;
        }

        /* Elementos que não devem ter transição */
        .rtl-transitioning .no-transition,
        .rtl-transitioning [data-no-rtl-transition] {
          transition: none !important;
        }

        /* Fix para imagens e mídia */
        html[dir="rtl"] img,
        html[dir="rtl"] video,
        html[dir="rtl"] canvas {
          /* Não inverter imagens */
        }

        /* Fix para inputs */
        html[dir="rtl"] input[type="tel"],
        html[dir="rtl"] input[type="email"],
        html[dir="rtl"] input[type="url"] {
          direction: ltr;
          text-align: left;
        }

        /* Fix para código */
        html[dir="rtl"] code,
        html[dir="rtl"] pre,
        html[dir="rtl"] .code-block {
          direction: ltr;
          text-align: left;
          unicode-bidi: embed;
        }

        /* Scrollbar RTL */
        html[dir="rtl"].rtl-scrollbar {
          /* Alguns navegadores precisam de ajustes específicos */
        }

        /* Elementos explicitamente LTR */
        .ltr-only,
        [dir="ltr"] {
          direction: ltr !important;
          text-align: left !important;
        }

        /* Elementos explicitamente RTL */
        .rtl-only,
        [dir="rtl"] {
          direction: rtl !important;
          text-align: right !important;
        }
      `;

            document.head.appendChild(style);
            this.log('✅ Estilos RTL injetados');
        }

        /**
         * Observar mudanças no DOM
         */
        startObserver() {
            // Desconectar observador anterior se existir
            if (this.observer) {
                this.observer.disconnect();
            }

            // Criar novo observador
            this.observer = new MutationObserver((mutations) => {
                let needsUpdate = false;

                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        needsUpdate = true;
                    }
                });

                if (needsUpdate && this.isRTL) {
                    // Aguardar renderização
                    requestAnimationFrame(() => {
                        this.adjustElements();
                    });
                }
            });

            // Observar mudanças no body
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            this.log('✅ Observador DOM iniciado');
        }

        /**
         * Parar observador
         */
        stopObserver() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
                this.log('⏸️ Observador DOM parado');
            }
        }

        /**
         * Obter estado atual
         * @returns {object}
         */
        getState() {
            return {
                direction: this.currentDirection,
                isRTL: this.isRTL,
                locale: window.getLocale?.(),
                observerActive: this.observer !== null
            };
        }

        /**
         * Logging condicional
         * @private
         */
        log(...args) {
            if (CONFIG.debug) {
                console.log('[RTL]', ...args);
            }
        }

        /**
         * Inicializar RTL Support
         * @param {string} locale - Idioma inicial
         */
        init(locale = null) {
            this.log('🚀 Inicializando RTL Support...');

            // Injetar estilos
            this.injectStyles();

            // Definir direção inicial
            locale = locale || window.getLocale?.() || 'pt-BR';
            const direction = this.getDirection(locale);
            this.setDirection(direction);

            // Iniciar observador
            this.startObserver();

            this.log('✅ RTL Support inicializado');
            this.log('📍 Direção atual:', direction);
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    // Criar instância global
    window.RTLSupport = new RTLSupport();

    // Sincronizar com mudanças de idioma
    window.addEventListener('localedetected', (event) => {
        const locale = event.detail.locale;
        const direction = window.RTLSupport.getDirection(locale);
        window.RTLSupport.setDirection(direction);
    });

    window.addEventListener('i18nchanged', (event) => {
        const locale = event.detail.locale;
        const direction = window.RTLSupport.getDirection(locale);
        window.RTLSupport.setDirection(direction);
    });

    // Inicializar quando i18n estiver pronto
    window.addEventListener('i18nready', (event) => {
        window.RTLSupport.init(event.detail.locale);
    });

    // ============================================
    // API GLOBAL
    // ============================================

    /**
     * Verificar se idioma é RTL
     */
    window.isRTL = (locale) => {
        locale = locale || window.getLocale?.();
        return window.RTLSupport.isRTLLocale(locale);
    };

    /**
     * Obter direção
     */
    window.getDirection = (locale) => {
        locale = locale || window.getLocale?.();
        return window.RTLSupport.getDirection(locale);
    };

    /**
     * Definir direção manualmente
     */
    window.setDirection = (direction) => {
        window.RTLSupport.setDirection(direction);
    };

    /**
     * Obter estado RTL
     */
    window.getRTLState = () => {
        return window.RTLSupport.getState();
    };

    console.log('✅ RTL Support carregado');
    console.log('📦 API global disponível:', {
        RTLSupport: 'window.RTLSupport',
        isRTL: 'window.isRTL(locale)',
        getDirection: 'window.getDirection(locale)',
        setDirection: 'window.setDirection(direction)',
        getRTLState: 'window.getRTLState()'
    });

})();