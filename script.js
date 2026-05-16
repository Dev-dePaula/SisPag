// ==========================================
// 1. ESTRUTURA E ARRAYS DE DADOS (DATABASE)
// ==========================================

const database = {
  // Instâncias criadas conforme o desenho enviado no papel
  instancias: {
    zait: {
      titulo: "Zait Pay",
      subtitulo: "Contas Nominais Individuais - PJ / PF",
      cor: "linear-gradient(to right, #22d3ee, #3b82f6)",
      badgeTitle: "Módulo Individual Ativo",
      badgeDesc: "Operando em regime de contas individualizadas (PIX, Cartão, Boleto, Link, Maquininhas)."
    },
    voltz: {
      titulo: "Voltz Pay",
      subtitulo: "Contas Bolsão - PJ / PF (Pool Group)",
      cor: "linear-gradient(to right, #a855f7, #ec4899)",
      badgeTitle: "Módulo Pooling Ativo",
      badgeDesc: "Operando em regime de contas agrupadas/bolsão com motor nativo de Split de Pagamentos."
    },
    admin: {
      titulo: "Core Admin",
      subtitulo: "Painel de Controle Central - Zait / Voltz",
      cor: "linear-gradient(to right, #e2e8f0, #94a3b8)",
      badgeTitle: "Geral Infraestrutura",
      badgeDesc: "Visão global de adquirentes, webhooks consolidados e logs de auditoria das sub-instâncias."
    }
  },
  
  // Lista unificada categorizada por provedor/instancia
  cobrancas: [
    { id: '#UP-1001', cliente: 'João Silva', valor: 150.00, metodo: 'PIX', status: 'Pago', vencimento: '2026-05-10', provedor: 'zait' },
    { id: '#UP-1002', cliente: 'Maria Souza', valor: 320.00, metodo: 'Cartão', status: 'Pendente', vencimento: '2026-05-20', provedor: 'zait' },
    { id: '#UP-1003', cliente: 'Carlos Mendes', valor: 89.90, metodo: 'Boleto', status: 'Vencida', vencimento: '2026-05-05', provedor: 'zait' },
    { id: '#UP-2001', cliente: 'Marketplace Alfa', valor: 1500.00, metodo: 'PIX', status: 'Pago', vencimento: '2026-05-14', provedor: 'voltz', split: '70% Loja / 30% Admin' }
  ],
  
  clientes: [
    { id: '#CLI-01', nome: 'João Silva', email: 'joao@email.com', fone: '(17) 99999-1111', status: 'Ativo', provedor: 'zait' },
    { id: '#CLI-02', nome: 'Maria Souza', email: 'maria@email.com', fone: '(17) 99999-2222', status: 'Ativo', provedor: 'zait' },
    { id: '#CLI-03', nome: 'Carlos Mendes', email: 'carlos@email.com', fone: '(17) 99999-3333', status: 'Sem Movimento', provedor: 'zait' },
    { id: '#CLI-04', nome: 'Marketplace Alfa', email: 'alfa@email.com', fone: '(11) 98888-4444', status: 'Ativo', provedor: 'voltz' }
  ],

  assinaturas: [
    { id: '#CON-501', cliente: 'João Silva', valor: 'R$ 1.200,00', parcelas: '12x', forma: 'PIX', data: '15/05/2026', provedor: 'zait' }
  ],

  splits: [
    { id: '#SPL-01', contrato: 'Split Marketplace Alfa', taxaFixa: 'R$ 0,99', porcentagem: '70% / 30%', status: 'Ativo' }
  ],

  logs: [
    { data: '16/05/2026 11:20', acao: 'Core Engine inicializado.' }
  ],

  configuracoes: {
    whatsappToken: '68df6g78sd6f87g6sd8f76g8',
    apiBaasKey: 'live_key_universalpay_prod_09123',
    webhookZait: 'https://api.zaitpay.com.br/v1/webhooks',
    webhookVoltz: 'https://api.voltzpay.com.br/v1/webhooks'
  }
};

// ==========================================
// 2. MOTOR CORE MULTITENANCY (CONTROLE DE ACESSOS)
// ==========================================

