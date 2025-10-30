/* ============================================
    JAVASCRIPT - V2 WCAG AA
    Comportamentos interativos acessíveis
   ============================================ */

/**
 * Inicialização quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐐 Cabra da Tech V2 - Inicializando...');

    // Inicializar módulos
    MenuMobile.init();
    FormularioComentario.init();
    SmoothScroll.init();
    LoadNoticias.init();

    console.log('✅ V2 Inicializada com sucesso!');
});

/* ============================================
    1. MENU MOBILE (Toggle)
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
                this.close();
            }
        });

        // Fechar ao clicar em um link do menu
        const menuLinks = this.menuList.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.close();
                }
            });
        });

        // Ajustar ao redimensionar janela
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    },

    /**
     * Toggle do menu
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Abrir menu
     */
    open() {
        this.isOpen = true;
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.menuList.setAttribute('aria-expanded', 'true');
        this.menuList.style.display = 'flex';

        // Foco no primeiro link
        const firstLink = this.menuList.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }

        console.log('Menu aberto');
    },

    /**
     * Fechar menu
     */
    close() {
        this.isOpen = false;
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.menuList.setAttribute('aria-expanded', 'false');
        this.menuList.style.display = '';

        // Retornar foco ao botão
        this.menuToggle.focus();

        console.log('Menu fechado');
    }
};

/* ============================================
    2. FORMULÁRIO DE COMENTÁRIO
   ============================================ */

