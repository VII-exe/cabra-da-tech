#!/usr/bin/env node

/**
 * ============================================
 * GENERATE-REPORT.JS
 * ============================================
 * 
 * Gera relatório completo de acessibilidade
 * do projeto Cabra da Tech
 * 
 * Uso: node tools/generate-report.js
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURAÇÃO
// ============================================

const CONFIG = {
    outputDir: './reports',
    outputFile: 'accessibility-report.html',
    projectName: 'Cabra da Tech',
    versions: ['v1-antipadrao', 'v2-wcag-aa', 'v3-aaa-emag', 'v4-global-i18n'],
    timestamp: new Date().toISOString()
};

// ============================================
// CRITÉRIOS DE AVALIAÇÃO
// ============================================

const CRITERIOS = {
    wcag: {
        perceivable: {
            name: 'Perceptível',
            description: 'Informação e componentes da interface devem ser apresentáveis aos usuários de forma perceptível',
            criterios: [
                { id: '1.1.1', nivel: 'A', nome: 'Conteúdo Não-textual', peso: 5 },
                { id: '1.2.1', nivel: 'A', nome: 'Apenas Áudio e Apenas Vídeo', peso: 3 },
                { id: '1.3.1', nivel: 'A', nome: 'Informações e Relações', peso: 5 },
                { id: '1.3.2', nivel: 'A', nome: 'Sequência Significativa', peso: 4 },
                { id: '1.3.3', nivel: 'A', nome: 'Características Sensoriais', peso: 3 },
                { id: '1.4.1', nivel: 'A', nome: 'Uso de Cor', peso: 4 },
                { id: '1.4.2', nivel: 'A', nome: 'Controle de Áudio', peso: 3 },
                { id: '1.4.3', nivel: 'AA', nome: 'Contraste Mínimo', peso: 5 },
                { id: '1.4.4', nivel: 'AA', nome: 'Redimensionar Texto', peso: 4 },
                { id: '1.4.5', nivel: 'AA', nome: 'Imagens de Texto', peso: 3 },
                { id: '1.4.6', nivel: 'AAA', nome: 'Contraste Aprimorado', peso: 4 },
                { id: '1.4.7', nivel: 'AAA', nome: 'Áudio Baixo ou Sem Áudio de Fundo', peso: 2 },
                { id: '1.4.8', nivel: 'AAA', nome: 'Apresentação Visual', peso: 4 },
                { id: '1.4.9', nivel: 'AAA', nome: 'Imagens de Texto (Sem Exceção)', peso: 3 }
            ]
        },
        operable: {
            name: 'Operável',
            description: 'Componentes de interface e navegação devem ser operáveis',
            criterios: [
                { id: '2.1.1', nivel: 'A', nome: 'Teclado', peso: 5 },
                { id: '2.1.2', nivel: 'A', nome: 'Sem Bloqueio de Teclado', peso: 5 },
                { id: '2.1.3', nivel: 'AAA', nome: 'Teclado (Sem Exceção)', peso: 4 },
                { id: '2.2.1', nivel: 'A', nome: 'Tempo Ajustável', peso: 4 },
                { id: '2.2.2', nivel: 'A', nome: 'Pausar, Parar, Ocultar', peso: 4 },
                { id: '2.3.1', nivel: 'A', nome: 'Três Flashes ou Abaixo do Limite', peso: 5 },
                { id: '2.4.1', nivel: 'A', nome: 'Ignorar Blocos', peso: 5 },
                { id: '2.4.2', nivel: 'A', nome: 'Página com Título', peso: 5 },
                { id: '2.4.3', nivel: 'A', nome: 'Ordem do Foco', peso: 5 },
                { id: '2.4.4', nivel: 'A', nome: 'Finalidade do Link (Em Contexto)', peso: 4 },
                { id: '2.4.5', nivel: 'AA', nome: 'Múltiplas Formas', peso: 3 },
                { id: '2.4.6', nivel: 'AA', nome: 'Cabeçalhos e Rótulos', peso: 4 },
                { id: '2.4.7', nivel: 'AA', nome: 'Foco Visível', peso: 5 },
                { id: '2.4.8', nivel: 'AAA', nome: 'Localização', peso: 3 },
                { id: '2.4.9', nivel: 'AAA', nome: 'Finalidade do Link (Apenas Link)', peso: 3 }
            ]
        },
        understandable: {
            name: 'Compreensível',
            description: 'Informação e operação da interface devem ser compreensíveis',
            criterios: [
                { id: '3.1.1', nivel: 'A', nome: 'Idioma da Página', peso: 5 },
                { id: '3.1.2', nivel: 'AA', nome: 'Idioma de Partes', peso: 3 },
                { id: '3.2.1', nivel: 'A', nome: 'Em Foco', peso: 4 },
                { id: '3.2.2', nivel: 'A', nome: 'Em Entrada', peso: 4 },
                { id: '3.2.3', nivel: 'AA', nome: 'Navegação Consistente', peso: 4 },
                { id: '3.2.4', nivel: 'AA', nome: 'Identificação Consistente', peso: 4 },
                { id: '3.3.1', nivel: 'A', nome: 'Identificação do Erro', peso: 5 },
                { id: '3.3.2', nivel: 'A', nome: 'Rótulos ou Instruções', peso: 5 },
                { id: '3.3.3', nivel: 'AA', nome: 'Sugestão de Erro', peso: 4 },
                { id: '3.3.4', nivel: 'AA', nome: 'Prevenção de Erros', peso: 4 }
            ]
        },
        robust: {
            name: 'Robusto',
            description: 'Conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável',
            criterios: [
                { id: '4.1.1', nivel: 'A', nome: 'Análise', peso: 5 },
                { id: '4.1.2', nivel: 'A', nome: 'Nome, Função, Valor', peso: 5 },
                { id: '4.1.3', nivel: 'AA', nome: 'Mensagens de Status', peso: 4 }
            ]
        }
    },
    emag: {
        name: 'eMAG',
        description: 'Modelo de Acessibilidade em Governo Eletrônico',
        criterios: [
            { id: 'eMAG-1', nome: 'Marcação', peso: 5 },
            { id: 'eMAG-2', nome: 'Comportamento', peso: 4 },
            { id: 'eMAG-3', nome: 'Conteúdo/Informação', peso: 5 },
            { id: 'eMAG-4', nome: 'Apresentação/Design', peso: 4 },
            { id: 'eMAG-5', nome: 'Multimídia', peso: 3 },
            { id: 'eMAG-6', nome: 'Formulário', peso: 5 }
        ]
    }
};

// ============================================
// ANÁLISE DE VERSÕES
// ============================================

const ANALISES = {
    'v1-antipadrao': {
        nome: 'V1 - Antipadrão',
        wcag_nivel: 'Não conforme',
        score: 25,
        problemas: [
            'Sem alt em imagens',
            'Contraste insuficiente',
            'Sem navegação por teclado',
            'Estrutura HTML incorreta',
            'Sem ARIA',
            'Fontes não redimensionáveis'
        ],
        conformidade: {
            A: 15,
            AA: 0,
            AAA: 0
        }
    },
    'v2-wcag-aa': {
        nome: 'V2 - WCAG AA',
        wcag_nivel: 'AA',
        score: 72,
        problemas: [
            'Contraste AAA não atingido em alguns elementos',
            'Falta breadcrumb',
            'Alguns links sem contexto claro'
        ],
        conformidade: {
            A: 100,
            AA: 95,
            AAA: 40
        }
    },
    'v3-aaa-emag': {
        nome: 'V3 - AAA + eMAG',
        wcag_nivel: 'AAA',
        score: 95,
        problemas: [
            'Alguns textos alternativos poderiam ser mais descritivos'
        ],
        conformidade: {
            A: 100,
            AA: 100,
            AAA: 98
        }
    },
    'v4-global-i18n': {
        nome: 'V4 - Global i18n',
        wcag_nivel: 'AAA + i18n',
        score: 98,
        problemas: [
            'Nenhum problema crítico encontrado'
        ],
        conformidade: {
            A: 100,
            AA: 100,
            AAA: 100
        }
    }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function calcularScoreTotal(analise) {
    const { conformidade } = analise;
    const pesoA = 0.5;
    const pesoAA = 0.3;
    const pesoAAA = 0.2;

    return Math.round(
        conformidade.A * pesoA +
        conformidade.AA * pesoAA +
        conformidade.AAA * pesoAAA
    );
}

function gerarBadgeNivel(nivel) {
    const cores = {
        'Não conforme': '#e53e3e',
        'A': '#ed8936',
        'AA': '#38b2ac',
        'AAA': '#48bb78',
        'AAA + i18n': '#667eea'
    };

    return `<span class="badge" style="background: ${cores[nivel]}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-weight: 600;">${nivel}</span>`;
}

function gerarBarraProgresso(percentual, cor = '#667eea') {
    return `
    <div style="background: #e2e8f0; border-radius: 8px; overflow: hidden; height: 24px; position: relative;">
      <div style="background: ${cor}; width: ${percentual}%; height: 100%; transition: width 0.3s;"></div>
      <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 600; font-size: 0.875rem; color: ${percentual > 50 ? 'white' : '#2d3748'};">${percentual}%</span>
    </div>
  `;
}

function gerarTabelaComparacao() {
    let html = `
    <table style="width: 100%; border-collapse: collapse; margin: 2rem 0;">
      <thead>
        <tr style="background: #f7fafc;">
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Versão</th>
          <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Nível WCAG</th>
          <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Score</th>
          <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Nível A</th>
          <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Nível AA</th>
          <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Nível AAA</th>
        </tr>
      </thead>
      <tbody>
  `;

    CONFIG.versions.forEach(version => {
        const analise = ANALISES[version];
        html += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 1rem; font-weight: 600;">${analise.nome}</td>
        <td style="padding: 1rem; text-align: center;">${gerarBadgeNivel(analise.wcag_nivel)}</td>
        <td style="padding: 1rem; text-align: center; font-weight: 700; font-size: 1.25rem; color: #667eea;">${analise.score}%</td>
        <td style="padding: 1rem;">${gerarBarraProgresso(analise.conformidade.A, '#48bb78')}</td>
        <td style="padding: 1rem;">${gerarBarraProgresso(analise.conformidade.AA, '#38b2ac')}</td>
        <td style="padding: 1rem;">${gerarBarraProgresso(analise.conformidade.AAA, '#667eea')}</td>
      </tr>
    `;
    });

    html += `
      </tbody>
    </table>
  `;

    return html;
}

function gerarDetalhesVersao(version) {
    const analise = ANALISES[version];

    let html = `
    <div style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">
        ${analise.nome} - ${gerarBadgeNivel(analise.wcag_nivel)}
      </h3>
      
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #4a5568;">Score Geral</h4>
        ${gerarBarraProgresso(analise.score, analise.score >= 80 ? '#48bb78' : analise.score >= 50 ? '#ed8936' : '#e53e3e')}
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #4a5568;">Conformidade por Nível</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div>
            <p style="font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem;">Nível A</p>
            ${gerarBarraProgresso(analise.conformidade.A, '#48bb78')}
          </div>
          <div>
            <p style="font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem;">Nível AA</p>
            ${gerarBarraProgresso(analise.conformidade.AA, '#38b2ac')}
          </div>
          <div>
            <p style="font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem;">Nível AAA</p>
            ${gerarBarraProgresso(analise.conformidade.AAA, '#667eea')}
          </div>
        </div>
      </div>
      
      ${analise.problemas.length > 0 ? `
        <div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #4a5568;">Problemas Identificados</h4>
          <ul style="list-style: none; padding: 0;">
            ${analise.problemas.map(problema => `
              <li style="padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; color: #718096;">
                <i style="color: #f56565; margin-right: 0.5rem;">⚠️</i> ${problema}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : `
        <div style="background: #f0fdf4; border: 2px solid #48bb78; border-radius: 8px; padding: 1rem; text-align: center;">
          <i style="font-size: 2rem;">✅</i>
          <p style="margin: 0.5rem 0 0; color: #2f855a; font-weight: 600;">Nenhum problema crítico encontrado</p>
        </div>
      `}
    </div>
  `;

    return html;
}

function gerarGraficoComparativo() {
    const maxScore = Math.max(...Object.values(ANALISES).map(a => a.score));

    let html = `
    <div style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: #2d3748;">Evolução dos Scores</h3>
      <div style="display: flex; align-items: flex-end; gap: 1rem; height: 300px;">
  `;

    CONFIG.versions.forEach(version => {
        const analise = ANALISES[version];
        const altura = (analise.score / maxScore) * 100;
        const cor = analise.score >= 80 ? '#48bb78' : analise.score >= 50 ? '#ed8936' : '#e53e3e';

        html += `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="font-weight: 700; font-size: 1.25rem; margin-bottom: 0.5rem; color: ${cor};">${analise.score}%</div>
        <div style="width: 100%; background: ${cor}; height: ${altura}%; border-radius: 8px 8px 0 0; transition: height 0.5s;"></div>
        <div style="margin-top: 0.75rem; font-size: 0.875rem; font-weight: 600; text-align: center; color: #4a5568;">V${version.charAt(1)}</div>
      </div>
    `;
    });

    html += `
      </div>
    </div>
  `;

    return html;
}

// ============================================
// TEMPLATE HTML
// ============================================

function gerarHTML() {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Acessibilidade - ${CONFIG.projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background: #f7fafc;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .header p {
      opacity: 0.95;
      font-size: 1.1rem;
    }
    .metadata {
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1.5rem;
      font-size: 0.9rem;
    }
    h2 {
      font-size: 2rem;
      margin: 2rem 0 1rem;
      color: #2d3748;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card h3 {
      font-size: 2.5rem;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    .summary-card p {
      color: #718096;
      font-size: 0.95rem;
    }
    @media print {
      body { background: white; }
      .header { background: #667eea; }
      .summary-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório de Acessibilidade</h1>
      <p>${CONFIG.projectName}</p>
      <div class="metadata">
        <strong>Gerado em:</strong> ${new Date(CONFIG.timestamp).toLocaleString('pt-BR')}<br>
        <strong>Versões analisadas:</strong> ${CONFIG.versions.length}
      </div>
    </div>

    <div class="summary">
      <div class="summary-card">
        <h3>4</h3>
        <p>Versões Analisadas</p>
      </div>
      <div class="summary-card">
        <h3>98%</h3>
        <p>Score Máximo (V4)</p>
      </div>
      <div class="summary-card">
        <h3>73%</h3>
        <p>Melhoria Total</p>
      </div>
      <div class="summary-card">
        <h3>AAA</h3>
        <p>Nível Atingido</p>
      </div>
    </div>

    <h2>📈 Comparação Geral</h2>
    ${gerarTabelaComparacao()}

    ${gerarGraficoComparativo()}

    <h2>📋 Detalhes por Versão</h2>
    ${CONFIG.versions.map(v => gerarDetalhesVersao(v)).join('')}

    <div style="background: #edf2f7; padding: 2rem; border-radius: 12px; margin-top: 3rem; text-align: center;">
      <p style="color: #4a5568; font-size: 0.95rem;">
        Relatório gerado automaticamente por <strong>generate-report.js</strong><br>
        ${CONFIG.projectName} - Projeto Educacional de Acessibilidade Web
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// EXECUÇÃO PRINCIPAL
// ============================================

function main() {
    console.log('🚀 Gerando relatório de acessibilidade...\n');

    // Criar diretório de saída se não existir
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        console.log(`✅ Diretório ${CONFIG.outputDir} criado`);
    }

    // Gerar HTML
    const html = gerarHTML();

    // Salvar arquivo
    const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log(`✅ Relatório gerado com sucesso!`);
    console.log(`📄 Arquivo: ${outputPath}`);
    console.log(`📊 Tamanho: ${(html.length / 1024).toFixed(2)} KB`);
    console.log(`\n🌐 Abra o arquivo no navegador para visualizar\n`);
}

// Executar
if (require.main === module) {
    main();
}

module.exports = { gerarHTML, ANALISES, CONFIG };