/* ============================================
   MODO DISLEXIA - V3
   Suporte para pessoas com dislexia
   ============================================ */

'use strict';

/**
 * Módulo de Modo Dislexia
 * Aplica fonte OpenDyslexic e ajustes de legibilidade
 */
const ModoDislexia = (() => {
    // Configuração
    const CONFIG = {
        fonteUrl: '../assets/fonts/OpenDyslexic/OpenDyslexic-Regular.woff2',
        fontFamily: 'OpenDyslexic, Arial, sans-serif',
        prefKey: 'cabra-tech-v3-dislexia',
        ajustes: {
            espacamentoLinhas: 1.8,
            espacamentoLetras: '0.05em',
            espacamentoPalavras: '0.2em',
            tamanhoBase: '18px',
            pesoFonte: 500
        }
    };
    
    // Estado
    let ativo = false;
    let fonteCarregada = false;
    let botao = null;
    
    /**
     * Inicializa o módulo
     */
    function init() {
        console.log('📖 Inicializando Modo Dislexia...');
        
        // Criar botão de controle se não existir
        botao = document.getElementById('toggle-dislexia');
        
        if (!botao) {
            console.warn('⚠️ Botão de dislexia não encontrado. Criando...');
            criarBotao();
        }
        
        // Configurar eventos
        configurarEventos();
        
        // Pré-carregar fonte
        preCarregarFonte();
        
        // Carregar preferência salva
        carregarPreferencia();
        
        console.log('✅ Modo Dislexia inicializado');
        return true;
    }
    
    /**
     * Cria botão de controle dinamicamente
     */
    function criarBotao() {
        // Encontrar barra de acessibilidade
        const barraAcessibilidade = document.querySelector('.acessibilidade-controles');
        
        if (!barraAcessibilidade) {
            console.error('❌ Barra de acessibilidade não encontrada');
            return;
        }
        
        // Criar grupo de controle
        const grupoControle = document.createElement('div');
        grupoControle.className = 'controle-grupo';
        
        // Criar botão
        botao = document.createElement('button');
        botao.type = 'button';
        botao.id = 'toggle-dislexia';
        botao.className = 'btn-controle btn-dislexia';
        botao.setAttribute('aria-pressed', 'false');
        botao.setAttribute('aria-label', 'Ativar modo para dislexia');
        botao.title = 'Ativar fonte e ajustes para dislexia';
        
        botao.innerHTML = `
            <i class="bi bi-book" aria-hidden="true"></i>
            <span class="btn-text">Dislexia</span>
        `;
        
        grupoControle.appendChild(botao);
        barraAcessibilidade.appendChild(grupoControle);
        
        console.log('✅ Botão de dislexia criado');
    }
    
    /**
     * Configura event listeners
     */
    function configurarEventos() {
        if (botao) {
            botao.addEventListener('click', toggle);
        }
    }
    
    /**
     * Pré-carrega a fonte OpenDyslexic
     */
    async function preCarregarFonte() {
        try {
            // Verificar se FontFace API está disponível
            if (!('FontFace' in window)) {
                console.warn('⚠️ FontFace API não suportada');
                return false;
            }
            
            console.log('⏳ Carregando fonte OpenDyslexic...');
            
            // Criar FontFace
            const fontFace = new FontFace('OpenDyslexic', `url(${CONFIG.fonteUrl})`);
            
            // Carregar fonte
            await fontFace.load();
            
            // Adicionar ao documento
            document.fonts.add(fontFace);
            
            fonteCarregada = true;
            console.log('✅ Fonte OpenDyslexic carregada');
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar fonte OpenDyslexic:', error);
            fonteCarregada = false;
            return false;
        }
    }
    
    /**
     * Ativa/desativa modo dislexia
     */
    function toggle() {
        if (ativo) {
            desativar();
        } else {
            ativar();
        }
        
        return ativo;
    }
    
    /**
     * Ativa modo dislexia
     */
    async function ativar() {
        console.log('🔄 Ativando modo dislexia...');
        
        // Verificar se fonte está carregada
        if (!fonteCarregada) {
            console.log('⏳ Aguardando carregamento da fonte...');
            const sucesso = await preCarregarFonte();
            
            if (!sucesso) {
                anunciar('Erro ao carregar fonte para dislexia. Por favor, tente novamente.');
                return false;
            }
        }
        
        // Aplicar classe no body
        document.body.classList.add('modo-dislexia');
        
        // Aplicar ajustes CSS
        aplicarAjustes();
        
        // Atualizar estado
        ativo = true;
        
        // Atualizar botão
        if (botao) {
            botao.classList.add('active');
            botao.setAttribute('aria-pressed', 'true');
            botao.setAttribute('aria-label', 'Desativar modo para dislexia');
        }
        
        // Salvar preferência
        salvarPreferencia(true);
        
        // Anunciar mudança
        anunciar('Modo dislexia ativado. Fonte OpenDyslexic e ajustes de legibilidade aplicados.');
        
        console.log('✅ Modo dislexia ativado');
        return true;
    }
    
    /**
     * Desativa modo dislexia
     */
    function desativar() {
        console.log('🔄 Desativando modo dislexia...');
        
        // Remover classe do body
        document.body.classList.remove('modo-dislexia');
        
        // Remover ajustes CSS
        removerAjustes();
        
        // Atualizar estado
        ativo = false;
        
        // Atualizar botão
        if (botao) {
            botao.classList.remove('active');
            botao.setAttribute('aria-pressed', 'false');
            botao.setAttribute('aria-label', 'Ativar modo para dislexia');
        }
        
        // Salvar preferência
        salvarPreferencia(false);
        
        // Anunciar mudança
        anunciar('Modo dislexia desativado. Fonte padrão restaurada.');
        
        console.log('✅ Modo dislexia desativado');
        return true;
    }
    
    /**
     * Aplica ajustes CSS para dislexia
     */
    function aplicarAjustes() {
        const root = document.documentElement;
        
        // Aplicar fonte
        root.style.setProperty('--fonte-familia-base', CONFIG.fontFamily);
        
        // Aplicar espaçamentos
        root.style.setProperty('--linha-altura-base', CONFIG.ajustes.espacamentoLinhas);
        root.style.setProperty('--letra-espacamento', CONFIG.ajustes.espacamentoLetras);
        root.style.setProperty('--palavra-espacamento', CONFIG.ajustes.espacamentoPalavras);
        
        // Aplicar tamanho e peso
        root.style.setProperty('--fonte-tamanho-base', CONFIG.ajustes.tamanhoBase);
        root.style.setProperty('--fonte-peso-base', CONFIG.ajustes.pesoFonte);
        
        // Adicionar regras CSS específicas
        adicionarEstilosDislexia();
        
        console.log('✅ Ajustes CSS aplicados');
    }
    
    /**
     * Remove ajustes CSS
     */
    function removerAjustes() {
        const root = document.documentElement;
        
        // Remover propriedades customizadas
        root.style.removeProperty('--fonte-familia-base');
        root.style.removeProperty('--linha-altura-base');
        root.style.removeProperty('--letra-espacamento');
        root.style.removeProperty('--palavra-espacamento');
        root.style.removeProperty('--fonte-tamanho-base');
        root.style.removeProperty('--fonte-peso-base');
        
        // Remover estilos específicos
        removerEstilosDislexia();
        
        console.log('✅ Ajustes CSS removidos');
    }
    
    /**
     * Adiciona estilos CSS específicos para dislexia
     */
    function adicionarEstilosDislexia() {
        // Verificar se já existe
        if (document.getElementById('dislexia-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'dislexia-styles';
        style.textContent = `
            /* Estilos para Modo Dislexia */
            .modo-dislexia {
                /* Fonte OpenDyslexic em todo o documento */
                font-family: ${CONFIG.fontFamily} !important;
            }
            
            .modo-dislexia * {
                font-family: inherit !important;
                letter-spacing: ${CONFIG.ajustes.espacamentoLetras} !important;
                word-spacing: ${CONFIG.ajustes.espacamentoPalavras} !important;
            }
            
            .modo-dislexia p,
            .modo-dislexia li,
            .modo-dislexia td,
            .modo-dislexia th {
                line-height: ${CONFIG.ajustes.espacamentoLinhas} !important;
            }
            
            /* Aumentar contraste de texto */
            .modo-dislexia {
                color: #000000 !important;
                background-color: #FFFEF0 !important; /* Fundo levemente amarelado */
            }
            
            /* Evitar justificação de texto */
            .modo-dislexia p,
            .modo-dislexia div {
                text-align: left !important;
                hyphens: none !important;
            }
            
            /* Destacar links */
            .modo-dislexia a {
                text-decoration: underline !important;
                text-decoration-thickness: 2px !important;
                text-underline-offset: 3px !important;
            }
            
            /* Melhorar contraste de botões */
            .modo-dislexia button,
            .modo-dislexia .btn {
                border: 3px solid #000000 !important;
                font-weight: 700 !important;
            }
            
            /* Espaçamento entre parágrafos */
            .modo-dislexia p + p {
                margin-top: 1.5em !important;
            }
            
            /* Listas mais espaçadas */
            .modo-dislexia li {
                margin-bottom: 0.75em !important;
            }
            
            /* Títulos mais destacados */
            .modo-dislexia h1,
            .modo-dislexia h2,
            .modo-dislexia h3,
            .modo-dislexia h4,
            .modo-dislexia h5,
            .modo-dislexia h6 {
                font-weight: 700 !important;
                margin-top: 1.5em !important;
                margin-bottom: 0.75em !important;
            }
            
            /* Inputs de formulário */
            .modo-dislexia input,
            .modo-dislexia textarea,
            .modo-dislexia select {
                font-size: 18px !important;
                padding: 12px !important;
                border: 2px solid #000000 !important;
            }
            
            /* Foco mais visível */
            .modo-dislexia *:focus {
                outline: 4px solid #FF6600 !important;
                outline-offset: 4px !important;
            }
            
            /* Desabilitar efeitos que podem causar confusão */
            .modo-dislexia * {
                animation: none !important;
                transition: none !important;
                text-shadow: none !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Estilos de dislexia adicionados');
    }
    
    /**
     * Remove estilos CSS específicos
     */
    function removerEstilosDislexia() {
        const style = document.getElementById('dislexia-styles');
        
        if (style) {
            style.remove();
            console.log('✅ Estilos de dislexia removidos');
        }
    }
    
    /**
     * Salva preferência no localStorage
     * @param {boolean} ativar - Estado desejado
     */
    function salvarPreferencia(ativar) {
        try {
            localStorage.setItem(CONFIG.prefKey, ativar.toString());
            console.log(`💾 Preferência de dislexia salva: ${ativar}`);
        } catch (error) {
            console.error('❌ Erro ao salvar preferência:', error);
        }
    }
    
    /**
     * Carrega preferência salva
     */
    function carregarPreferencia() {
        try {
            const prefSalva = localStorage.getItem(CONFIG.prefKey);
            
            if (prefSalva === 'true' && !ativo) {
                ativar();
                console.log('✅ Modo dislexia carregado da preferência');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar preferência:', error);
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
     * Verifica se modo está ativo
     * @returns {boolean} Estado atual
     */
    function isAtivo() {
        return ativo;
    }
    
    /**
     * Verifica se fonte está carregada
     * @returns {boolean} Fonte carregada
     */
    function isFonteCarregada() {
        return fonteCarregada;
    }
    
    /**
     * Obtém configurações atuais
     * @returns {Object} Configurações
     */
    function getConfig() {
        return { ...CONFIG };
    }
    
    /**
     * Atualiza configurações
     * @param {Object} novasConfigs - Novas configurações
     */
    function setConfig(novasConfigs) {
        Object.assign(CONFIG.ajustes, novasConfigs);
        
        if (ativo) {
            aplicarAjustes();
        }
        
        console.log('✅ Configurações atualizadas:', novasConfigs);
    }
    
    // API Pública
    return {
        init,
        toggle,
        ativar,
        desativar,
        isAtivo,
        isFonteCarregada,
        getConfig,
        setConfig
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ModoDislexia = ModoDislexia;
}

// Auto-inicializar se DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ModoDislexia.init();
    });
} else {
    ModoDislexia.init();
}