const FormularioComentario = {
    form: null,
    campos: {},
    mensagemElement: null,

    /**
     * Inicializa o formulário
     */
    init() {
        this.form = document.getElementById('form-comentario');

        if (!this.form) {
            console.warn('Formulário de comentário não encontrado');
            return;
        }

        // Armazenar referências dos campos
        this.campos = {
            nome: document.getElementById('nome'),
            email: document.getElementById('email'),
            comentario: document.getElementById('comentario')
        };

        this.mensagemElement = document.getElementById('form-message');

        this.bindEvents();
        console.log('✓ Formulário de comentário inicializado');
    },

    /**
     * Bind de eventos
     */
    bindEvents() {
        // Submit do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Validação em tempo real
        Object.values(this.campos).forEach(campo => {
            if (campo) {
                // Remover erro ao começar a digitar
                campo.addEventListener('input', () => {
                    this.limparErro(campo);
                });

                // Validar ao sair do campo
                campo.addEventListener('blur', () => {
                    this.validarCampo(campo);
                });
            }
        });
    },

    /**
     * Handle do submit
     */
    handleSubmit() {
        console.log('Submetendo formulário...');

        // Validar todos os campos
        let valido = true;

        Object.values(this.campos).forEach(campo => {
            if (campo && !this.validarCampo(campo)) {
                valido = false;
            }
        });

        if (!valido) {
            this.mostrarMensagem('Por favor, corrija os erros antes de enviar.', 'error');
            return;
        }

        // Simular envio (em produção, faria uma requisição AJAX)
        this.simularEnvio();
    },

    /**
     * Validar campo individual
     */
    validarCampo(campo) {
        const valor = campo.value.trim();
        const errorElement = document.getElementById(`${campo.id}-error`);

        // Campo vazio
        if (campo.hasAttribute('required') && !valor) {
            this.mostrarErro(campo, errorElement, 'Este campo é obrigatório.');
            return false;
        }

        // Validação de email
        if (campo.type === 'email' && valor) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(valor)) {
                this.mostrarErro(campo, errorElement, 'Por favor, insira um e-mail válido.');
                return false;
            }
        }

        // Validação de comprimento máximo
        if (campo.hasAttribute('maxlength')) {
            const maxLength = parseInt(campo.getAttribute('maxlength'));
            if (valor.length > maxLength) {
                this.mostrarErro(campo, errorElement, `Máximo de ${maxLength} caracteres.`);
                return false;
            }
        }

        // Campo válido
        this.limparErro(campo);
        return true;
    },

    /**
     * Mostrar erro no campo
     */
    mostrarErro(campo, errorElement, mensagem) {
        campo.setAttribute('aria-invalid', 'true');
        campo.classList.add('error');

        if (errorElement) {
            errorElement.textContent = mensagem;
            campo.setAttribute('aria-describedby', errorElement.id);
        }
    },

    /**
     * Limpar erro do campo
     */
    limparErro(campo) {
        campo.removeAttribute('aria-invalid');
        campo.classList.remove('error');

        const errorElement = document.getElementById(`${campo.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    },

    /**
     * Simular envio do formulário
     */
    simularEnvio() {
        // Desabilitar botão
        const submitButton = this.form.querySelector('button[type="submit"]');
        const textoOriginal = submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split" aria-hidden="true"></i> Enviando...';

        // Simular delay de rede
        setTimeout(() => {
            // 90% de sucesso, 10% de erro (simulação)
            const sucesso = Math.random() > 0.1;

            if (sucesso) {
                this.mostrarMensagem(
                    'Arretado! Seu comentário foi enviado com sucesso.',
                    'success'
                );
                this.limparFormulario();
            } else {
                this.mostrarMensagem(
                    'Eita! Algo deu errado. Tente novamente.',
                    'error'
                );
            }

            // Reabilitar botão
            submitButton.disabled = false;
            submitButton.innerHTML = textoOriginal;

        }, 1500);
    },

    /**
     * Mostrar mensagem de feedback
     */
    mostrarMensagem(texto, tipo) {
        if (!this.mensagemElement) return;

        this.mensagemElement.textContent = texto;
        this.mensagemElement.setAttribute('data-type', tipo);
        this.mensagemElement.hidden = false;

        // Anunciar para leitores de tela
        this.mensagemElement.setAttribute('role', 'status');
        this.mensagemElement.setAttribute('aria-live', 'polite');

        // Focar na mensagem (acessibilidade)
        this.mensagemElement.focus();

        // Scroll suave até a mensagem
        this.mensagemElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });

        // Esconder após 5 segundos se for sucesso
        if (tipo === 'success') {
            setTimeout(() => {
                this.mensagemElement.hidden = true;
            }, 5000);
        }
    },

    /**
     * Limpar formulário
     */
    limparFormulario() {
        this.form.reset();

        // Limpar erros
        Object.values(this.campos).forEach(campo => {
            if (campo) {
                this.limparErro(campo);
            }
        });
    }
};

/* ============================================
    3. SMOOTH SCROLL (Rolagem Suave)
   ============================================ */

const SmoothScroll = {
    /**
     * Inicializa smooth scroll
     */
    init() {
        // Todos os links internos (âncoras)
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Ignorar # sozinho
                if (href === '#') return;

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
        // Offset para header fixo
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

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
            if (link.textContent) {
                console.log(`Navegou para: ${link.textContent}`);
            }
        }, 500);
    }
};

/* ============================================
    4. CARREGAR NOTÍCIAS (do JSON)
   ============================================ */

const LoadNoticias = {
    dataFile: '../data/noticias.json',
    container: null,

    /**
     * Inicializa carregamento de notícias
     */
    init() {
        this.container = document.querySelector('.noticias-grid');

        // Se as notícias já estão no HTML (hard-coded), não carregar
        if (!this.container || this.container.children.length > 0) {
            console.log('✓ Notícias já presentes no HTML');
            return;
        }

        this.carregarNoticias();
    },

    /**
     * Carregar notícias do JSON
     */
    async carregarNoticias() {
        try {
            console.log('Carregando notícias do JSON...');

            const response = await fetch(this.dataFile);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Filtrar apenas notícias em destaque
            const noticiasDestaque = data.noticias.filter(n => n.destaque);

            // Renderizar notícias
            noticiasDestaque.forEach(noticia => {
                this.renderNoticia(noticia);
            });

            console.log(`✓ ${noticiasDestaque.length} notícias carregadas`);

        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            this.mostrarErro();
        }
    },

    /**
     * Renderizar uma notícia
     */
    renderNoticia(noticia) {
        const article = document.createElement('article');
        article.className = 'noticia-card';
        article.setAttribute('role', 'listitem');

        article.innerHTML = `
            <a href="${noticia.link}" class="card-link">
                <figure class="card-figure">
                    <img src="${noticia.imagem}" 
                        alt="${noticia.imagemAlt}"
                        loading="lazy">
                    <span class="category-badge">${noticia.categoria}</span>
                </figure>

                <div class="card-content">
                    <h3 class="card-title">${noticia.titulo}</h3>
                    <p class="card-description">${noticia.resumo}</p>
                    <div class="card-meta">
                        <time datetime="${noticia.data}">${noticia.dataFormatada}</time>
                        <address>Por ${noticia.autor}</address>
                    </div>
                </div>
            </a>
        `;

        this.container.appendChild(article);
    },

    /**
     * Mostrar mensagem de erro
     */
    mostrarErro() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: var(--espaco-2xl);
                background-color: var(--cor-fundo-secundario);
                border-radius: var(--raio-lg);
            ">
                <i class="bi bi-exclamation-triangle" 
                style="font-size: var(--fonte-4xl); color: var(--cor-erro);"
                aria-hidden="true"></i>
                <p style="margin-top: var(--espaco-md); font-weight: 600;">
                    Eita! Não foi possível carregar as notícias.
                </p>
                <p style="color: var(--cor-texto-secundario); margin-top: var(--espaco-sm);">
                    Tente recarregar a página.
                </p>
            </div>
        `;
    }
};