let contextoAtual = 'admin'; // Contexto padrão ao carregar
let abaAtiva = 'dashboard';

const accountSelector = document.getElementById('globalAccountSelector');
const sidebarNav = document.getElementById('sidebarNav');

// Escuta a alteração do seletor de contas no topo
accountSelector.addEventListener('change', (e) => {
  contextoAtual = e.target.value;
  configurarLayoutPorContexto();
});

function configurarLayoutPorContexto() {
  const conf = database.instancias[contextoAtual];
  
  // Altera cores e branding baseados na conta escolhida
  const title = document.getElementById('mainBrandTitle');
  title.innerText = conf.titulo;
  title.style.background = conf.cor;
  title.style.webkitBackgroundClip = 'text';
  
  document.getElementById('mainBrandSubtitle').innerText = conf.subtitulo;
  document.getElementById('badgeWhiteLabelTitle').innerText = conf.badgeTitle;
  document.getElementById('badgeWhiteLabelDesc').innerText = conf.badgeDesc;

  // Monta o menu correto respeitando fielmente o desenho no papel
  montarMenuLateral();
}

function montarMenuLateral() {
  let menuHtml = '';

  if (contextoAtual === 'zait') {
    menuHtml = `
      <button class="nav-btn active" data-aba="dashboard">Dashboard</button>
      <button class="nav-btn" data-aba="cobrancas">Cobranças (PIX/Cartão/Boleto)</button>
      <button class="nav-btn" data-aba="clientes">Clientes (PJ/PF)</button>
      <button class="nav-btn" data-aba="assinaturas">Contratos/Links</button>
      <button class="nav-btn" data-aba="extrato">Extrato</button>
    `;
  } else if (contextoAtual === 'voltz') {
    menuHtml = `
      <button class="nav-btn active" data-aba="dashboard">Dashboard Pool</button>
      <button class="nav-btn" data-aba="cobrancas">Cobranças (Apenas PIX)</button>
      <button class="nav-btn" data-aba="split">Split de Pagamentos</button>
      <button class="nav-btn" data-aba="extrato">Extrato Bolsão</button>
    `;
  } else if (contextoAtual === 'admin') {
    menuHtml = `
      <button class="nav-btn active" data-aba="dashboard">Visão Geral Admin</button>
      <button class="nav-btn" data-aba="adquirentes">APIs BaaS & Adquirentes</button>
      <button class="nav-btn" data-aba="webhooks">Webhooks Unificados</button>
      <button class="nav-btn" data-aba="relatorios">Logs de Auditoria</button>
      <button class="nav-btn" data-aba="configuracoes">Configurações Core</button>
    `;
  }

  sidebarNav.innerHTML = menuHtml;
  abaAtiva = 'dashboard';
  carregarConteudoAba();

  // Reatribui eventos aos botões recém-criados
  const btns = sidebarNav.querySelectorAll('.nav-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      abaAtiva = btn.getAttribute('data-aba');
      carregarConteudoAba();
    });
  });
}

// Auxiliares de Renderização
const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
function registrarLog(acao) { database.logs.unshift({ data: new Date().toLocaleString('pt-BR'), acao: `[${contextoAtual.toUpperCase()}] ${acao}` }); }

// ==========================================
// 3. ROTEADOR DE TELAS (INJEÇÃO DE LAYOUTS)
// ==========================================

const mainContainer = document.getElementById('mainDynamicContent');

function carregarConteudoAba() {
  registrarLog(`Acessou a aba: ${abaAtiva}`);
  
  // DIRECIONAMENTO ADMIN GERAL
  if (contextoAtual === 'admin') {
    if (abaAtiva === 'dashboard') renderAdminDashboard();
    else if (abaAtiva === 'adquirentes') renderAdminAdquirentes();
    else if (abaAtiva === 'webhooks') renderAdminWebhooks();
    else if (abaAtiva === 'relatorios') renderAdminRelatorios();
    else if (abaAtiva === 'configuracoes') renderAdminConfiguracoes();
    return;
  }

  // DIRECIONAMENTO CONTAS DE CLIENTES (ZAIT E VOLTZ)
  if (abaAtiva === 'dashboard') renderClienteDashboard();
  else if (abaAtiva === 'cobrancas') renderClienteCobrancas();
  else if (abaAtiva === 'clientes') renderClientes(); 
  else if (abaAtiva === 'assinaturas') renderAssinaturas();
  else if (abaAtiva === 'split') renderVoltzSplit();
  else if (abaAtiva === 'extrato') renderClienteExtrato();
}

