/**
 * ============================================
 * THEME MANAGER - Gerenciador de Temas
 * ============================================
 * 
 * Gerencia temas de cores e contraste:
 * - Padrão (light)
 * - Contraste (high contrast)
 * - Escuro (dark mode)
 */

(function () {
    'use strict';

    // ============================================
    // CLASSE THEME MANAGER
    // ============================================

    class ThemeManager {
        constructor() {
            this.currentTheme = 'default';
            this.themes = ['default', 'contrast', 'dark'];
            this.storageKey = 'preferred-theme';

            console.log('🎨 ThemeManager inicializando...');
        }

        /**
         * Inicializar tema
         */
        init() {
            // Carregar tema salvo
            const savedTheme = this.getSavedTheme();
            if (savedTheme) {
                this.applyTheme(savedTheme, false);
            }

            // Detectar preferência do sistema
            this.detectSystemPreference();

            // Configurar botões
            this.setupButtons();

            // Escutar mudanças de preferência do sistema
            this.watchSystemPreference();

            console.log('✅ ThemeManager inicializado');
            console.log('🎨 Tema atual:', this.currentTheme);
        }

        /**
         * Obter tema salvo
         */
        getSavedTheme() {
            try {
                return localStorage.getItem(this.storageKey);
            } catch (error) {
                console.warn('⚠️ Erro ao ler tema salvo:', error);
                return null;
            }
        }

        /**
         * Salvar tema
         */
        saveTheme(theme) {
            try {
                localStorage.setItem(this.storageKey, theme);
                console.log('💾 Tema salvo:', theme);
            } catch (error) {
                console.warn('⚠️ Erro ao salvar tema:', error);
            }
        }

        /**
         * Detectar preferência do sistema
         */
        detectSystemPreference() {
            // Se não há tema salvo, usar preferência do sistema
            if (!this.getSavedTheme()) {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    console.log('🌙 Sistema prefere modo escuro');
                    this.applyTheme('dark', false);
                } else if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
                    console.log('🔲 Sistema prefere alto contraste');
                    this.applyTheme('contrast', false);
                }
            }
        }

        /**
         * Observar mudanças de preferência do sistema
         */
        watchSystemPreference() {
            // Modo escuro
            if (window.matchMedia) {
                const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                darkModeQuery.addEventListener('change', (e) => {
                    if (!this.getSavedTheme()) {
                        console.log('🔄 Preferência do sistema mudou para:', e.matches ? 'dark' : 'light');
                        this.applyTheme(e.matches ? 'dark' : 'default', false);
                    }
                });

                // Alto contraste
                const contrastQuery = window.matchMedia('(prefers-contrast: high)');
                contrastQuery.addEventListener('change', (e) => {
                    if (!this.getSavedTheme()) {
                        console.log('🔄 Preferência de contraste mudou');
                        this.applyTheme(e.matches ? 'contrast' : 'default', false);
                    }
                });
            }
        }

        /**
         * Aplicar tema
         */
        applyTheme(theme, save = true) {
            if (!this.themes.includes(theme)) {
                console.error('❌ Tema inválido:', theme);
                return;
            }

            console.log('🎨 Aplicando tema:', theme);

            // Remover temas anteriores
            document.documentElement.classList.remove('theme-default', 'theme-contrast', 'theme-dark');

            // Adicionar novo tema
            document.documentElement.classList.add(`theme-${theme}`);

            // Atualizar data-attribute para CSS
            document.documentElement.setAttribute('data-theme', theme);

            // Atualizar tema atual
            this.currentTheme = theme;

            // Salvar preferência
            if (save) {
                this.saveTheme(theme);
            }

            // Atualizar botões
            this.updateButtons();

            // Anunciar mudança
            this.announceThemeChange(theme);

            // Disparar evento
            this.dispatchThemeEvent(theme);

            console.log('✅ Tema aplicado:', theme);
        }

        /**
         * Alternar para próximo tema
         */
        nextTheme() {
            const currentIndex = this.themes.indexOf(this.currentTheme);
            const nextIndex = (currentIndex + 1) % this.themes.length;
            const nextTheme = this.themes[nextIndex];

            this.applyTheme(nextTheme);
        }

        /**
         * Configurar botões de tema
         */
        setupButtons() {
            // Botão principal de tema (cicla entre os 3)
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    this.nextTheme();
                });
            }

            // Botões individuais
            const defaultBtn = document.querySelector('[data-theme-button="default"]');
            const contrastBtn = document.querySelector('[data-theme-button="contrast"]');
            const darkBtn = document.querySelector('[data-theme-button="dark"]');

            if (defaultBtn) {
                defaultBtn.addEventListener('click', () => this.applyTheme('default'));
            }

            if (contrastBtn) {
                contrastBtn.addEventListener('click', () => this.applyTheme('contrast'));
            }

            if (darkBtn) {
                darkBtn.addEventListener('click', () => this.applyTheme('dark'));
            }

            console.log('🔘 Botões de tema configurados');
        }

        /**
         * Atualizar estado visual dos botões
         */
        updateButtons() {
            // Atualizar botões individuais
            document.querySelectorAll('[data-theme-button]').forEach(btn => {
                const btnTheme = btn.getAttribute('data-theme-button');
                if (btnTheme === this.currentTheme) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                }
            });

            // Atualizar ícone/texto do botão principal
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                // Atualizar ícone
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.className = this.getThemeIcon(this.currentTheme);
                }

                // Atualizar texto se houver
                const text = themeToggle.querySelector('.theme-text');
                if (text && window.i18n && window.i18n.t) {
                    text.textContent = window.i18n.t(`theme.${this.currentTheme}`);
                }

                // Atualizar aria-label
                if (window.i18n && window.i18n.t) {
                    themeToggle.setAttribute('aria-label',
                        window.i18n.t(`accessibility.theme`) + ': ' +
                        window.i18n.t(`theme.${this.currentTheme}`)
                    );
                }
            }
        }

        /**
         * Obter ícone do tema
         */
        getThemeIcon(theme) {
            const icons = {
                'default': 'bi bi-sun-fill',
                'contrast': 'bi bi-circle-half',
                'dark': 'bi bi-moon-fill'
            };
            return icons[theme] || icons.default;
        }

        /**
         * Anunciar mudança de tema para leitores de tela
         */
        announceThemeChange(theme) {
            const themeName = window.i18n && window.i18n.t
                ? window.i18n.t(`theme.${theme}`)
                : theme;

            const announcement = window.i18n && window.i18n.t
                ? window.i18n.t('announcements.themeChanged', { theme: themeName })
                : `Tema alterado para ${themeName}`;

            let liveRegion = document.getElementById('theme-announcer');
            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = 'theme-announcer';
                liveRegion.setAttribute('role', 'status');
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.className = 'sr-only';
                document.body.appendChild(liveRegion);
            }

            liveRegion.textContent = announcement;

            // Limpar após 1 segundo
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }

        /**
         * Disparar evento customizado
         */
        dispatchThemeEvent(theme) {
            const event = new CustomEvent('themeChanged', {
                detail: {
                    theme: theme,
                    previousTheme: this.currentTheme
                }
            });
            window.dispatchEvent(event);
            document.dispatchEvent(event);
        }

        /**
         * Obter tema atual
         */
        getCurrentTheme() {
            return this.currentTheme;
        }

        /**
         * Verificar se é tema escuro
         */
        isDarkTheme() {
            return this.currentTheme === 'dark';
        }

        /**
         * Verificar se é alto contraste
         */
        isHighContrast() {
            return this.currentTheme === 'contrast';
        }

        /**
         * Resetar para tema padrão
         */
        reset() {
            this.applyTheme('default');
            localStorage.removeItem(this.storageKey);
            console.log('🔄 Tema resetado para padrão');
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    // Criar instância global
    window.ThemeManager = new ThemeManager();

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ThemeManager.init();
        });
    } else {
        window.ThemeManager.init();
    }

    // Sincronizar com mudanças de idioma
    document.addEventListener('languageChanged', () => {
        window.ThemeManager.updateButtons();
    });

    // ============================================
    // API GLOBAL
    // ============================================

    /**
     * Aplicar tema
     */
    window.setTheme = (theme) => {
        window.ThemeManager.applyTheme(theme);
    };

    /**
     * Obter tema atual
     */
    window.getTheme = () => {
        return window.ThemeManager.getCurrentTheme();
    };

    /**
     * Alternar tema
     */
    window.toggleTheme = () => {
        window.ThemeManager.nextTheme();
    };

    console.log('✅ ThemeManager carregado');
    console.log('📦 API global disponível:');
    console.log('   - window.setTheme(theme) // "default", "contrast", "dark"');
    console.log('   - window.getTheme() // obter tema atual');
    console.log('   - window.toggleTheme() // alternar tema');

})();