/* ============================================
   BARRA DE ACESSIBILIDADE - V3
   Gerenciamento central dos controles de acessibilidade
   ============================================ */

'use strict';

/**
 * Módulo da Barra de Acessibilidade
 * Gerencia tema, espaçamento, Libras e modal de atalhos
 */
const BarraAcessibilidade = (() => {
    // Estado privado
    let controles = {};
    let temasDisponiveis = ['default', 'high-contrast', 'dark'];
    let temaAtual = 'default';
    let espacamentoAtual = 'normal';
    let librasAtivo = false;
    
    /**
     * Inicializa a barra de acessibilidade
     */
    function init() {
        console.log('🎛️ Inicializando Barra de Acessibilidade...');
        
        // Selecionar elementos do DOM
        controles.temas = document.querySelectorAll('[data-theme]');
        controles.espacamentos = document.querySelectorAll('[data-spacing]');
        controles.libras = document.getElementById('toggle-libras');
        controles.atalhos = document.getElementById('btn-atalhos');
        
        // Verificar se elementos existem
        if (!controles.temas.length) {
            console.warn('⚠️ Controles de tema não encontrados');
            return false;
        }
        
        // Configurar eventos
        configurarEventos();
        
        // Carregar preferências salvas
        carregarPreferencias();
        
        console.log('✅ Barra de Acessibilidade inicializada');
        return true;
    }
    
    /**
     * Configura todos os event listeners
     */
    function configurarEventos() {
        // Controles de tema/contraste
        controles.temas.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const tema = e.currentTarget.getAttribute('data-theme');
                mudarTema(tema);
            });
        });
        
        // Controles de espaçamento
        controles.espacamentos.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const espacamento = e.currentTarget.getAttribute('data-spacing');
                mudarEspacamento(espacamento);
            });
        });
        
        // Toggle Libras
        if (controles.libras) {
            controles.libras.addEventListener('click', toggleLibras);
        }
        
        // Botão de atalhos
        if (controles.atalhos) {
            controles.atalhos.addEventListener('click', () => {
                if (window.ModalAtalhos) {
                    window.ModalAtalhos.abrir();
                }
            });
        }
    }
    
    /**
     * Muda o tema/contraste do site
     * @param {string} tema - Nome do tema (default, high-contrast, dark)
     */
    function mudarTema(tema) {
        // Validar tema
        if (!temasDisponiveis.includes(tema)) {
            console.error('❌ Tema inválido:', tema);
            return false;
        }
        
        // Remover todas as classes de tema
        document.body.classList.remove(
            'tema-default',
            'tema-high-contrast',
            'tema-dark'
        );
        
        // Adicionar nova classe de tema
        document.body.classList.add(`tema-${tema}`);
        temaAtual = tema;
        
        // Atualizar botões (estado visual e ARIA)
        atualizarBotoesAtivos(controles.temas, 'data-theme', tema);
        
        // Salvar preferência no localStorage
        salvarPreferencia('tema', tema);
        
        // Anunciar mudança para leitores de tela
        const nomesTemas = {
            'default': 'padrão',
            'high-contrast': 'alto contraste',
            'dark': 'modo escuro'
        };
        
        anunciarMudanca(`Tema alterado para ${nomesTemas[tema]}`);
        
        console.log(`✅ Tema alterado: ${tema}`);
        return true;
    }
    
    /**
     * Muda o espaçamento entre linhas
     * @param {string} espacamento - Tipo de espaçamento (normal, large)
     */
    function mudarEspacamento(espacamento) {
        // Remover classes anteriores
        document.body.classList.remove('espacamento-normal', 'espacamento-large');
        
        // Adicionar nova classe
        document.body.classList.add(`espacamento-${espacamento}`);
        espacamentoAtual = espacamento;
        
        // Atualizar botões
        atualizarBotoesAtivos(controles.espacamentos, 'data-spacing', espacamento);
        
        // Salvar preferência
        salvarPreferencia('espacamento', espacamento);
        
        // Anunciar mudança
        const nomesEspacamentos = {
            'normal': 'normal',
            'large': 'ampliado'
        };
        
        anunciarMudanca(`Espaçamento alterado para ${nomesEspacamentos[espacamento]}`);
        
        console.log(`✅ Espaçamento alterado: ${espacamento}`);
        return true;
    }
    
    /**
     * Ativa/desativa tradução em Libras (VLibras)
     */
    function toggleLibras() {
        const botao = controles.libras;
        const estaAtivo = botao.getAttribute('aria-pressed') === 'true';
        const novoEstado = !estaAtivo;
        
        // Atualizar estado do botão
        botao.setAttribute('aria-pressed', novoEstado);
        botao.classList.toggle('active', novoEstado);
        librasAtivo = novoEstado;
        
        // Controlar widget VLibras
        const vlibrasWidget = document.querySelector('[vw]');
        
        if (vlibrasWidget) {
            if (novoEstado) {
                vlibrasWidget.classList.add('enabled');
                // Forçar ativação do VLibras
                if (window.VLibras && window.VLibras.Widget) {
                    console.log('📱 Ativando VLibras...');
                }
                anunciarMudanca('Tradução em Libras ativada');
            } else {
                vlibrasWidget.classList.remove('enabled');
                anunciarMudanca('Tradução em Libras desativada');
            }
        } else {
            console.warn('⚠️ Widget VLibras não encontrado');
        }
        
        // Salvar preferência
        salvarPreferencia('libras', novoEstado);
        
        console.log(`✅ Libras ${novoEstado ? 'ativado' : 'desativado'}`);
        return novoEstado;
    }
    
    /**
     * Atualiza estado visual dos botões (active e aria-pressed)
     * @param {NodeList} botoes - Lista de botões
     * @param {string} atributo - Nome do atributo de dados
     * @param {string} valorAtivo - Valor do botão ativo
     */
    function atualizarBotoesAtivos(botoes, atributo, valorAtivo) {
        botoes.forEach(botao => {
            const valorBotao = botao.getAttribute(atributo);
            const estaAtivo = valorBotao === valorAtivo;
            
            // Atualizar classes e ARIA
            botao.classList.toggle('active', estaAtivo);
            botao.setAttribute('aria-pressed', estaAtivo);
        });
    }
    
    /**
     * Salva preferência no localStorage
     * @param {string} chave - Nome da preferência
     * @param {*} valor - Valor a salvar
     */
    function salvarPreferencia(chave, valor) {
        try {
            const prefKey = 'cabra-tech-v3-preferencias';
            const prefs = JSON.parse(localStorage.getItem(prefKey) || '{}');
            prefs[chave] = valor;
            localStorage.setItem(prefKey, JSON.stringify(prefs));
            console.log(`💾 Preferência salva: ${chave} = ${valor}`);
        } catch (error) {
            console.error('❌ Erro ao salvar preferência:', error);
        }
    }
    
    /**
     * Carrega preferências salvas do localStorage
     */
    function carregarPreferencias() {
        try {
            const prefKey = 'cabra-tech-v3-preferencias';
            const prefs = JSON.parse(localStorage.getItem(prefKey) || '{}');
            
            // Restaurar tema
            if (prefs.tema && temasDisponiveis.includes(prefs.tema)) {
                mudarTema(prefs.tema);
            }
            
            // Restaurar espaçamento
            if (prefs.espacamento) {
                mudarEspacamento(prefs.espacamento);
            }
            
            // Restaurar Libras
            if (prefs.libras === true && !librasAtivo) {
                toggleLibras();
            }
            
            console.log('✅ Preferências carregadas:', prefs);
        } catch (error) {
            console.error('❌ Erro ao carregar preferências:', error);
        }
    }
    
    /**
     * Anuncia mudança para leitores de tela
     * @param {string} mensagem - Mensagem a anunciar
     */
    function anunciarMudanca(mensagem) {
        // Usar função global se disponível
        if (typeof window.anunciarParaLeitores === 'function') {
            window.anunciarParaLeitores(mensagem, 'polite');
        } else {
            // Fallback: criar anunciador temporário
            const anunciador = document.createElement('div');
            anunciador.setAttribute('role', 'status');
            anunciador.setAttribute('aria-live', 'polite');
            anunciador.className = 'sr-only';
            anunciador.textContent = mensagem;
            
            document.body.appendChild(anunciador);
            
            setTimeout(() => {
                document.body.removeChild(anunciador);
            }, 1000);
        }
    }
    
    /**
     * Obtém tema atual
     * @returns {string} Tema atual
     */
    function getTemaAtual() {
        return temaAtual;
    }
    
    /**
     * Obtém espaçamento atual
     * @returns {string} Espaçamento atual
     */
    function getEspacamentoAtual() {
        return espacamentoAtual;
    }
    
    /**
     * Verifica se Libras está ativo
     * @returns {boolean} Estado do Libras
     */
    function isLibrasAtivo() {
        return librasAtivo;
    }
    
    /**
     * Reseta todas as preferências para padrão
     */
    function resetarPreferencias() {
        mudarTema('default');
        mudarEspacamento('normal');
        
        if (librasAtivo) {
            toggleLibras();
        }
        
        // Limpar localStorage
        try {
            localStorage.removeItem('cabra-tech-v3-preferencias');
            console.log('✅ Preferências resetadas');
            anunciarMudanca('Todas as preferências foram resetadas para o padrão');
        } catch (error) {
            console.error('❌ Erro ao resetar preferências:', error);
        }
    }
    
    // API Pública
    return {
        init,
        mudarTema,
        mudarEspacamento,
        toggleLibras,
        getTemaAtual,
        getEspacamentoAtual,
        isLibrasAtivo,
        resetarPreferencias
    };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BarraAcessibilidade = BarraAcessibilidade;
}

// Auto-inicializar se DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        BarraAcessibilidade.init();
    });
} else {
    BarraAcessibilidade.init();
}