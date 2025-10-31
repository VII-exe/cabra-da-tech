/* ============================================
   JAVASCRIPT - V3 WCAG AAA + eMAG
   Comportamentos avançados de acessibilidade
   ============================================ */

'use strict';

/**
 * Inicialização quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Cabra da Tech V3 - WCAG AAA + eMAG - Inicializando...');

    // Inicializar módulos
    BarraAcessibilidade.init();
    MenuMobile.init();
    SmoothScroll.init();
    TecladoAtalhos.init();
    FonteSizeControl.init();
    Preferencias.carregar();

    // Anunciar versão para leitores de tela
    anunciarParaLeitores('Versão WCAG AAA com máxima acessibilidade carregada', 'polite');

    console.log('✅ V3 Inicializada com sucesso!');
});

/* ============================================
   1. BARRA DE ACESSIBILIDADE
   ============================================ */

const BarraAcessibilidade = {
    controles: {},
    temasDisponiveis: ['default', 'high-contrast', 'dark'],
    temaAtual: 'default',
    espacamentoAtual: 'normal',

    /**
     * Inicializa a barra de acessibilidade
     */
    init() {
        // Controles de tema/contraste
        this.controles.temas = document.querySelectorAll('[data-theme]');

        // Controles de espaçamento
        this.controles.espacamentos = document.querySelectorAll('[data-spacing]');

        // Botão Libras
        this.controles.libras = document.getElementById('toggle-libras');

        // Botão de atalhos
        this.controles.atalhos = document.getElementById('btn-atalhos');

        if (!this.controles.temas.length) {
            console.warn('Controles de tema não encontrados');
            return;
        }

        this.bindEvents();
        this.carregarPreferencias();

        console.log('✓ Barra de acessibilidade inicializada');
    },

    /**
     * Bind de eventos
     */
    bindEvents() {
        // Controles de tema
        this.controles.temas.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tema = e.currentTarget.getAttribute('data-theme');
                this.mudarTema(tema);
            });
        });

        // Controles de espaçamento
        this.controles.espacamentos.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const espacamento = e.currentTarget.getAttribute('data-spacing');
                this.mudarEspacamento(espacamento);
            });
        });

        // Toggle Libras
        if (this.controles.libras) {
            this.controles.libras.addEventListener('click', () => {
                this.toggleLibras();
            });
        }

        // Botão de atalhos
        if (this.controles.atalhos) {
            this.controles.atalhos.addEventListener('click', () => {
                ModalAtalhos.abrir();
            });
        }
    },

    /**
     * Mudar tema/contraste
     */
    mudarTema(tema) {
        if (!this.temasDisponiveis.includes(tema)) {
            console.error('Tema inválido:', tema);
            return;
        }

        // Remover tema anterior
        document.body.classList.remove(
            'tema-default',
            'tema-high-contrast',
            'tema-dark'
        );

        // Adicionar novo tema
        document.body.classList.add(`tema-${tema}`);
        this.temaAtual = tema;

        // Atualizar botões (aria-pressed)
        this.controles.temas.forEach(btn => {
            const btnTema = btn.getAttribute('data-theme');
            const isAtivo = btnTema === tema;

            btn.classList.toggle('active', isAtivo);
            btn.setAttribute('aria-pressed', isAtivo);
        });

        // Salvar preferência
        Preferencias.salvar('tema', tema);

        // Anunciar mudança
        const nomesTemas = {
            'default': 'padrão',
            'high-contrast': 'alto contraste',
            'dark': 'modo escuro'
        };

        anunciarParaLeitores(`Tema alterado para ${nomesTemas[tema]}`, 'polite');

        console.log(`Tema alterado para: ${tema}`);
    },

    /**
     * Mudar espaçamento
     */
    mudarEspacamento(espacamento) {
        // Remover espaçamento anterior
        document.body.classList.remove('espacamento-normal', 'espacamento-large');

        // Adicionar novo espaçamento
        document.body.classList.add(`espacamento-${espacamento}`);
        this.espacamentoAtual = espacamento;

        // Atualizar botões
        this.controles.espacamentos.forEach(btn => {
            const btnEspacamento = btn.getAttribute('data-spacing');
            const isAtivo = btnEspacamento === espacamento;

            btn.classList.toggle('active', isAtivo);
            btn.setAttribute('aria-pressed', isAtivo);
        });

        // Salvar preferência
        Preferencias.salvar('espacamento', espacamento);

        const nomesEspacamentos = {
            'normal': 'normal',
            'large': 'ampliado'
        };

        anunciarParaLeitores(`Espaçamento alterado para ${nomesEspacamentos[espacamento]}`, 'polite');

        console.log(`Espaçamento alterado para: ${espacamento}`);
    },

    /**
     * Toggle Libras (VLibras)
     */
    toggleLibras() {
        const isAtivo = this.controles.libras.getAttribute('aria-pressed') === 'true';
        const novoEstado = !isAtivo;

        this.controles.libras.setAttribute('aria-pressed', novoEstado);
        this.controles.libras.classList.toggle('active', novoEstado);

        // Controlar visibilidade do widget VLibras
        const vlibrasWidget = document.querySelector('[vw]');
        if (vlibrasWidget) {
            if (novoEstado) {
                vlibrasWidget.classList.add('enabled');
                anunciarParaLeitores('Tradução em Libras ativada', 'polite');
            } else {
                vlibrasWidget.classList.remove('enabled');
                anunciarParaLeitores('Tradução em Libras desativada', 'polite');
            }
        }

        // Salvar preferência
        Preferencias.salvar('libras', novoEstado);

        console.log(`Libras ${novoEstado ? 'ativado' : 'desativado'}`);
    },

    /**
     * Carregar preferências salvas
     */
    carregarPreferencias() {
        const tema = Preferencias.obter('tema');
        const espacamento = Preferencias.obter('espacamento');
        const libras = Preferencias.obter('libras');

        if (tema && this.temasDisponiveis.includes(tema)) {
            this.mudarTema(tema);
        }

        if (espacamento) {
            this.mudarEspacamento(espacamento);
        }

        if (libras === true) {
            this.toggleLibras();
        }
    }
};