// ==========================================
// 4. RENDERS DE TELAS: CONTEXTO ADMIN
// ==========================================

function renderAdminDashboard() {
  const totZait = database.cobrancas.filter(c => c.provedor === 'zait' && c.status === 'Pago').reduce((a,c)=>a+c.valor, 0);
  const totVoltz = database.cobrancas.filter(c => c.provedor === 'voltz' && c.status === 'Pago').reduce((a,c)=>a+c.valor, 0);

  mainContainer.innerHTML = `
    <header class="main-header">
      <div><h2 class="page-title">Painel Administrativo Root</h2><p class="page-subtitle">Gerenciamento global de infraestrutura e gateways.</p></div>
    </header>
    <section class="metrics-grid">
      <div class="metric-card"><span class="metric-label">Volume Transacionado Zait</span><h3 class="metric-value">${formatarMoeda(totZait)}</h3><span class="badge badge-info">Contas Individuais</span></div>
      <div class="metric-card"><span class="metric-label">Volume Transacionado Voltz</span><h3 class="metric-value">${formatarMoeda(totVoltz)}</h3><span class="badge badge-brand">Contas Bolsão</span></div>
      <div class="metric-card"><span class="metric-label">Total Core Integrado</span><h3 class="metric-value">${formatarMoeda(totZait + totVoltz)}</h3><span class="badge badge-success">Geral</span></div>
    </section>
    <div class="card-panel">
      <h3 class="panel-title" style="margin-bottom:12px;">Topologia de Infraestrutura Ativa</h3>
      <p class="panel-subtitle">Este terminal gerencia as conexões de BaaS e adquirentes de cartões conectadas diretamente às sub-marcas corporativas.</p>
    </div>
  `;
}

