/* ============================================
   ATALHOS DE TECLADO - V3
   Sistema de navegação por teclado (WCAG 2.1.1, eMAG)
   ============================================ */

'use strict';

/**
 * Módulo de Atalhos de Teclado
 * Implementa navegação rápida conforme eMAG e WCAG
 */
const AtalhosTeclado = (() => {
    // Mapa de atalhos
    const ATALHOS = {
        // Navegação principal (eMAG 2.1)
        '1': {
            tecla: 'Alt+1',
            acao: () => navegarPara('#main-content'),
            descricao: 'Ir para conteúdo principal',
            tipo: 'navegacao'
        },
        '2': {
            tecla: 'Alt+2',
            acao: () => navegarPara('#main-nav'),
            descricao: 'Ir para menu de navegação',
            tipo: 'navegacao'
        },
        '3': {
            tecla: 'Alt+3',
            acao: () => focarElemento('#search'),
            descricao: 'Ir para busca',
            tipo: 'navegacao'
        },
        '4': {
            tecla: 'Alt+4',
            acao: () => navegarPara('#site-footer'),
            descricao: 'Ir para rodapé',
            tipo: 'navegacao'
        },
        
        // Seções do site
        'h': {
            tecla: 'Alt+H',
            acao: () => navegarPara('#home'),
            descricao: 'Ir para página inicial',
            tipo: 'secao'
        },
        't': {
            tecla: 'Alt+T',
            acao: () => navegarPara('#tecnologia'),
            descricao: 'Ver notícias de tecnologia',
            tipo: 'secao'
        },
        'e': {
            tecla: 'Alt+E',
            acao: () => navegarPara('#educacao'),
            descricao: 'Ver notícias de educação',
            tipo: 'secao'
        },
        'r': {
            tecla: 'Alt+R',
            acao: () => navegarPara('#regiao'),
            descricao: 'Ver notícias da região',
            tipo: 'secao'
        },
        's': {
            tecla: 'Alt+S',
            acao: () => navegarPara('#sobre'),
            descricao: 'Sobre o site',
            tipo: 'secao'
        },
        'b': {
            tecla: 'Alt+B',
            acao: () => focarElemento('#search'),
            descricao: 'Focar campo de busca',
            tipo: 'acao'
        },
        
        // Acessibilidade
        'a': {
            tecla: 'Alt+A',
            acao: () => navegarPara('#barra-acessibilidade'),
            descricao: 'Ir para barra de acessibilidade',
            tipo: 'acessibilidade'
        },
        'k': {
            tecla: 'Alt+K',
            acao: () => abrirModalAtalhos(),
            descricao: 'Ver lista de atalhos de teclado',
            tipo: 'ajuda'
        }
    };
    
    // Configuração
    const CONFIG = {
        prefixoAlt: true,
        prefixoCtrl: false,
        habilitado: true,
        logAtivado: true
    };
    
    // Estado
    let inicializado = false;
    let atalhosPressionados = new Set();
    
    /**
     * Inicializa o módulo
     */
    function init() {
        if (inicializado) {
            console.warn('⚠️ Atalhos de Teclado já inicializados');
            return false;
        }
        
        console.log('⌨️ Inicializando Atalhos de Teclado...');
        
        // Configurar listener global
        configurarEventos();
        
        // Adicionar atributos accesskey nos elementos
        adicionarAccessKeys();
        
        // Marcar como inicializado
        inicializado = true;
        
        console.log('✅ Atalhos de Teclado inicializados');
        console.log(`   Total de atalhos: ${Object.keys(ATALHOS).length}`);
        
        return true;
    }
    
    /**
     * Configura event listeners
     */
    function configurarEventos() {
        // Keydown para detectar combinações
        document.addEventListener('keydown', (e) => {
            if (!CONFIG.habilitado) return;
            
            // Detectar Alt + tecla
            if (CONFIG.prefixoAlt && e.altKey && !e.ctrlKey && !e.shiftKey) {
                const tecla = e.key.toLowerCase();
                
                if (ATALHOS[tecla]) {
                    e.preventDefault();
                    executarAtalho(tecla);
                }
            }
            
            // Tecla ESC para fechar modals/menus
            if (e.key === 'Escape') {
                fecharModaisAbertos();
            }
        });
        
        // Prevenir comportamento padrão de alguns atalhos do navegador
        document.addEventListener('keydown', (e) => {
            // Alt+Seta para navegação de página
            if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                // Permitir navegação do navegador
                return;
            }
        });
    }
    
    /**
     * Adiciona accesskey nos elementos HTML
     */
    function adicionarAccessKeys() {
        Object.keys(ATALHOS).forEach(tecla => {
            const atalho = ATALHOS[tecla];
            
            // Extrair seletor da ação (se for navegarPara)
            const acaoStr = atalho.acao.toString();
            const match = acaoStr.match(/#[\w-]+/);
            
            if (match) {
                const seletor = match[0];
                const elemento = document.querySelector(seletor);
                
                if (elemento && !elemento.hasAttribute('accesskey')) {
                    elemento.setAttribute('accesskey', tecla);
                    
                    // Adicionar title com instrução
                    const tituloAtual = elemento.getAttribute('title') || '';
                    const novoTitulo = tituloAtual 
                        ? `${tituloAtual} (${atalho.tecla})`
                        : atalho.tecla;
                    
                    elemento.setAttribute('title', novoTitulo);
                }
            }
        });
        
        console.log('✅ AccessKeys adicionados aos elementos');
    }
    
    /**
     * Executa um atalho específico
     * @param {string} tecla - Tecla do atalho
     */
    function executarAtalho(tecla) {
        const atalho = ATALHOS[tecla];
        
        if (!atalho) {
            console.warn(`⚠️ Atalho não encontrado: ${tecla}`);
            return false;
        }
        
        // Log
        if (CONFIG.logAtivado) {
            console.log(`⌨️ Atalho ativado: ${atalho.tecla} - ${atalho.descricao}`);
        }
        
        // Executar ação
        try {
            atalho.acao();
            
            // Anunciar para leitores de tela
            anunciar(atalho.descricao);
            
            // Feedback visual (opcional)
            mostrarFeedbackVisual(atalho.descricao);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao executar atalho:', error);
            return false;
        }
    }
    
    /**
     * Navega para um elemento e foca nele
     * @param {string} seletor - Seletor CSS do elemento
     */
    function navegarPara(seletor) {
        const elemento = document.querySelector(seletor);
        
        if (!elemento) {
            console.warn(`⚠️ Elemento não encontrado: ${seletor}`);
            anunciar('Seção não disponível');
            return false;
        }
        
        // Tornar focável se não for
        if (!elemento.hasAttribute('tabindex')) {
            elemento.setAttribute('tabindex', '-1');
        }
        
        // Focar elemento
        elemento.focus();
        
        // Scroll suave
        const offset = calcularOffset();
        const posicao = elemento.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
            top: posicao,
            behavior: preferenciaMovimentoReduzido() ? 'auto' : 'smooth'
        });
        
        console.log(`✅ Navegado para: ${seletor}`);
        return true;
    }
    
    /**
     * Foca em um elemento de formulário
     * @param {string} seletor - Seletor CSS do elemento
     */
    function focarElemento(seletor) {
        const elemento = document.querySelector(seletor);
        
        if (!elemento) {
            console.warn(`⚠️ Elemento não encontrado: ${seletor}`);
            return false;
        }
        
        // Focar
        elemento.focus();
        
        // Scroll até o elemento
        elemento.scrollIntoView({
            behavior: preferenciaMovimentoReduzido() ? 'auto' : 'smooth',
            block: 'center'
        });
        
        console.log(`✅ Elemento focado: ${seletor}`);
        return true;
    }
    
    /**
     * Calcula offset para elementos fixos (header, etc)
     * @returns {number} Offset em pixels
     */
    function calcularOffset() {
        let offset = 20; // Base
        
        const barraAcessibilidade = document.querySelector('.barra-acessibilidade');
        const header = document.querySelector('.site-header');
        
        if (barraAcessibilidade) {
            offset += barraAcessibilidade.offsetHeight;
        }
        
        if (header) {
            offset += header.offsetHeight;
        }
        
        return offset;
    }
    
    /**
     * Abre modal de atalhos
     */
    function abrirModalAtalhos() {
        if (window.ModalAtalhos && typeof window.ModalAtalhos.abrir === 'function') {
            window.ModalAtalhos.abrir();
        } else {
            // Fallback: mostrar lista em console
            console.table(
                Object.keys(ATALHOS).map(k => ({
                    Tecla: ATALHOS[k].tecla,
                    Descrição: ATALHOS[k].descricao,
                    Tipo: ATALHOS[k].tipo
                }))
            );
            
            anunciar('Lista de atalhos exibida no console');
        }
    }
    
    /**
     * Fecha modais e menus abertos (ESC)
     */
    function fecharModaisAbertos() {
        // Fechar modal de atalhos
        if (window.ModalAtalhos && typeof window.ModalAtalhos.fechar === 'function') {
            window.ModalAtalhos.fechar();
        }
        
        // Fechar menu mobile
        if (window.MenuMobile && typeof window.MenuMobile.fechar === 'function') {
            window.MenuMobile.fechar();
        }
    }
    
    /**
     * Mostra feedback visual temporário
     * @param {string} mensagem - Mensagem a exibir
     */
    function mostrarFeedbackVisual(mensagem) {
        // Criar toast notification
        const toast = document.createElement('div');
        toast.className = 'atalho-feedback';
        toast.textContent = mensagem;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        // Estilos inline
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#228B22',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '10000',
            fontSize: '14px',
            fontWeight: '600',
            animation: 'slideInUp 0.3s ease-out'
        });
        
        document.body.appendChild(toast);
        
        // Remover após 2 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }
    
    /**
     * Anuncia mensagem para leitores de tela
     * @param {string} mensagem - Mensagem a anunciar
     */
    function anunciar(mensagem) {
        if (typeof window.anunciarParaLeitores === 'function') {
            window.anunciarParaLeitores(mensagem, 'polite');
        }
    }
    
    /**
     * Verifica preferência de movimento reduzido
     * @returns {boolean} Prefere movimento reduzido
     */
    function preferenciaMovimentoReduzido() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    /**
     * Obtém lista de todos os atalhos
     * @returns {Array} Array com informações dos atalhos
     */
    function getAtalhos() {
        return Object.keys(ATALHOS).map(tecla => ({
            tecla: ATALHOS[tecla].tecla,
            descricao: ATALHOS[tecla].descricao,
            tipo: ATALHOS[tecla].tipo
        }));
    }
    
    /**
     * Obtém atalhos agrupados por tipo
     * @returns {Object} Atalhos agrupados
     */
    function getAtalhosPorTipo() {
        const agrupados = {};
        
        Object.keys(ATALHOS).forEach(tecla => {
            const atalho = ATALHOS[tecla];
            const tipo = atalho.tipo;
            
            if (!agrupados[tipo]) {
                agrupados[tipo] = [];
            }
            
            agrupados[tipo].push({
                tecla: atalho.tecla,
                descricao: atalho.descricao
            });
        });
        
        return agrupados;
    }
    
    /**
     * Habilita ou desabilita atalhos
     * @param {boolean} habilitar - True para habilitar
     */
    function setHabilitado(habilitar) {
        CONFIG.habilitado = habilitar;
        console.log(`⌨️ Atalhos ${habilitar ? 'habilitados' : 'desabilitados'}`);
    }
    
    /**
     * Verifica se atalhos estão habilitados
     * @returns {boolean} Estado atual
     */
    function isHabilitado() {
        return CONFIG.habilitado;
    }
    
    // API Pública
    return {
        init,
        executarAtalho,
        navegarPara,
        focarElemento,
        getAtalhos,
        getAtalhosPorTipo,
        setHabilitado,
        isHabilitado
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AtalhosTeclado = AtalhosTeclado;
}

// Auto-inicializar se DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AtalhosTeclado.init();
    });
} else {
    AtalhosTeclado.init();
}