/* ============================================
   2. CONTROLE DE TAMANHO DE FONTE
   ============================================ */

const FonteSizeControl = {
    tamanhosDisponiveis: [85, 100, 115, 130, 145],
    indiceAtual: 1, // 100% (padrão)

    /**
     * Inicializa controle de fonte
     */
    init() {
        this.btnDiminuir = document.getElementById('diminuir-fonte');
        this.btnNormal = document.getElementById('fonte-normal');
        this.btnAumentar = document.getElementById('aumentar-fonte');

        if (!this.btnDiminuir || !this.btnAumentar) {
            console.warn('Controles de fonte não encontrados');
            return;
        }

        this.bindEvents();
        this.carregarPreferencia();

        console.log('✓ Controle de fonte inicializado');
    },

    /**
     * Bind de eventos
     */
    bindEvents() {
        this.btnDiminuir.addEventListener('click', () => this.diminuir());
        this.btnNormal.addEventListener('click', () => this.resetar());
        this.btnAumentar.addEventListener('click', () => this.aumentar());
    },

    /**
     * Aumentar fonte
     */
    aumentar() {
        if (this.indiceAtual < this.tamanhosDisponiveis.length - 1) {
            this.indiceAtual++;
            this.aplicar();
        } else {
            anunciarParaLeitores('Tamanho máximo de fonte atingido', 'polite');
        }
    },

    /**
     * Diminuir fonte
     */
    diminuir() {
        if (this.indiceAtual > 0) {
            this.indiceAtual--;
            this.aplicar();
        } else {
            anunciarParaLeitores('Tamanho mínimo de fonte atingido', 'polite');
        }
    },

    /**
     * Resetar para tamanho normal
     */
    resetar() {
        this.indiceAtual = 1; // 100%
        this.aplicar();
        anunciarParaLeitores('Tamanho de fonte resetado para o padrão', 'polite');
    },

    /**
     * Aplicar tamanho de fonte
     */
    aplicar() {
        const tamanho = this.tamanhosDisponiveis[this.indiceAtual];
        document.documentElement.style.fontSize = `${tamanho}%`;

        // Atualizar botão ativo
        this.btnDiminuir.classList.toggle('active', this.indiceAtual === 0);
        this.btnNormal.classList.toggle('active', this.indiceAtual === 1);
        this.btnAumentar.classList.toggle('active', this.indiceAtual === this.tamanhosDisponiveis.length - 1);

        // Atualizar aria-pressed
        this.btnNormal.setAttribute('aria-pressed', this.indiceAtual === 1);

        // Salvar preferência
        Preferencias.salvar('fontSize', tamanho);

        anunciarParaLeitores(`Tamanho de fonte alterado para ${tamanho}%`, 'polite');

        console.log(`Fonte: ${tamanho}%`);
    },

    /**
     * Carregar preferência salva
     */
    carregarPreferencia() {
        const tamanhoSalvo = Preferencias.obter('fontSize');

        if (tamanhoSalvo) {
            const indice = this.tamanhosDisponiveis.indexOf(tamanhoSalvo);
            if (indice !== -1) {
                this.indiceAtual = indice;
                this.aplicar();
            }
        }
    }
};

