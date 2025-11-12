/**
 * ============================================
 * MAIN.JS - Script Principal V4
 * ============================================
 * 
 * VERSÃO COM DEBUG MELHORADO
 * Identifica problemas com idiomas específicos
 */

// ============================================
// SERVIÇO DE TRADUÇÃO - GOOGLE TRANSLATE
// ============================================

class TranslationService {
    constructor() {
        this.apiUrl = 'https://translate.googleapis.com/translate_a/single';
        this.cache = new Map();
        this.debugMode = true; // Debug ativado
        this.loadCache();
    }

    log(message, data) {
        if (this.debugMode) {
            console.log(`[Translator] ${message}`, data || '');
        }
    }

    loadCache() {
        try {
            const cached = localStorage.getItem('news-translations-google-v2');
            if (cached) {
                const data = JSON.parse(cached);
                this.cache = new Map(Object.entries(data));
                this.log(`✅ Cache carregado: ${this.cache.size} traduções`);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar cache');
        }
    }

    saveCache() {
        try {
            const data = Object.fromEntries(this.cache);
            localStorage.setItem('news-translations-google-v2', JSON.stringify(data));
            this.log(`💾 Cache salvo: ${this.cache.size} traduções`);
        } catch (error) {
            console.warn('⚠️ Erro ao salvar cache');
        }
    }

    getCacheKey(text, targetLang) {
        return `${targetLang}:${text.substring(0, 50)}`;
    }

    /**
     * Traduzir com DEBUG detalhado
     */
    async translate(text, targetLang) {
        if (!text || text.trim() === '') {
            this.log('⚠️ Texto vazio');
            return text;
        }

        // Não traduzir português
        if (targetLang === 'pt-BR' || targetLang === 'pt') {
            return text;
        }

        // Mapear idiomas (CORRIGIDO)
        const langMap = {
            'pt-BR': 'pt',
            'pt': 'pt',
            'en': 'en',
            'es': 'es',
            'ar': 'ar',
            'hi': 'hi',
            'ja': 'ja',  // Japonês
            'ru': 'ru'
        };

        const target = langMap[targetLang];

        if (!target) {
            console.error(`❌ Idioma não mapeado: ${targetLang}`);
            return text;
        }

        this.log(`🌐 Traduzindo para ${target}:`, text.substring(0, 50) + '...');

        // Verificar cache
        const cacheKey = this.getCacheKey(text, target);
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            this.log(`📦 Cache HIT para ${target}:`, cached.substring(0, 50) + '...');
            return cached;
        }

        try {
            // Construir URL
            const url = `${this.apiUrl}?client=gtx&sl=pt&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

            this.log(`📡 Fazendo requisição para ${target}...`);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            this.log(`📥 Resposta da API para ${target}:`, data);

            // Google Translate retorna array aninhado
            let translated = '';

            if (data && data[0]) {
                for (const item of data[0]) {
                    if (item && item[0]) {
                        translated += item[0];
                    }
                }
            }

            if (!translated || translated.trim() === '') {
                console.warn(`⚠️ Tradução vazia para ${target}, usando original`);
                console.warn('Resposta completa:', JSON.stringify(data));
                return text;
            }

            this.log(`✅ Traduzido para ${target}:`, translated.substring(0, 50) + '...');

            // Salvar no cache
            this.cache.set(cacheKey, translated);
            this.saveCache();

            return translated;

        } catch (error) {
            console.error(`❌ Erro ao traduzir para ${target}:`, error);
            console.error('Texto original:', text);
            return text;
        }
    }

    clearCache() {
        this.cache.clear();
        localStorage.removeItem('news-translations-google-v2');
        console.log('🗑️ Cache limpo completamente');
    }
}

// ============================================
// GERENCIADOR DE NOTÍCIAS
// ============================================

class NewsManager {
    constructor() {
        this.news = [];
        this.translatedNews = [];
        this.isLoading = false;
        this.isTranslating = false;
        this.currentLocale = 'pt-BR';
        this.translator = new TranslationService();
        this.debugMode = true;
        this.init();
    }

    log(message, data) {
        if (this.debugMode) {
            console.log(`[NewsManager] ${message}`, data || '');
        }
    }

    async init() {
        this.log('🚀 Inicializando...');

        await this.waitForI18n();
        this.currentLocale = window.i18n ? window.i18n.currentLocale : 'pt-BR';

        this.log(`📍 Idioma inicial: ${this.currentLocale}`);

        await this.loadNews();
        await this.render();

        document.addEventListener('languageChanged', async (e) => {
            const newLocale = e.detail.locale || window.i18n.currentLocale;
            this.log(`🔄 Mudança de idioma: ${this.currentLocale} → ${newLocale}`);
            this.currentLocale = newLocale;
            await this.render();
        });
    }

    async waitForI18n() {
        return new Promise((resolve) => {
            if (window.i18n && window.i18n.isLoaded) {
                resolve();
            } else {
                const check = setInterval(() => {
                    if (window.i18n && window.i18n.isLoaded) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
                setTimeout(() => { clearInterval(check); resolve(); }, 10000);
            }
        });
    }

    async loadNews() {
        try {
            this.log('📡 Carregando notícias...');
            this.isLoading = true;
            this.showLoading();

            const response = await fetch('../data/noticias.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.news = data.noticias || [];

            this.log(`✅ ${this.news.length} notícias carregadas`);
            this.isLoading = false;

            return true;

        } catch (error) {
            console.error('❌ Erro ao carregar notícias:', error);
            this.isLoading = false;
            this.showError();
            return false;
        }
    }

    async translateNews() {
        if (this.currentLocale === 'pt-BR' || this.currentLocale === 'pt') {
            this.log('ℹ️ Idioma português, sem tradução necessária');
            this.translatedNews = this.news;
            return;
        }

        this.log(`🌐 Iniciando tradução para: ${this.currentLocale}`);
        this.isTranslating = true;
        this.showTranslating();

        try {
            const translated = [];

            for (let i = 0; i < this.news.length; i++) {
                const noticia = this.news[i];

                this.log(`📄 Notícia ${i + 1}/${this.news.length}: "${noticia.titulo.substring(0, 30)}..."`);

                // Traduzir em paralelo
                const [titulo, resumo] = await Promise.all([
                    this.translator.translate(noticia.titulo, this.currentLocale),
                    this.translator.translate(noticia.resumo, this.currentLocale)
                ]);

                this.log(`✅ Traduzido ${i + 1}:`, {
                    tituloOriginal: noticia.titulo.substring(0, 30),
                    tituloTraduzido: titulo.substring(0, 30),
                    resumoOriginal: noticia.resumo.substring(0, 30),
                    resumoTraduzido: resumo.substring(0, 30)
                });

                translated.push({
                    ...noticia,
                    titulo,
                    resumo
                });

                const progress = Math.round(((i + 1) / this.news.length) * 100);
                this.updateTranslationProgress(progress, i + 1, this.news.length);
            }

            this.translatedNews = translated;
            this.log('✅ Tradução completa!');

        } catch (error) {
            console.error('❌ Erro ao traduzir:', error);
            this.translatedNews = this.news;
        } finally {
            this.isTranslating = false;
        }
    }

    async render() {
        if (!this.news.length) {
            this.log('⚠️ Nenhuma notícia para renderizar');
            return;
        }

        this.log(`🎨 Renderizando para: ${this.currentLocale}`);

        if (this.currentLocale !== 'pt-BR' && this.currentLocale !== 'pt') {
            await this.translateNews();
        } else {
            this.translatedNews = this.news;
        }

        const container = document.querySelector('.noticias-grid');
        if (!container) {
            console.error('❌ Container .noticias-grid não encontrado');
            return;
        }

        this.hideLoading();

        const newsToShow = this.translatedNews.slice(0, 6);
        container.innerHTML = newsToShow.map(news => this.createNewsCard(news)).join('');

        this.log(`✅ ${newsToShow.length} notícias renderizadas`);

        // Log da primeira notícia para debug
        if (newsToShow.length > 0) {
            this.log('📰 Primeira notícia renderizada:', {
                titulo: newsToShow[0].titulo,
                resumo: newsToShow[0].resumo.substring(0, 50)
            });
        }
    }

    createNewsCard(noticia) {
        const t = (key, params) => {
            if (window.i18n && window.i18n.t) {
                return window.i18n.t(key, params);
            }
            return key;
        };

        const date = this.formatDate(noticia.dataPublicacao);
        const categoryKey = this.getCategoryKey(noticia.categoria);
        const category = t(`categories.${categoryKey}`);
        const readMore = t('news.readMore');

        return `
      <article class="noticia-card" role="listitem">
        <img 
          src="${noticia.imagemDestaque?.url || '../assets/images/placeholder.jpg'}" 
          alt="${noticia.imagemDestaque?.alt || noticia.titulo}"
          loading="lazy"
          width="${noticia.imagemDestaque?.width || 800}"
          height="${noticia.imagemDestaque?.height || 500}"
        >
        <div class="noticia-conteudo">
          <span class="categoria-badge">${category}</span>
          <h3>${noticia.titulo}</h3>
          <p>${noticia.resumo}</p>
          <div class="noticia-meta">
            <time datetime="${noticia.dataPublicacao}">${date}</time>
            ${noticia.tempoLeitura ? `<span>${noticia.tempoLeitura} min</span>` : ''}
          </div>
          <a href="#${noticia.slug}" class="ler-mais" aria-label="${readMore} - ${noticia.titulo}">
            ${readMore}
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </article>
    `;
    }

    getCategoryKey(categoria) {
        const map = {
            'Tecnologia': 'technology',
            'Educação': 'education',
            'Inovação Social': 'innovation',
            'Conectividade': 'connectivity',
            'Inteligência Artificial': 'ai',
            'Região': 'region'
        };
        return map[categoria] || 'technology';
    }

    formatDate(dateString) {
        if (window.i18n && typeof window.i18n.formatDate === 'function') {
            return window.i18n.formatDate(dateString);
        }
        return new Date(dateString).toLocaleDateString();
    }

    showLoading() {
        const container = document.querySelector('.noticias-grid');
        if (container) {
            container.innerHTML = `
        <div class="loading-spinner" role="status">
          <div class="spinner"></div>
          <p>${window.i18n ? window.i18n.t('loading') : 'Carregando...'}</p>
        </div>
      `;
        }
    }

    showTranslating() {
        const container = document.querySelector('.noticias-grid');
        if (container) {
            container.innerHTML = `
        <div class="loading-spinner translation-spinner" role="status">
          <div class="spinner"></div>
          <p id="translation-progress">🌐 Traduzindo...</p>
          <small style="color: #718096; margin-top: 0.5rem;">Aguarde ~5 segundos</small>
        </div>
      `;
        }
    }

    updateTranslationProgress(percent, current, total) {
        const progress = document.getElementById('translation-progress');
        if (progress) {
            progress.innerHTML = `
                🌐 Traduzindo...<br>
                <strong style="font-size: 1.5rem; color: #667eea;">${percent}%</strong><br>
                <small>${current}/${total} notícias</small>
            `;
        }
    }

    hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.remove();
    }

    showError() {
        const container = document.querySelector('.noticias-grid');
        if (container) {
            container.innerHTML = `
        <div class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Erro ao carregar notícias</p>
          <button onclick="window.newsManager.loadNews().then(() => window.newsManager.render())" class="retry-button">
            Tentar novamente
          </button>
        </div>
      `;
        }
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando V4 (Google Translate + DEBUG)...');

    window.newsManager = new NewsManager();
    window.translator = window.newsManager.translator;

    console.log('✅ Pronto! Modo DEBUG ativado');
    console.log('💡 Comandos úteis:');
    console.log('   - window.translator.clearCache() // Limpar cache');
    console.log('   - window.translator.translate("texto", "ja") // Testar japonês');
});

console.log('📦 main.js carregado (DEBUG MODE)');