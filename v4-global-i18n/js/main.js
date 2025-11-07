/**
 * ============================================
 * MAIN.JS - Script Principal V4 i18n
 * ============================================
 * 
 * Orquestra inicialização e coordenação de
 * todos os módulos da versão multilíngue
 * 
 * Dependências (carregadas antes):
 * - locale-detector.js
 * - i18n.js
 * - intl-formatter.js
 * - font-loader.js
 * - rtl-support.js
 * - language-switcher.js
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO GLOBAL
    // ============================================

    const CONFIG = {
        version: '4.0.0',
        versionName: 'Global i18n',
        appName: 'Cabra da Tech',
        debug: true,
        analytics: false,

        // Módulos
        modules: {
            localeDetector: true,
            i18n: true,
            intlFormatter: true,
            fontLoader: true,
            rtlSupport: true,
            languageSwitcher: true
        },

        // Configuração de carregamento
        loading: {
            showSplash: false,
            minLoadTime: 500 // ms mínimo de loading
        }
    };

    // ============================================
    // CLASSE APP PRINCIPAL
    // ============================================

    class CabraDaTechApp {
        constructor() {
            this.version = CONFIG.version;
            this.isInitialized = false;
            this.startTime = Date.now();
            this.modules = {};
            this.loadedModules = new Set();
        }

        /**
         * Verificar disponibilidade de módulos
         */
        checkModules() {
            this.log('🔍 Verificando módulos...');

            const requiredModules = {
                LocaleDetector: window.LocaleDetector,
                i18n: window.i18n,
                IntlFormatter: window.IntlFormatter,
                FontLoader: window.FontLoader,
                RTLSupport: window.RTLSupport,
                LanguageSwitcher: window.LanguageSwitcher
            };

            const missing = [];

            Object.entries(requiredModules).forEach(([name, module]) => {
                if (module) {
                    this.modules[name] = module;
                    this.loadedModules.add(name);
                    this.log(`  ✅ ${name}`);
                } else {
                    missing.push(name);
                    this.warn(`  ❌ ${name} não encontrado`);
                }
            });

            if (missing.length > 0) {
                this.error(`Módulos ausentes: ${missing.join(', ')}`);
                return false;
            }

            this.log(`✅ Todos os ${this.loadedModules.size} módulos disponíveis`);
            return true;
        }

        /**
         * Carregar dados iniciais (notícias)
         */
        async loadData() {
            this.log('📦 Carregando dados...');

            try {
                // Carregar notícias
                const response = await fetch('../data/noticias.json');

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                this.data = data;

                this.log(`✅ ${data.noticias.length} notícias carregadas`);
                return data;

            } catch (error) {
                this.error('Erro ao carregar dados:', error);
                return null;
            }
        }

        /**
         * Renderizar notícias
         */
        renderNoticias() {
            if (!this.data || !this.data.noticias) {
                this.warn('Dados de notícias não disponíveis');
                return;
            }

            const container = document.querySelector('.noticias-grid');
            if (!container) return;

            // Remover loading spinner
            const spinner = container.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }

            // Filtrar notícias em destaque
            const destaque = this.data.noticias.filter(n => n.destaque).slice(0, 3);

            // Renderizar cards
            destaque.forEach(noticia => {
                const card = this.createNoticiaCard(noticia);
                container.appendChild(card);
            });

            this.log(`✅ ${destaque.length} notícias renderizadas`);
        }

        /**
         * Criar card de notícia
         */
        createNoticiaCard(noticia) {
            const card = document.createElement('article');
            card.className = 'noticia-card';
            card.setAttribute('role', 'listitem');

            // Imagem
            const img = document.createElement('img');
            img.src = noticia.imagemDestaque.url;
            img.alt = noticia.imagemDestaque.alt;
            img.className = 'noticia-imagem';
            img.loading = 'lazy';
            img.width = noticia.imagemDestaque.width;
            img.height = noticia.imagemDestaque.height;

            // Conteúdo
            const conteudo = document.createElement('div');
            conteudo.className = 'noticia-conteudo';

            // Categoria
            const categoria = document.createElement('span');
            categoria.className = 'noticia-categoria';
            categoria.textContent = noticia.categoria;

            // Título
            const titulo = document.createElement('h3');
            titulo.className = 'noticia-titulo';
            titulo.textContent = noticia.titulo;

            // Resumo
            const resumo = document.createElement('p');
            resumo.className = 'noticia-resumo';
            resumo.textContent = noticia.resumo;

            // Meta (data e tempo de leitura)
            const meta = document.createElement('div');
            meta.className = 'noticia-meta';

            const data = document.createElement('span');
            data.setAttribute('data-format', 'relative');
            data.setAttribute('data-value', noticia.dataPublicacao);
            data.textContent = window.formatRelativeTime?.(noticia.dataPublicacao) || 'Recente';

            const tempo = document.createElement('span');
            tempo.textContent = `${noticia.tempoLeitura} min`;

            meta.appendChild(data);
            meta.appendChild(tempo);

            // Link
            const link = document.createElement('a');
            link.href = `#noticia-${noticia.id}`;
            link.className = 'noticia-link';
            link.setAttribute('data-i18n', 'news.readMore');
            link.textContent = 'Ler mais';

            const icon = document.createElement('i');
            icon.className = 'bi bi-arrow-right';
            icon.setAttribute('aria-hidden', 'true');
            link.appendChild(icon);

            // Montar estrutura
            conteudo.appendChild(categoria);
            conteudo.appendChild(titulo);
            conteudo.appendChild(resumo);
            conteudo.appendChild(meta);
            conteudo.appendChild(link);

            card.appendChild(img);
            card.appendChild(conteudo);

            return card;
        }

        /**
         * Configurar menu mobile
         */
        setupMobileMenu() {
            const menuToggle = document.querySelector('.menu-toggle');
            const menuList = document.querySelector('.menu-list');

            if (!menuToggle || !menuList) return;

            menuToggle.addEventListener('click', () => {
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

                menuToggle.setAttribute('aria-expanded', !isExpanded);
                menuList.classList.toggle('active');

                this.log(`Menu mobile ${!isExpanded ? 'aberto' : 'fechado'}`);
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (!menuToggle.contains(e.target) && !menuList.contains(e.target)) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuList.classList.remove('active');
                }
            });

            // Fechar ao pressionar ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuList.classList.remove('active');
                }
            });

            this.log('✅ Menu mobile configurado');
        }

        /**
         * Configurar busca
         */
        setupSearch() {
            const searchForm = document.querySelector('form[role="search"]');
            const searchInput = document.getElementById('search');

            if (!searchForm || !searchInput) return;

            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();

                if (query) {
                    this.performSearch(query);
                }
            });

            this.log('✅ Busca configurada');
        }

        /**
         * Realizar busca (placeholder)
         */
        performSearch(query) {
            this.log(`🔍 Buscando por: "${query}"`);

            // Anunciar para leitores de tela
            const liveRegion = document.getElementById('live-region');
            if (liveRegion) {
                liveRegion.textContent = `Buscando por ${query}...`;
            }

            // TODO: Implementar busca real
            setTimeout(() => {
                if (liveRegion) {
                    liveRegion.textContent = `Busca por ${query} concluída.`;
                }
            }, 1000);
        }

        /**
         * Configurar smooth scroll
         */
        setupSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');

                    // Ignorar links vazios ou apenas "#"
                    if (!href || href === '#') return;

                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();

                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });

                        // Focar elemento alvo para acessibilidade
                        target.focus({ preventScroll: true });
                    }
                });
            });

            this.log('✅ Smooth scroll configurado');
        }

        /**
         * Adicionar analytics (se habilitado)
         */
        setupAnalytics() {
            if (!CONFIG.analytics) return;

            // Rastrear mudanças de idioma
            window.addEventListener('languagechanged', (e) => {
                this.log('📊 Analytics: idioma alterado para', e.detail.locale);
                // TODO: Enviar para Google Analytics, etc.
            });

            this.log('✅ Analytics configurado');
        }

        /**
         * Configurar tratamento de erros
         */
        setupErrorHandling() {
            window.addEventListener('error', (e) => {
                this.error('Erro não capturado:', e.error);
            });

            window.addEventListener('unhandledrejection', (e) => {
                this.error('Promise rejeitada:', e.reason);
            });

            this.log('✅ Tratamento de erros configurado');
        }

        /**
         * Exibir informações de debug
         */
        showDebugInfo() {
            if (!CONFIG.debug) return;

            const loadTime = Date.now() - this.startTime;

            console.log('%c════════════════════════════════════════', 'color: #667eea');
            console.log('%c🌍 CABRA DA TECH - V4 GLOBAL i18n', 'color: #667eea; font-size: 16px; font-weight: bold');
            console.log('%c════════════════════════════════════════', 'color: #667eea');
            console.log('');
            console.log('📦 Versão:', CONFIG.version);
            console.log('⏱️ Tempo de carregamento:', `${loadTime}ms`);
            console.log('🌍 Idioma:', window.getLocale?.());
            console.log('↔️ Direção:', document.documentElement.getAttribute('dir'));
            console.log('');
            console.log('📚 Módulos carregados:', Array.from(this.loadedModules));
            console.log('');
            console.log('🔧 API Global disponível:');
            console.log('  - window.CabraDaTech');
            console.log('  - window.getLocale()');
            console.log('  - window.changeLanguage(locale)');
            console.log('  - window.t(key, params)');
            console.log('  - window.formatDate(date)');
            console.log('  - window.formatCurrency(amount)');
            console.log('');
            console.log('⌨️ Atalhos de teclado:');
            console.log('  - Alt+1: Ir para conteúdo');
            console.log('  - Alt+2: Ir para menu');
            console.log('  - Alt+3: Ir para idioma');
            console.log('  - Ctrl+Shift+L: Focar seletor de idioma');
            console.log('');
            console.log('%c════════════════════════════════════════', 'color: #667eea');
        }

        /**
         * Logging
         */
        log(...args) {
            if (CONFIG.debug) {
                console.log('[App]', ...args);
            }
        }

        warn(...args) {
            if (CONFIG.debug) {
                console.warn('[App]', ...args);
            }
        }

        error(...args) {
            console.error('[App]', ...args);
        }

        /**
         * Inicializar aplicação
         */
        async init() {
            this.log('🚀 Inicializando Cabra da Tech V4...');

            try {
                // 1. Verificar módulos
                const modulesOk = this.checkModules();
                if (!modulesOk) {
                    throw new Error('Módulos obrigatórios ausentes');
                }

                // 2. Aguardar i18n estar pronto
                await new Promise((resolve) => {
                    if (window.i18n?.isLoaded?.(window.getLocale?.())) {
                        resolve();
                    } else {
                        window.addEventListener('i18nready', resolve, { once: true });
                    }
                });

                // 3. Carregar dados
                await this.loadData();

                // 4. Renderizar conteúdo
                this.renderNoticias();

                // 5. Configurar funcionalidades
                this.setupMobileMenu();
                this.setupSearch();
                this.setupSmoothScroll();
                this.setupAnalytics();
                this.setupErrorHandling();

                // 6. Marcar como inicializado
                this.isInitialized = true;
                document.body.classList.add('app-ready');

                // 7. Disparar evento
                const event = new CustomEvent('appready', {
                    detail: {
                        version: this.version,
                        loadTime: Date.now() - this.startTime
                    }
                });
                window.dispatchEvent(event);

                // 8. Exibir debug info
                this.showDebugInfo();

                this.log('✅ Aplicação inicializada com sucesso');

            } catch (error) {
                this.error('❌ Erro fatal ao inicializar aplicação:', error);
                document.body.classList.add('app-error');
            }
        }

        /**
         * Obter informações da aplicação
         */
        getInfo() {
            return {
                version: this.version,
                versionName: CONFIG.versionName,
                isInitialized: this.isInitialized,
                loadTime: Date.now() - this.startTime,
                modules: Array.from(this.loadedModules),
                locale: window.getLocale?.(),
                direction: document.documentElement.getAttribute('dir')
            };
        }
    }

    // ============================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ============================================

    // Criar instância global
    window.CabraDaTech = new CabraDaTechApp();

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.CabraDaTech.init();
        });
    } else {
        window.CabraDaTech.init();
    }

    // ============================================
    // API GLOBAL
    // ============================================

    /**
     * Obter informações da aplicação
     */
    window.getAppInfo = () => {
        return window.CabraDaTech.getInfo();
    };

    /**
     * Recarregar aplicação
     */
    window.reloadApp = () => {
        window.location.reload();
    };

    /**
     * Console helper
     */
    window.cabra = {
        version: CONFIG.version,
        info: () => window.CabraDaTech.getInfo(),
        changeLanguage: (locale) => window.changeLanguage(locale),
        getLocale: () => window.getLocale(),
        modules: () => Array.from(window.CabraDaTech.loadedModules),
        help: () => {
            console.log('🌍 Cabra da Tech - Comandos disponíveis:');
            console.log('  cabra.info() - Informações da aplicação');
            console.log('  cabra.changeLanguage(locale) - Mudar idioma');
            console.log('  cabra.getLocale() - Idioma atual');
            console.log('  cabra.modules() - Módulos carregados');
        }
    };

    console.log('✅ Main.js carregado');
    console.log('💡 Digite "cabra.help()" no console para ver comandos disponíveis');

})();