/* ============================================
   3. MENU MOBILE
   ============================================ */

const MenuMobile = {
    menuToggle: null,
    menuList: null,
    isOpen: false,

    /**
     * Inicializa o menu mobile
     */
    init() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.menuList = document.querySelector('.menu-list');

        if (!this.menuToggle || !this.menuList) {
            console.warn('Menu mobile não encontrado');
            return;
        }

        this.bindEvents();
        console.log('✓ Menu mobile inicializado');
    },

    /**
     * Bind de eventos
     */
    bindEvents() {
        // Click no botão toggle
        this.menuToggle.addEventListener('click', () => this.toggle());

        // Fechar ao pressionar ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.fechar();
            }
        });

        // Fechar ao clicar em um link do menu
        const menuLinks = this.menuList.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && this.isOpen) {
                    this.fechar();
                }
            });
        });

        // Ajustar ao redimensionar janela
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.fechar();
            }
        }, 250));
    },

    /**
     * Toggle do menu
     */
    toggle() {
        if (this.isOpen) {
            this.fechar();
        } else {
            this.abrir();
        }
    },

    /**
     * Abrir menu
     */
    abrir() {
        this.isOpen = true;
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.menuToggle.setAttribute('aria-label', 'Fechar menu de navegação');
        this.menuList.setAttribute('aria-expanded', 'true');
        this.menuList.style.display = 'flex';

        // Foco no primeiro link
        const firstLink = this.menuList.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }

        anunciarParaLeitores('Menu de navegação aberto', 'polite');
        console.log('Menu aberto');
    },

    /**
     * Fechar menu
     */
    fechar() {
        this.isOpen = false;
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
        this.menuList.setAttribute('aria-expanded', 'false');
        this.menuList.style.display = '';

        // Retornar foco ao botão
        this.menuToggle.focus();

        anunciarParaLeitores('Menu de navegação fechado', 'polite');
        console.log('Menu fechado');
    }
};

/* ============================================
   4. SMOOTH SCROLL
   ============================================ */

const SmoothScroll = {
    /**
     * Inicializa smooth scroll
     */
    init() {
        // Verificar preferência de movimento reduzido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('✓ Movimento reduzido detectado - smooth scroll desabilitado');
            return;
        }

        // Todos os links internos (âncoras)
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Ignorar # sozinho
                if (href === '#' || href === '#top') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    this.scrollTo(target, link);
                }
            });
        });

        console.log(`✓ Smooth scroll em ${links.length} links`);
    },

    /**
     * Scroll suave até elemento
     */
    scrollTo(target, link) {
        // Offset para headers fixos
        const barraAcessibilidade = document.querySelector('.barra-acessibilidade');
        const header = document.querySelector('.site-header');

        let offset = 20;

        if (barraAcessibilidade) {
            offset += barraAcessibilidade.offsetHeight;
        }

        if (header) {
            offset += header.offsetHeight;
        }

        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Focar no elemento (acessibilidade)
        setTimeout(() => {
            // Tornar focável temporariamente se não for
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus();

            // Anunciar para leitores de tela
            const linkText = link.textContent.trim();
            if (linkText) {
                anunciarParaLeitores(`Navegou para: ${linkText}`, 'polite');
            }
        }, 500);
    }
};

/* ============================================
   5. ATALHOS DE TECLADO (eMAG)
   ============================================ */

