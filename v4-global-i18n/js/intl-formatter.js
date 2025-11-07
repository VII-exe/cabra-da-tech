/**
 * ============================================
 * INTL FORMATTER - Formatação Internacional
 * ============================================
 * 
 * Formata datas, números, moedas e horários
 * usando a API Intl do JavaScript
 * 
 * Funcionalidades:
 * - Formatação de datas (relativas e absolutas)
 * - Formatação de números (inteiros, decimais, percentuais)
 * - Formatação de moedas
 * - Formatação de horários
 * - Formatação de listas
 * - Nomes de meses e dias da semana
 * - Suporte completo a todos os 7 idiomas
 */

(function () {
    'use strict';

    // ============================================
    // CLASSE INTL FORMATTER
    // ============================================

    class IntlFormatter {
        constructor() {
            this.locale = 'pt-BR';
            this.cache = new Map();
            this.formatters = {};
        }

        /**
         * Definir idioma/locale
         * @param {string} locale - Código do idioma
         */
        setLocale(locale) {
            if (this.locale !== locale) {
                this.locale = locale;
                this.clearCache();
                console.log(`🌍 IntlFormatter: idioma definido para ${locale}`);
            }
        }

        /**
         * Obter idioma atual
         * @returns {string}
         */
        getLocale() {
            return this.locale;
        }

        /**
         * Limpar cache de formatadores
         */
        clearCache() {
            this.cache.clear();
            this.formatters = {};
        }

        /**
         * Obter ou criar formatador com cache
         * @private
         */
        _getFormatter(type, options) {
            const cacheKey = `${type}_${this.locale}_${JSON.stringify(options)}`;

            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            let formatter;
            switch (type) {
                case 'date':
                    formatter = new Intl.DateTimeFormat(this.locale, options);
                    break;
                case 'number':
                    formatter = new Intl.NumberFormat(this.locale, options);
                    break;
                case 'list':
                    formatter = new Intl.ListFormat(this.locale, options);
                    break;
                case 'relative':
                    formatter = new Intl.RelativeTimeFormat(this.locale, options);
                    break;
                default:
                    throw new Error(`Tipo de formatador desconhecido: ${type}`);
            }

            this.cache.set(cacheKey, formatter);
            return formatter;
        }

        // ============================================
        // FORMATAÇÃO DE DATAS
        // ============================================

        /**
         * Formatar data
         * @param {Date|string|number} date - Data a formatar
         * @param {object} options - Opções Intl.DateTimeFormat
         * @returns {string} Data formatada
         */
        formatDate(date, options = {}) {
            if (!date) return '';

            const dateObj = date instanceof Date ? date : new Date(date);

            if (isNaN(dateObj.getTime())) {
                console.warn('Data inválida:', date);
                return String(date);
            }

            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            const mergedOptions = { ...defaultOptions, ...options };
            const formatter = this._getFormatter('date', mergedOptions);

            return formatter.format(dateObj);
        }

        /**
         * Formatar data curta (DD/MM/YYYY ou MM/DD/YYYY)
         * @param {Date|string|number} date
         * @returns {string}
         */
        formatDateShort(date) {
            return this.formatDate(date, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        /**
         * Formatar data longa (1 de janeiro de 2025)
         * @param {Date|string|number} date
         * @returns {string}
         */
        formatDateLong(date) {
            return this.formatDate(date, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        }

        /**
         * Formatar data e hora
         * @param {Date|string|number} date
         * @returns {string}
         */
        formatDateTime(date) {
            return this.formatDate(date, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        /**
         * Formatar apenas horário
         * @param {Date|string|number} date
         * @returns {string}
         */
        formatTime(date) {
            if (!date) return '';

            const dateObj = date instanceof Date ? date : new Date(date);

            const formatter = this._getFormatter('date', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: this.locale === 'en' // AM/PM para inglês
            });

            return formatter.format(dateObj);
        }

        /**
         * Formatar data relativa (há 2 dias, em 3 semanas)
         * @param {Date|string|number} date
         * @returns {string}
         */
        formatRelativeTime(date) {
            if (!date) return '';

            const dateObj = date instanceof Date ? date : new Date(date);
            const now = new Date();
            const diffMs = dateObj.getTime() - now.getTime();
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);

            const formatter = this._getFormatter('relative', { numeric: 'auto' });

            // Determinar unidade apropriada
            if (Math.abs(diffYears) >= 1) {
                return formatter.format(diffYears, 'year');
            } else if (Math.abs(diffMonths) >= 1) {
                return formatter.format(diffMonths, 'month');
            } else if (Math.abs(diffDays) >= 1) {
                return formatter.format(diffDays, 'day');
            } else if (Math.abs(diffHours) >= 1) {
                return formatter.format(diffHours, 'hour');
            } else if (Math.abs(diffMinutes) >= 1) {
                return formatter.format(diffMinutes, 'minute');
            } else {
                return formatter.format(diffSeconds, 'second');
            }
        }

        /**
         * Obter nome do mês
         * @param {number} month - Mês (0-11)
         * @param {string} format - 'long' ou 'short'
         * @returns {string}
         */
        getMonthName(month, format = 'long') {
            const date = new Date(2000, month, 1);
            const formatter = this._getFormatter('date', { month: format });
            return formatter.format(date);
        }

        /**
         * Obter nome do dia da semana
         * @param {number} day - Dia (0=domingo, 6=sábado)
         * @param {string} format - 'long' ou 'short'
         * @returns {string}
         */
        getDayName(day, format = 'long') {
            // 2023-01-01 foi um domingo
            const date = new Date(2023, 0, day + 1);
            const formatter = this._getFormatter('date', { weekday: format });
            return formatter.format(date);
        }

        // ============================================
        // FORMATAÇÃO DE NÚMEROS
        // ============================================

        /**
         * Formatar número
         * @param {number} num - Número a formatar
         * @param {object} options - Opções Intl.NumberFormat
         * @returns {string}
         */
        formatNumber(num, options = {}) {
            if (num === null || num === undefined || isNaN(num)) {
                return String(num);
            }

            const formatter = this._getFormatter('number', options);
            return formatter.format(num);
        }

        /**
         * Formatar número inteiro
         * @param {number} num
         * @returns {string}
         */
        formatInteger(num) {
            return this.formatNumber(num, {
                maximumFractionDigits: 0
            });
        }

        /**
         * Formatar número decimal
         * @param {number} num
         * @param {number} decimals - Casas decimais (padrão: 2)
         * @returns {string}
         */
        formatDecimal(num, decimals = 2) {
            return this.formatNumber(num, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        }

        /**
         * Formatar percentual
         * @param {number} num - Valor (0.15 = 15%)
         * @param {number} decimals - Casas decimais
         * @returns {string}
         */
        formatPercent(num, decimals = 0) {
            return this.formatNumber(num, {
                style: 'percent',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        }

        /**
         * Formatar número compacto (1.5K, 2.3M)
         * @param {number} num
         * @returns {string}
         */
        formatCompact(num) {
            return this.formatNumber(num, {
                notation: 'compact',
                compactDisplay: 'short'
            });
        }

        // ============================================
        // FORMATAÇÃO DE MOEDAS
        // ============================================

        /**
         * Obter moeda padrão do locale
         * @returns {string}
         */
        getDefaultCurrency() {
            const currencyMap = {
                'pt-BR': 'BRL',
                'en': 'USD',
                'es': 'EUR',
                'ar': 'SAR',
                'hi': 'INR',
                'ja': 'JPY',
                'ru': 'RUB'
            };
            return currencyMap[this.locale] || 'USD';
        }

        /**
         * Formatar moeda
         * @param {number} amount - Valor
         * @param {string} currency - Código da moeda (BRL, USD, EUR...)
         * @param {object} options - Opções adicionais
         * @returns {string}
         */
        formatCurrency(amount, currency = null, options = {}) {
            if (amount === null || amount === undefined || isNaN(amount)) {
                return String(amount);
            }

            currency = currency || this.getDefaultCurrency();

            const defaultOptions = {
                style: 'currency',
                currency: currency
            };

            const mergedOptions = { ...defaultOptions, ...options };
            const formatter = this._getFormatter('number', mergedOptions);

            return formatter.format(amount);
        }

        /**
         * Formatar moeda sem centavos
         * @param {number} amount
         * @param {string} currency
         * @returns {string}
         */
        formatCurrencyInteger(amount, currency = null) {
            return this.formatCurrency(amount, currency, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }

        // ============================================
        // FORMATAÇÃO DE LISTAS
        // ============================================

        /**
         * Formatar lista de itens
         * @param {Array} items - Array de strings
         * @param {string} type - 'conjunction' (e), 'disjunction' (ou), 'unit'
         * @returns {string}
         */
        formatList(items, type = 'conjunction') {
            if (!Array.isArray(items) || items.length === 0) {
                return '';
            }

            // Para um único item
            if (items.length === 1) {
                return String(items[0]);
            }

            const formatter = this._getFormatter('list', {
                style: 'long',
                type: type
            });

            return formatter.format(items);
        }

        /**
         * Formatar lista com "e" (A, B e C)
         * @param {Array} items
         * @returns {string}
         */
        formatListAnd(items) {
            return this.formatList(items, 'conjunction');
        }

        /**
         * Formatar lista com "ou" (A, B ou C)
         * @param {Array} items
         * @returns {string}
         */
        formatListOr(items) {
            return this.formatList(items, 'disjunction');
        }

        // ============================================
        // UTILITÁRIOS
        // ============================================

        /**
         * Formatar tamanho de arquivo (bytes)
         * @param {number} bytes
         * @param {number} decimals
         * @returns {string}
         */
        formatFileSize(bytes, decimals = 1) {
            if (bytes === 0) return '0 Bytes';
            if (!bytes || isNaN(bytes)) return '-';

            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));

            const value = bytes / Math.pow(k, i);

            return `${this.formatDecimal(value, decimals)} ${sizes[i]}`;
        }

        /**
         * Formatar duração (segundos para HH:MM:SS)
         * @param {number} seconds
         * @returns {string}
         */
        formatDuration(seconds) {
            if (!seconds || isNaN(seconds)) return '00:00';

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            if (hours > 0) {
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            } else {
                return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
        }

        /**
         * Formatar número de telefone (BR)
         * @param {string} phone
         * @returns {string}
         */
        formatPhoneBR(phone) {
            if (!phone) return '';

            // Remover caracteres não numéricos
            const cleaned = phone.replace(/\D/g, '');

            // Formatar baseado no tamanho
            if (cleaned.length === 11) {
                // Celular: (99) 99999-9999
                return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
            } else if (cleaned.length === 10) {
                // Fixo: (99) 9999-9999
                return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
            }

            return phone;
        }

        /**
         * Formatar CPF (BR)
         * @param {string} cpf
         * @returns {string}
         */
        formatCPF(cpf) {
            if (!cpf) return '';

            const cleaned = cpf.replace(/\D/g, '');

            if (cleaned.length === 11) {
                return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
            }

            return cpf;
        }

        /**
         * Formatar CNPJ (BR)
         * @param {string} cnpj
         * @returns {string}
         */
        formatCNPJ(cnpj) {
            if (!cnpj) return '';

            const cleaned = cnpj.replace(/\D/g, '');

            if (cleaned.length === 14) {
                return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
            }

            return cnpj;
        }

        /**
         * Formatar CEP (BR)
         * @param {string} cep
         * @returns {string}
         */
        formatCEP(cep) {
            if (!cep) return '';

            const cleaned = cep.replace(/\D/g, '');

            if (cleaned.length === 8) {
                return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
            }

            return cep;
        }

        // ============================================
        // FORMATAÇÃO AUTOMÁTICA DE ELEMENTOS
        // ============================================

        /**
         * Formatar automaticamente elementos com data-format
         */
        formatElements() {
            // Datas
            document.querySelectorAll('[data-format="date"]').forEach(el => {
                const date = el.getAttribute('data-value') || el.textContent;
                el.textContent = this.formatDate(date);
            });

            document.querySelectorAll('[data-format="datetime"]').forEach(el => {
                const date = el.getAttribute('data-value') || el.textContent;
                el.textContent = this.formatDateTime(date);
            });

            document.querySelectorAll('[data-format="time"]').forEach(el => {
                const date = el.getAttribute('data-value') || el.textContent;
                el.textContent = this.formatTime(date);
            });

            document.querySelectorAll('[data-format="relative"]').forEach(el => {
                const date = el.getAttribute('data-value') || el.textContent;
                el.textContent = this.formatRelativeTime(date);
            });

            // Números
            document.querySelectorAll('[data-format="number"]').forEach(el => {
                const num = parseFloat(el.getAttribute('data-value') || el.textContent);
                el.textContent = this.formatNumber(num);
            });

            document.querySelectorAll('[data-format="integer"]').forEach(el => {
                const num = parseFloat(el.getAttribute('data-value') || el.textContent);
                el.textContent = this.formatInteger(num);
            });

            document.querySelectorAll('[data-format="decimal"]').forEach(el => {
                const num = parseFloat(el.getAttribute('data-value') || el.textContent);
                const decimals = parseInt(el.getAttribute('data-decimals')) || 2;
                el.textContent = this.formatDecimal(num, decimals);
            });

            document.querySelectorAll('[data-format="percent"]').forEach(el => {
                const num = parseFloat(el.getAttribute('data-value') || el.textContent);
                el.textContent = this.formatPercent(num);
            });

            // Moeda
            document.querySelectorAll('[data-format="currency"]').forEach(el => {
                const amount = parseFloat(el.getAttribute('data-value') || el.textContent);
                const currency = el.getAttribute('data-currency');
                el.textContent = this.formatCurrency(amount, currency);
            });

            console.log('✅ Elementos formatados automaticamente');
        }

        /**
         * Inicializar formatador
         * @param {string} locale
         */
        init(locale = null) {
            console.log('🚀 Inicializando IntlFormatter...');

            if (locale) {
                this.setLocale(locale);
            }

            // Formatar elementos existentes
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.formatElements();
                });
            } else {
                this.formatElements();
            }

            console.log('✅ IntlFormatter inicializado');
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    // Criar instância global
    window.IntlFormatter = new IntlFormatter();

    // Sincronizar com mudanças de idioma
    window.addEventListener('localedetected', (event) => {
        window.IntlFormatter.setLocale(event.detail.locale);
    });

    window.addEventListener('i18nchanged', (event) => {
        window.IntlFormatter.setLocale(event.detail.locale);
        window.IntlFormatter.formatElements();
    });

    // Inicializar quando i18n estiver pronto
    window.addEventListener('i18nready', (event) => {
        window.IntlFormatter.init(event.detail.locale);
    });

    // ============================================
    // API GLOBAL (ATALHOS)
    // ============================================

    window.formatDate = (date, options) => window.IntlFormatter.formatDate(date, options);
    window.formatNumber = (num, options) => window.IntlFormatter.formatNumber(num, options);
    window.formatCurrency = (amount, currency) => window.IntlFormatter.formatCurrency(amount, currency);
    window.formatRelativeTime = (date) => window.IntlFormatter.formatRelativeTime(date);

    console.log('✅ IntlFormatter carregado');
    console.log('📦 API global disponível:', {
        IntlFormatter: 'window.IntlFormatter',
        formatDate: 'window.formatDate(date)',
        formatNumber: 'window.formatNumber(num)',
        formatCurrency: 'window.formatCurrency(amount, currency)',
        formatRelativeTime: 'window.formatRelativeTime(date)'
    });

})();