/* ============================================
    5. UTILITÁRIOS
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
 * Detectar preferência de movimento reduzido
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Anunciar para leitores de tela
 */
function anunciar(mensagem, prioridade = 'polite') {
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
}

/* ============================================
    6. TRATAMENTO DE ERROS GLOBAL
   ============================================ */

window.addEventListener('error', (e) => {
    console.error('Erro capturado:', e.error);

    // Em produção, enviar para serviço de monitoramento
    // Ex: Sentry, LogRocket, etc.
});

/* ============================================
    7. ANALYTICS (Opcional)
   ============================================ */

/**
 * Rastrear eventos (exemplo simplificado)
 */
function trackEvent(categoria, acao, label) {
    console.log(`📊 Evento: ${categoria} - ${acao} - ${label}`);

    // Em produção, integrar com Google Analytics, Matomo, etc.
    // Exemplo:
    // if (window.gtag) {
    //     gtag('event', acao, {
    //         'event_category': categoria,
    //         'event_label': label
    //     });
    // }
}

// Rastrear cliques em notícias
document.addEventListener('click', (e) => {
    const link = e.target.closest('.noticia-card a');
    if (link) {
        const titulo = link.querySelector('.card-title')?.textContent;
        trackEvent('Notícias', 'Clique', titulo || 'Título não encontrado');
    }
});

// Rastrear envio de formulário
document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-comentario') {
        trackEvent('Formulário', 'Envio', 'Comentário');
    }
});

/* ============================================
    8. ACESSIBILIDADE - ATALHOS DE TECLADO
   ============================================ */

/**
 * Atalhos de teclado (eMAG)
 */
document.addEventListener('keydown', (e) => {
    // Alt+1: Ir para conteúdo principal
    if (e.altKey && e.key === '1') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
            anunciar('Navegou para o conteúdo principal');
        }
    }

    // Alt+2: Ir para menu de navegação
    if (e.altKey && e.key === '2') {
        e.preventDefault();
        const mainNav = document.getElementById('main-nav');
        if (mainNav) {
            const firstLink = mainNav.querySelector('a');
            if (firstLink) {
                firstLink.focus();
                firstLink.scrollIntoView({ behavior: 'smooth' });
                anunciar('Navegou para o menu principal');
            }
        }
    }

    // Alt+3: Ir para busca
    if (e.altKey && e.key === '3') {
        e.preventDefault();
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth' });
            anunciar('Navegou para o campo de busca');
        }
    }
});

/* ============================================
    9. PERFORMANCE - LAZY LOADING
   ============================================ */

/**
 * Lazy loading para imagens (fallback para navegadores antigos)
 */
if ('loading' in HTMLImageElement.prototype) {
    console.log('✓ Lazy loading nativo suportado');
} else {
    console.log('Implementando lazy loading via Intersection Observer');

    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback: carregar todas as imagens
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
}

/* ============================================
    10. SERVICE WORKER (PWA - Opcional)
   ============================================ */

/**
 * Registrar Service Worker para PWA
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Descomentado em produção:
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('✓ Service Worker registrado:', reg))
        //     .catch(err => console.error('Erro ao registrar Service Worker:', err));
    });
}

/* ============================================
    FIM DO JAVASCRIPT V2
   ============================================ */

console.log('📄 wcag-aa.js carregado completamente');