const TecladoAtalhos = {
    atalhos: {
        // Navegação
        '1': { acao: () => this.irPara('#main-content'), descricao: 'Ir para conteúdo principal' },
        '2': { acao: () => this.irPara('#main-nav'), descricao: 'Ir para menu de navegação' },
        '3': { acao: () => this.focarBusca(), descricao: 'Ir para busca' },
        '4': { acao: () => this.irPara('#site-footer'), descricao: 'Ir para rodapé' },

        // Acessibilidade
        'h': { acao: () => this.irPara('#home'), descricao: 'Ir para página inicial' },
        't': { acao: () => this.irPara('#tecnologia'), descricao: 'Ver notícias de tecnologia' },
        'e': { acao: () => this.irPara('#educacao'), descricao: 'Ver notícias de educação' },
        'r': { acao: () => this.irPara('#regiao'), descricao: 'Ver notícias da região' },
        's': { acao: () => this.irPara('#sobre'), descricao: 'Sobre o site' },
        'b': { acao: () => this.focarBusca(), descricao: 'Focar campo de busca' }
    },

    /**
     * Inicializa atalhos de teclado
     */
    init() {
        document.addEventListener('keydown', (e) => {
            // Alt + número/letra
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                const key = e.key.toLowerCase();

                if (this.atalhos[key]) {
                    e.preventDefault();
                    this.atalhos[key].acao();
                }
            }

            // Ctrl + +/- para fonte (além dos botões)
            if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    FonteSizeControl.aumentar();
                } else if (e.key === '-') {
                    e.preventDefault();
                    FonteSizeControl.diminuir();
                } else if (e.key === '0') {
                    e.preventDefault();
                    FonteSizeControl.resetar();
                }
            }
        });

        console.log('✓ Atalhos de teclado inicializados');
    },

    /**
     * Ir para elemento
     */
    irPara(seletor) {
        const elemento = document.querySelector(seletor);

        if (elemento) {
            // Tornar focável
            if (!elemento.hasAttribute('tabindex')) {
                elemento.setAttribute('tabindex', '-1');
            }

            elemento.focus();
            elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });

            anunciarParaLeitores(`Navegou para: ${seletor}`, 'polite');
        }
    },

    /**
     * Focar campo de busca
     */
    focarBusca() {
        const searchInput = document.getElementById('search');

        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            anunciarParaLeitores('Campo de busca focado', 'polite');
        }
    }
};

/* ============================================
   6. MODAL DE ATALHOS
   ============================================ */

const ModalAtalhos = {
    modal: null,
    overlay: null,

    /**
     * Abrir modal de atalhos
     */
    abrir() {
        if (!this.modal) {
            this.criar();
        }

        this.modal.style.display = 'block';
        this.overlay.style.display = 'block';

        // Focar no modal
        setTimeout(() => {
            this.modal.focus();
        }, 100);

        // Anunciar
        anunciarParaLeitores('Modal de atalhos de teclado aberto. Pressione ESC para fechar.', 'assertive');

        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    },

    /**
     * Fechar modal
     */
    fechar() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.overlay.style.display = 'none';

            // Retornar foco ao botão
            const btnAtalhos = document.getElementById('btn-atalhos');
            if (btnAtalhos) {
                btnAtalhos.focus();
            }

            // Permitir scroll do body
            document.body.style.overflow = '';

            anunciarParaLeitores('Modal de atalhos fechado', 'polite');
        }
    },

    /**
     * Criar modal
     */
    criar() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            display: none;
        `;

        // Modal
        this.modal = document.createElement('div');
        this.modal.className = 'modal-atalhos';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-labelledby', 'modal-titulo');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('tabindex', '-1');
        this.modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 9999;
            display: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        `;

        // Conteúdo do modal
        this.modal.innerHTML = `
            <div class="modal-header">
                <h2 id="modal-titulo" style="margin: 0 0 1rem 0; color: #228B22; font-size: 1.5rem;">
                    <i class="bi bi-keyboard" aria-hidden="true"></i>
                    Atalhos de Teclado
                </h2>
                <button type="button" 
                        class="modal-close" 
                        aria-label="Fechar modal de atalhos"
                        style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 2rem; cursor: pointer; color: #666;">
                    <i class="bi bi-x" aria-hidden="true"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1.5rem; color: #666;">
                    Use os atalhos abaixo para navegar rapidamente pelo site:
                </p>
                
                <h3 style="font-size: 1.2rem; margin: 1.5rem 0 1rem; color: #333;">Navegação</h3>
                <dl style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Conteúdo principal</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + 1</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Menu de navegação</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + 2</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Campo de busca</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + 3</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Rodapé</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + 4</kbd></dd>
                    </div>
                </dl>
                
                <h3 style="font-size: 1.2rem; margin: 1.5rem 0 1rem; color: #333;">Tamanho da Fonte</h3>
                <dl style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Aumentar fonte</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Ctrl + +</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Diminuir fonte</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Ctrl + -</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Fonte normal</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Ctrl + 0</kbd></dd>
                    </div>
                </dl>
                
                <h3 style="font-size: 1.2rem; margin: 1.5rem 0 1rem; color: #333;">Seções do Site</h3>
                <dl style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Página inicial</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + H</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Tecnologia</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + T</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Educação</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + E</kbd></dd>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <dt style="font-weight: 600;">Região</dt>
                        <dd style="margin: 0;"><kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #ddd;">Alt + R</kbd></dd>
                    </div>
                </dl>
                
                <p style="margin-top: 1.5rem; padding: 1rem; background: #e8f5e9; border-radius: 4px; color: #1b5e20; font-size: 0.9rem;">
                    <i class="bi bi-info-circle" aria-hidden="true"></i>
                    <strong>Dica:</strong> Pressione <kbd style="background: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid #2e7d32;">ESC</kbd> para fechar este modal.
                </p>
            </div>
        `;

        // Adicionar ao DOM
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.modal);

        // Event listeners
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.fechar());
        this.overlay.addEventListener('click', () => this.fechar());

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.fechar();
            }
        });

        console.log('✓ Modal de atalhos criado');
    }
};