function renderAdminAdquirentes() {
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Provedores BaaS & Adquirentes</h2><p class="page-subtitle">Configuração dos barramentos bancários do sistema.</p></div></header>
    <div class="content-grid" style="grid-template-cols:1fr;">
      <div class="card-panel">
        <h3 class="panel-title" style="margin-bottom:15px;">Adquirentes Ativas no Sistema</h3>
        <div class="billing-list">
          <div class="billing-item"><div><h4>Barramento Celcoin / Fitbank (BaaS PIX)</h4><p class="item-id">Status: Conectado • Produção</p></div><div><span class="status-tag pago">Ativo</span></div></div>
          <div class="billing-item"><div><h4>Barramento Cielo / Rede (Adquirência Cartões)</h4><p class="item-id">Status: Conectado • Liquidação D+1</p></div><div><span class="status-tag pago">Ativo</span></div></div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminWebhooks() {
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Gatantilhas Webhooks</h2><p class="page-subtitle">Disparos de notificações em tempo real para as instâncias.</p></div></header>
    <div class="content-grid" style="grid-template-cols: 1fr 1fr;">
      <div class="card-panel">
        <h3 class="panel-title">Endpoint Zait Pay</h3>
        <input type="text" class="form-group" value="${database.configuracoes.webhookZait}" style="margin-top:15px; width:100%;">
      </div>
      <div class="card-panel">
        <h3 class="panel-title">Endpoint Voltz Pay</h3>
        <input type="text" class="form-group" value="${database.configuracoes.webhookVoltz}" style="margin-top:15px; width:100%;">
      </div>
    </div>
  `;
}

function renderAdminRelatorios() {
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Logs Globais de Auditoria</h2><p class="page-subtitle">Eventos de segurança registrados em tempo real.</p></div></header>
    <section class="card-panel">
      <div class="log-timeline-container" style="max-height: 500px;">
        ${database.logs.map(log => `<div style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.9rem;"><span style="color:var(--cyan); font-family:monospace; margin-right:15px;">${log.data}</span> ${log.acao}</div>`).join('')}
      </div>
    </section>
  `;
}

function renderAdminConfiguracoes() {
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Configurações Core</h2><p class="page-subtitle">Ajustes gerais do motor de processamento.</p></div></header>
    <div class="card-panel" style="max-width:500px;">
      <div class="form-group" style="margin-bottom:15px;"><label>Master Token API Key</label><input type="password" value="${database.configuracoes.apiBaasKey}"></div>
      <div class="form-group"><label>Token WhatsApp Global</label><input type="password" value="${database.configuracoes.whatsappToken}"></div>
    </div>
  `;
}

// ==========================================
// 5. RENDERS DE TELAS: CLIENTES (ZAIT / VOLTZ)
// ==========================================

function renderClienteDashboard() {
  const filtradas = database.cobrancas.filter(c => c.provedor === contextoAtual && c.status === 'Pago');
  const total = filtradas.reduce((a,c) => a + c.valor, 0);

  mainContainer.innerHTML = `
    <header class="main-header">
      <div><h2 class="page-title">Painel Financeiro - ${contextoAtual.toUpperCase()}</h2><p class="page-subtitle">Visão geral da sua sub-instância de liquidação.</p></div>
      <button class="btn-primary" onclick="abrirModalCobranca()">+ Nova Cobrança</button>
    </header>
    <section class="metrics-grid">
      <div class="metric-card"><span class="metric-label">Total Líquido Recebido</span><h3 class="metric-value">${formatarMoeda(total)}</h3><span class="badge badge-success">Liquidação BaaS</span></div>
      <div class="metric-card"><span class="metric-label">Transações Efetuadas</span><h3 class="metric-value">${filtradas.length}</h3><span class="badge badge-info">Histórico</span></div>
    </section>
  `;
}

function renderClienteCobrancas() {
  mainContainer.innerHTML = `
    <header class="main-header">
      <div><h2 class="page-title">Gerenciador de Recebíveis</h2><p class="page-subtitle">Acompanhe a situação dos pagamentos dos seus clientes.</p></div>
      <button class="btn-primary" onclick="abrirModalCobranca()">+ Nova Cobrança</button>
    </header>
    <div class="tabs-sub-menu">
      <button class="sub-tab active" onclick="filtrarCobrancasContexto('Todas')">Todas</button>
      <button class="sub-tab" onclick="filtrarCobrancasContexto('Pago')">Pagas</button>
      <button class="sub-tab" onclick="filtrarCobrancasContexto('Vencida')">Vencidas</button>
      <button class="sub-tab" onclick="filtrarCobrancasContexto('Pendente')">A Vencer</button>
    </div>
    <section class="card-panel" style="margin-top:20px;"><div class="billing-list" id="listaCobrancasFiltro"></div></section>
  `;
  filtrarCobrancasContexto('Todas');
}

window.filtrarCobrancasContexto = function(status) {
  document.querySelectorAll('.sub-tab').forEach(t => t.classList.toggle('active', t.innerText.includes(status) || (status === 'Todas' && t.innerText === 'Todas')));
  const box = document.getElementById('listaCobrancasFiltro');
  
  let filtradas = database.cobrancas.filter(c => c.provedor === contextoAtual);
  if (status !== 'Todas') filtradas = filtradas.filter(c => c.status === status);

  if (!filtradas.length) { box.innerHTML = `<p class="panel-subtitle">Nenhum registro encontrado.</p>`; return; }

  box.innerHTML = filtradas.map(c => `
    <div class="billing-item">
      <div class="item-info"><h4>${c.cliente}</h4><p class="item-id">${c.id} • Vencimento: ${c.vencimento.split('-').reverse().join('/')}</p></div>
      <div><p class="item-meta-label">Método</p><h4 class="item-meta-value">${c.metodo}</h4></div>
      <div><p class="item-meta-label">Líquido</p><h4 class="item-amount">${formatarMoeda(c.valor)}</h4></div>
      ${c.split ? `<div><p class="item-meta-label">Regra Split</p><h4 class="item-meta-value" style="color:var(--purple); font-size:0.8rem;">${c.split}</h4></div>` : ''}
      <div><span class="status-tag ${c.status.toLowerCase()}">${c.status}</span></div>
    </div>
  `).join('');
};

function renderClientes() {
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Base de Clientes Nominais</h2><p class="page-subtitle">Carteira de clientes cadastrados individualmente.</p></div></header>
    <div class="content-grid">
      <section class="card-panel billing-panel"><div class="billing-list" id="listaGeralClientes"></div></section>
      <section class="card-panel form-panel">
        <h3 class="panel-title">Cadastrar Cliente (PF/PJ)</h3>
        <form class="billing-form" id="formNovoCliente" style="margin-top:15px;">
          <div class="form-group"><label>Razão Social / Nome</label><input type="text" id="cliNome" required></div>
          <div class="form-group"><label>E-mail</label><input type="email" id="cliEmail" required></div>
          <div class="form-group"><label>Telefone</label><input type="text" id="cliFone" required></div>
          <button type="submit" class="btn-primary btn-block">Salvar Registro</button>
        </form>
      </section>
    </div>
  `;
  renderListaClientes();

  document.getElementById('formNovoCliente').addEventListener('submit', function(e) {
    e.preventDefault();
    database.clientes.push({
      id: `#CLI-${database.clientes.length + 1}`,
      nome: document.getElementById('cliNome').value,
      email: document.getElementById('cliEmail').value,
      fone: document.getElementById('cliFone').value,
      status: 'Ativo',
      provedor: 'zait'
    });
    registrarLog(`Cadastrou o cliente: ${document.getElementById('cliNome').value}`);
    renderListaClientes();
    this.reset();
  });
}

