/* ============================================
   AUMENTAR FONTE - V3
   Controle de tamanho de fonte (WCAG 1.4.4 - AA)
   ============================================ */

'use strict';

/**
 * Módulo de Controle de Tamanho de Fonte
 * Permite aumentar/diminuir fonte em 5 níveis
 */
const AumentarFonte = (() => {
    // Configuração
    const CONFIG = {
        tamanhosDisponiveis: [85, 100, 115, 130, 145], // Percentuais
        indiceInicial: 1, // 100% (padrão)
        teclaAumentar: '+',
        teclaDiminuir: '-',
        teclaResetar: '0',
        prefKey: 'cabra-tech-v3-fonte'
    };
    
    // Estado privado
    let indiceAtual = CONFIG.indiceInicial;
    let botoes = {};
    
    /**
     * Inicializa o módulo
     */
    function init() {
        console.log('🔤 Inicializando Controle de Fonte...');
        
        // Selecionar botões
        botoes.diminuir = document.getElementById('diminuir-fonte');
        botoes.normal = document.getElementById('fonte-normal');
        botoes.aumentar = document.getElementById('aumentar-fonte');
        
        // Verificar se elementos existem
        if (!botoes.diminuir || !botoes.aumentar) {
            console.warn('⚠️ Botões de fonte não encontrados');
            return false;
        }
        
        // Configurar eventos
        configurarEventos();
        
        // Carregar preferência salva
        carregarPreferencia();
        
        console.log('✅ Controle de Fonte inicializado');
        return true;
    }
    
    /**
     * Configura event listeners
     */
    function configurarEventos() {
        // Botões de interface
        botoes.diminuir.addEventListener('click', diminuir);
        botoes.aumentar.addEventListener('click', aumentar);
        
        if (botoes.normal) {
            botoes.normal.addEventListener('click', resetar);
        }
        
        // Atalhos de teclado (Ctrl +/-)
        document.addEventListener('keydown', (e) => {
            // Apenas se Ctrl estiver pressionado (sem Alt ou Shift)
            if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                if (e.key === CONFIG.teclaAumentar || e.key === '=') {
                    e.preventDefault();
                    aumentar();
                } else if (e.key === CONFIG.teclaDiminuir) {
                    e.preventDefault();
                    diminuir();
                } else if (e.key === CONFIG.teclaResetar) {
                    e.preventDefault();
                    resetar();
                }
            }
        });
    }
    
    /**
     * Aumenta o tamanho da fonte
     */
    function aumentar() {
        if (indiceAtual < CONFIG.tamanhosDisponiveis.length - 1) {
            indiceAtual++;
            aplicar();
            console.log('➕ Fonte aumentada');
        } else {
            anunciar('Tamanho máximo de fonte atingido');
            console.log('⚠️ Fonte no máximo');
        }
        
        return getTamanhoAtual();
    }
    
    /**
     * Diminui o tamanho da fonte
     */
    function diminuir() {
        if (indiceAtual > 0) {
            indiceAtual--;
            aplicar();
            console.log('➖ Fonte diminuída');
        } else {
            anunciar('Tamanho mínimo de fonte atingido');
            console.log('⚠️ Fonte no mínimo');
        }
        
        return getTamanhoAtual();
    }
    
    /**
     * Reseta fonte para tamanho padrão (100%)
     */
    function resetar() {
        indiceAtual = CONFIG.indiceInicial;
        aplicar();
        anunciar('Tamanho de fonte resetado para o padrão');
        console.log('🔄 Fonte resetada para 100%');
        
        return getTamanhoAtual();
    }
    
    /**
     * Aplica o tamanho de fonte atual
     */
    function aplicar() {
        const tamanho = CONFIG.tamanhosDisponiveis[indiceAtual];
        
        // Aplicar no elemento raiz (html)
        document.documentElement.style.fontSize = `${tamanho}%`;
        
        // Atualizar estado dos botões
        atualizarBotoes();
        
        // Salvar preferência
        salvarPreferencia(tamanho);
        
        // Anunciar mudança
        anunciar(`Tamanho de fonte alterado para ${tamanho}%`);
        
        console.log(`✅ Fonte aplicada: ${tamanho}%`);
    }
    
    /**
     * Atualiza estado visual dos botões
     */
    function atualizarBotoes() {
        const noMinimo = indiceAtual === 0;
        const noPadrao = indiceAtual === CONFIG.indiceInicial;
        const noMaximo = indiceAtual === CONFIG.tamanhosDisponiveis.length - 1;
        
        // Atualizar classes e ARIA
        botoes.diminuir.classList.toggle('active', noMinimo);
        botoes.diminuir.disabled = noMinimo;
        botoes.diminuir.setAttribute('aria-disabled', noMinimo);
        
        if (botoes.normal) {
            botoes.normal.classList.toggle('active', noPadrao);
            botoes.normal.setAttribute('aria-pressed', noPadrao);
        }
        
        botoes.aumentar.classList.toggle('active', noMaximo);
        botoes.aumentar.disabled = noMaximo;
        botoes.aumentar.setAttribute('aria-disabled', noMaximo);
    }
    
    /**
     * Salva preferência no localStorage
     * @param {number} tamanho - Tamanho em percentual
     */
    function salvarPreferencia(tamanho) {
        try {
            localStorage.setItem(CONFIG.prefKey, tamanho.toString());
            console.log(`💾 Tamanho de fonte salvo: ${tamanho}%`);
        } catch (error) {
            console.error('❌ Erro ao salvar tamanho de fonte:', error);
        }
    }
    
    /**
     * Carrega preferência salva
     */
    function carregarPreferencia() {
        try {
            const tamanhoSalvo = localStorage.getItem(CONFIG.prefKey);
            
            if (tamanhoSalvo) {
                const tamanho = parseInt(tamanhoSalvo, 10);
                const indice = CONFIG.tamanhosDisponiveis.indexOf(tamanho);
                
                if (indice !== -1) {
                    indiceAtual = indice;
                    aplicar();
                    console.log(`✅ Tamanho de fonte carregado: ${tamanho}%`);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar tamanho de fonte:', error);
        }
    }
    
    /**
     * Anuncia mudança para leitores de tela
     * @param {string} mensagem - Mensagem a anunciar
     */
    function anunciar(mensagem) {
        if (typeof window.anunciarParaLeitores === 'function') {
            window.anunciarParaLeitores(mensagem, 'polite');
        }
    }
    
    /**
     * Obtém tamanho atual em percentual
     * @returns {number} Tamanho atual
     */
    function getTamanhoAtual() {
        return CONFIG.tamanhosDisponiveis[indiceAtual];
    }
    
    /**
     * Obtém índice atual
     * @returns {number} Índice no array
     */
    function getIndiceAtual() {
        return indiceAtual;
    }
    
    /**
     * Define tamanho específico
     * @param {number} tamanho - Tamanho desejado em percentual
     * @returns {boolean} Sucesso da operação
     */
    function setTamanho(tamanho) {
        const indice = CONFIG.tamanhosDisponiveis.indexOf(tamanho);
        
        if (indice !== -1) {
            indiceAtual = indice;
            aplicar();
            return true;
        }
        
        console.warn(`⚠️ Tamanho inválido: ${tamanho}%`);
        return false;
    }
    
    // API Pública
    return {
        init,
        aumentar,
        diminuir,
        resetar,
        getTamanhoAtual,
        getIndiceAtual,
        setTamanho
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AumentarFonte = AumentarFonte;
}

// Auto-inicializar se DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AumentarFonte.init();
    });
} else {
    AumentarFonte.init();
}