/* ============================================
   7. PREFERÊNCIAS DO USUÁRIO
   ============================================ */

const Preferencias = {
    chave: 'cabra-tech-v3-preferencias',

    /**
     * Salvar preferência
     */
    salvar(nome, valor) {
        try {
            const prefs = this.obterTodas();
            prefs[nome] = valor;
            localStorage.setItem(this.chave, JSON.stringify(prefs));
            console.log(`Preferência salva: ${nome} = ${valor}`);
        } catch (error) {
            console.error('Erro ao salvar preferência:', error);
        }
    },

    /**
     * Obter preferência específica
     */
    obter(nome) {
        try {
            const prefs = this.obterTodas();
            return prefs[nome];
        } catch (error) {
            console.error('Erro ao obter preferência:', error);
            return null;
        }
    },

    /**
     * Obter todas as preferências
     */
    obterTodas() {
        try {
            const prefs = localStorage.getItem(this.chave);
            return prefs ? JSON.parse(prefs) : {};
        } catch (error) {
            console.error('Erro ao obter preferências:', error);
            return {};
        }
    },

    /**
     * Carregar preferências na inicialização
     */
    carregar() {
        console.log('✓ Preferências carregadas');
    },

    /**
     * Limpar todas as preferências
     */
    limpar() {
        try {
            localStorage.removeItem(this.chave);
            console.log('Preferências limpas');
            anunciarParaLeitores('Todas as preferências foram resetadas', 'polite');
        } catch (error) {
            console.error('Erro ao limpar preferências:', error);
        }
    }
};

/* ============================================
   8. UTILITÁRIOS
   ============================================ */

/**
 * Debounce - Limita execução de funções
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Anunciar para leitores de tela
 * @param {string} mensagem - Mensagem a ser anunciada
 * @param {string} prioridade - 'polite' (padrão) ou 'assertive'
 */
function anunciarParaLeitores(mensagem, prioridade = 'polite') {
    const anunciador = document.createElement('div');
    anunciador.setAttribute('role', 'status');
    anunciador.setAttribute('aria-live', prioridade);
    anunciador.className = 'sr-only';
    anunciador.textContent = mensagem;

    document.body.appendChild(anunciador);

    // Remover após 1 segundo
    setTimeout(() => {
        document.body.removeChild(anunciador);
    }, 1000);

    console.log(`📢 Anúncio (${prioridade}): ${mensagem}`);
}

/**
 * Detectar preferência de movimento reduzido
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ============================================
   9. TRATAMENTO DE ERROS GLOBAL
   ============================================ */

window.addEventListener('error', (e) => {
    console.error('Erro capturado:', e.error);

    // Em produção, enviar para serviço de monitoramento
    // Ex: Sentry, LogRocket, etc.
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada:', e.reason);
});

/* ============================================
   10. ANALYTICS E TRACKING (Opcional)
   ============================================ */

/**
 * Rastrear eventos de acessibilidade
 */
function trackAcessibilidade(categoria, acao, label) {
    console.log(`📊 A11y Event: ${categoria} - ${acao} - ${label}`);

    // Em produção, integrar com Google Analytics, Matomo, etc.
    // Exemplo:
    // if (window.gtag) {
    //     gtag('event', acao, {
    //         'event_category': categoria,
    //         'event_label': label
    //     });
    // }
}

// Rastrear uso de recursos de acessibilidade
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-theme]')) {
        const tema = e.target.closest('[data-theme]').getAttribute('data-theme');
        trackAcessibilidade('Acessibilidade', 'Mudança de Tema', tema);
    }

    if (e.target.closest('#toggle-libras')) {
        trackAcessibilidade('Acessibilidade', 'Toggle Libras', 'ativado/desativado');
    }
});

/* ============================================
   FIM DO JAVASCRIPT V3
   ============================================ */

console.log('📄 wcag-aaa-emag.js carregado completamente');