function renderListaClientes() {
  const list = database.clientes.filter(c => c.provedor === contextoAtual);
  document.getElementById('listaGeralClientes').innerHTML = list.map((c, i) => `
    <div class="billing-item">
      <div class="item-info"><h4>${c.nome}</h4><p class="item-id">${c.id} • ${c.email} • ${c.fone}</p></div>
      <div>
        <select class="select-table-status" onchange="database.clientes[${database.clientes.indexOf(c)}].status = this.value; registrarLog('Alterou status de cliente')">
          <option ${c.status === 'Ativo'?'selected':''}>Ativo</option>
          <option ${c.status === 'Sem Movimento'?'selected':''}>Sem Movimento</option>
        </select>
      </div>
    </div>
  `).join('');
}

function renderAssinaturas() {
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Contratos de Cobranças</h2><p class="page-subtitle">Emita termos recorrentes para assinaturas automáticas.</p></div></header>
    <div class="content-grid">
      <section class="card-panel billing-panel"><div class="billing-list" id="listaContratos"></div></section>
      <section class="card-panel form-panel">
        <h3 class="panel-title">Gerar Novo Contrato</h3>
        <form class="billing-form" id="formContrato" style="margin-top:15px;">
          <div class="form-group"><label>Favorecido</label><select id="contCliente">${database.clientes.filter(c=>c.provedor==='zait').map(c=>`<option>${c.nome}</option>`).join('')}</select></div>
          <div class="form-group"><label>Valor Mensal</label><input type="number" id="contValor" required></div>
          <div class="form-group"><label>Forma de Parcelamento</label><input type="text" id="contParcelas" placeholder="Ex: 12 parcelas mensais" required></div>
          <div class="form-group"><label>Meio de Captura</label><select id="contMeio"><option>PIX</option><option>Cartão</option><option>Boleto</option></select></div>
          <button type="submit" class="btn-primary btn-block">Gerar Contrato para Assinatura</button>
        </form>
      </section>
    </div>
  `;

  renderListaContratos();

  document.getElementById('formContrato').addEventListener('submit', function(e) {
    e.preventDefault();
    database.assinaturas.push({
      id: `#CON-${501 + database.assinaturas.length}`,
      cliente: document.getElementById('contCliente').value,
      valor: formatarMoeda(parseFloat(document.getElementById('contValor').value)),
      parcelas: document.getElementById('contParcelas').value,
      forma: document.getElementById('contMeio').value,
      data: new Date().toLocaleDateString('pt-BR'),
      provedor: 'zait'
    });
    registrarLog(`Contrato emitido para ${document.getElementById('contCliente').value}`);
    renderListaContratos();
    this.reset();
  });
}

