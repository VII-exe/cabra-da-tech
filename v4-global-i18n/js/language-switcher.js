/**
 * ============================================
 * LANGUAGE-SWITCHER.JS
 * ============================================
 * 
 * Gerencia o seletor de idiomas e aplica
 * as traduÃ§Ãµes na pÃ¡gina
 */

class LanguageSwitcher {
    constructor() {
        this.select = null;
        this.init();
    }

    async init() {
        console.log('ðŸŒ Inicializando Language Switcher...');

        // Aguardar DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            await this.setup();
        }
    }

    async setup() {
        // Buscar seletor de idioma
        this.select = document.getElementById('select-language');

        if (!this.select) {
            console.error('âŒ Seletor de idioma nÃ£o encontrado (#language-select)');
            return;
        }

        // Aguardar i18n carregar
        await this.waitForI18n();

        // Definir valor inicial
        if (window.i18n) {
            this.select.value = window.i18n.currentLocale;
            console.log(`âœ… Idioma inicial: ${window.i18n.currentLocale}`);
        }

        // Evento de mudanÃ§a
        this.select.addEventListener('change', async (e) => {
            const newLocale = e.target.value;
            await this.changeLanguage(newLocale);
        });

        console.log('âœ… Language Switcher inicializado');
    }

    async waitForI18n() {
        return new Promise((resolve) => {
            if (window.i18n && window.i18n.isLoaded) {
                console.log('âœ… i18n jÃ¡ carregado');
                resolve();
            } else {
                console.log('â³ Aguardando i18n carregar...');
                const checkInterval = setInterval(() => {
                    if (window.i18n && window.i18n.isLoaded) {
                        clearInterval(checkInterval);
                        console.log('âœ… i18n carregado');
                        resolve();
                    }
                }, 100);

                // Timeout de 10 segundos
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.warn('âš ï¸ Timeout aguardando i18n');
                    resolve();
                }, 10000);
            }
        });
    }

    async changeLanguage(locale) {
        console.log(`ðŸ”„ Mudando idioma para: ${locale}`);

        if (!window.i18n) {
            console.error('âŒ Sistema i18n nÃ£o disponÃ­vel');
            return;
        }

        try {
            // Carregar traduÃ§Ãµes
            const success = await window.i18n.changeLocale(locale);

            if (success) {
                console.log(`âœ… Idioma alterado com sucesso: ${locale}`);

                // Recarregar componentes dinÃ¢micos
                this.reloadDynamicContent();

                // Atualizar select se necessÃ¡rio
                if (this.select.value !== locale) {
                    this.select.value = locale;
                }
            } else {
                console.error('âŒ Erro ao alterar idioma');
                this.showError();
            }
        } catch (error) {
            console.error('âŒ Erro ao mudar idioma:', error);
            this.showError();
        }
    }

    reloadDynamicContent() {
        console.log('ðŸ”„ Recarregando conteÃºdo dinÃ¢mico...');

        // Disparar evento customizado para outros componentes
        const event = new CustomEvent('languageChanged', {
            detail: { locale: window.i18n.currentLocale }
        });
        document.dispatchEvent(event);

        // Se houver news manager, recarregar notÃ­cias
        if (window.newsManager && typeof window.newsManager.render === 'function') {
            window.newsManager.render();
        }

        // Se houver outras funcionalidades que dependem de i18n
        // adicione aqui
    }

    showError() {
        // Criar toast de erro
        const toast = document.createElement('div');
        toast.className = 'language-error-toast';
        toast.textContent = 'Erro ao mudar idioma. Tente novamente.';
        toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999;
        animation: slideInUp 0.3s ease;
    `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.languageSwitcher = new LanguageSwitcher();
}