function renderListaContratos() {
  document.getElementById('listaContratos').innerHTML = database.assinaturas.map(c=>`
    <div class="billing-item" style="border-left: 4px solid var(--cyan);">
      <div class="item-info"><h4>${c.cliente}</h4><p class="item-id">${c.id} • Emitido em: ${c.data}</p></div>
      <div><p class="item-meta-label">Acordo</p><h4 class="item-meta-value">${c.parcelas}</h4></div>
      <div><p class="item-meta-label">Líquido</p><h4 class="item-amount">${c.valor}</h4></div>
    </div>
  `).join('');
}

function renderVoltzSplit() {
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Divisão de Recebíveis (Split)</h2><p class="page-subtitle">Configure a distribuição automática de saldos da conta bolsão.</p></div></header>
    <div class="content-grid">
      <section class="card-panel billing-panel">
        <h3 class="panel-title" style="margin-bottom:15px;">Regras Ativas de Distribuição</h3>
        <div class="billing-list" id="listaSplits"></div>
      </section>
      <section class="card-panel form-panel">
        <h3 class="panel-title">Nova Regra de Divisão</h3>
        <form class="billing-form" id="formSplit" style="margin-top:15px;">
          <div class="form-group"><label>Identificação do Contrato</label><input type="text" id="splitNome" placeholder="Ex: Split Loja / Admin" required></div>
          <div class="form-group"><label>Taxa Fixa Bancária</label><input type="number" step="0.01" id="splitTaxa" value="0.99" required></div>
          <div class="form-group"><label>Regra Porcentagem (%)</label><input type="text" id="splitPorcentagem" placeholder="Ex: 70% / 30%" required></div>
          <button type="submit" class="btn-primary btn-block">Ativar Regra de Split</button>
        </form>
      </section>
    </div>
  `;
  renderListaSplits();

  document.getElementById('formSplit').addEventListener('submit', function(e) {
    e.preventDefault();
    database.splits.push({
      id: `#SPL-${database.splits.length + 1}`,
      contrato: document.getElementById('splitNome').value,
      taxaFixa: formatarMoeda(parseFloat(document.getElementById('splitTaxa').value)),
      porcentagem: document.getElementById('splitPorcentagem').value,
      status: 'Ativo'
    });
    registrarLog(`Nova regra de split configurada: ${document.getElementById('splitNome').value}`);
    renderListaSplits();
    this.reset();
  });
}

function renderListaSplits() {
  document.getElementById('listaSplits').innerHTML = database.splits.map(s => `
    <div class="billing-item" style="border-left:4px solid var(--purple);">
      <div class="item-info"><h4>${s.contrato}</h4><p class="item-id">${s.id} • Taxa do Provedor: ${s.taxaFixa}</p></div>
      <div><p class="item-meta-label">Divisão Pactuada</p><h4 class="item-amount" style="color:var(--purple);">${s.porcentagem}</h4></div>
      <div><span class="status-tag pago">${s.status}</span></div>
    </div>
  `).join('');
}

function renderClienteExtrato() {
  const list = database.cobrancas.filter(c => c.provedor === contextoAtual && c.status === 'Pago');
  mainContainer.innerHTML = `
    <header class="main-header"><div><h2 class="page-title">Extrato de Movimentação</h2><p class="page-subtitle">Visualização de entradas validadas via BaaS corporativo.</p></div></header>
    <div class="card-panel">
      <div class="billing-list">
        ${list.map(c => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
            <div><h4 style="font-size:1rem; color:#e2e8f0;">Entrada Autorizada via ${c.metodo}</h4><p class="item-id">Ref ID: ${c.id} • Pagador: ${c.cliente}</p></div>
            <div><h4 style="color:var(--green); font-weight:700;">+ ${formatarMoeda(c.valor)}</h4></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================
// 6. LOGICA DO MODAL FLUTUANTE DE COBRANÇAS
// ==========================================

const modalCobranca = document.getElementById('modalNovaCobranca');
const modalPix = document.getElementById('modalPixSucesso');
const formModal = document.getElementById('formModalCobranca');

window.abrirModalCobranca = function() {
  const groupFormMetodo = document.getElementById('groupFormMetodo');
  
  // Regra de Negócio restritiva do desenho: Voltz Pay opera APENAS com PIX
  if (contextoAtual === 'voltz') {
    groupFormMetodo.style.display = 'none';
    document.getElementById('cobMetodo').value = 'PIX';
  } else {
    groupFormMetodo.style.display = 'block';
  }
  
  modalCobranca.classList.add('active');
  document.getElementById('cobVencimento').value = new Date().toISOString().split('T')[0];
};

window.fecharModalCobranca = function() { modalCobranca.classList.remove('active'); formModal.reset(); };
document.getElementById('btnFecharModal').addEventListener('click', fecharModalCobranca);
document.getElementById('btnFecharModalPix').addEventListener('click', () => modalPix.classList.remove('active'));

formModal.addEventListener('submit', function(e) {
  e.preventDefault();

  const cliente = document.getElementById('cobCliente').value;
  const valor = parseFloat(document.getElementById('cobValor').value);
  const metodo = document.getElementById('cobMetodo').value;
  const vencimento = document.getElementById('cobVencimento').value;

  const novaCobranca = {
    id: `#UP-${1001 + database.cobrancas.length}`,
    cliente: cliente,
    valor: valor,
    metodo: metodo,
    status: 'Pendente',
    vencimento: vencimento,
    provedor: contextoAtual
  };

  if (contextoAtual === 'voltz') {
    novaCobranca.split = "70% Loja / 30% Admin"; // Força split padrão para testes na Voltz
  }

  database.cobrancas.unshift(novaCobranca);
  registrarLog(`Gerou lançamento financeiro de ${formatarMoeda(valor)} para ${cliente}`);

  carregarConteudoAba();
  fecharModalCobranca();

  // Processamento e exibição visual do QR Code
  const space = document.getElementById('qrcodeRenderSpace');
  const inputCopia = document.getElementById('inputPixCopiaCola');
  const visual = document.getElementById('wrapperDisplayVisual');

  if (metodo === 'PIX') {
    document.getElementById('pixModalTitulo').innerText = "Gateway PIX Ativo";
    document.getElementById('pixModalMensagem').innerText = `Sub-Instância: ${contextoAtual.toUpperCase()} \n Beneficiário: ${cliente} \n Valor: ${formatarMoeda(valor)}`;
    visual.style.display = 'block';
    space.innerHTML = '';

    const mockPayloadPix = `00020101021226580014br.gov.bcb.pix0114+55179999999995204000053039865405${valor.toFixed(2)}5802BR5912UniversalPay6009SaoPaulo62070503***6304A1B2`;
    inputCopia.value = mockPayloadPix;

    new QRCode(space, { text: mockPayloadPix, width: 150, height: 150 });
  } else {
    document.getElementById('pixModalTitulo').innerText = "Transação Registrada";
    document.getElementById('pixModalMensagem').innerText = `O registro de pagamento via ${metodo} no valor de ${formatarMoeda(valor)} foi enviado com sucesso para o barramento da liquidação de cartões/boletos da ${contextoAtual.toUpperCase()}.`;
    visual.style.display = 'none';
  }
  modalPix.classList.add('active');
});

document.getElementById('btnCopiarPixGeral').addEventListener('click', function() {
  const input = document.getElementById('inputPixCopiaCola');
  navigator.clipboard.writeText(input.value);
  this.innerText = "Copiado com Sucesso!";
  setTimeout(() => this.innerText = "Copiar Registro", 2000);
});

// Execução da primeira carga no painel administrativo principal
configurarLayoutPorContexto();
