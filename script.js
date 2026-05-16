// ==========================================
// 1. BANCO DE DADOS EM MEMÓRIA (ESTADOS)
// ==========================================

const dadosSistema = {
  cobrancas: [
    { id: '#UP-1001', cliente: 'João Silva', valor: 150.00, metodo: 'PIX', status: 'Pago', vencimento: '2026-05-10' },
    { id: '#UP-1002', cliente: 'Maria Souza', valor: 320.00, metodo: 'Cartão', status: 'Pendente', vencimento: '2026-05-20' },
    { id: '#UP-1003', cliente: 'Carlos Mendes', valor: 89.90, metodo: 'Boleto', status: 'Vencida', vencimento: '2026-05-05' }
  ],
  clientes: [
    { id: '#CLI-01', nome: 'João Silva', email: 'joao@email.com', telefone: '(17) 99999-1111', status: 'Ativo' },
    { id: '#CLI-02', nome: 'Maria Souza', email: 'maria@email.com', telefone: '(17) 99999-2222', status: 'Ativo' },
    { id: '#CLI-03', nome: 'Carlos Mendes', email: 'carlos@email.com', telefone: '(17) 99999-3333', status: 'Sem Movimento' }
  ],
  assinaturas: [
    { id: '#CON-501', cliente: 'João Silva', valor: 'R$ 1.200,00', parcelas: '12x', forma: 'PIX', data: '15/05/2026' }
  ],
  logs: [
    { data: '16/05/2026 09:30', acao: 'Sistema iniciado com sucesso.' },
    { data: '16/05/2026 09:45', acao: 'Visualização do Dashboard Financeiro acessada.' }
  ],
  configuracoes: {
    whatsappToken: '68df6g78sd6f87g6sd8f76g8',
    apiBaasKey: 'live_key_universalpay_baas_prod_09123',
    sandbox: true
  }
};

// Instância global para gerenciamento do componente QR Code
let qrcodeInstance = null;

// Auxiliar para formatar moeda
const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

// Registrar novas ações no Relatório automaticamente
function registrarLog(acao) {
  const agora = new Date().toLocaleString('pt-BR');
  dadosSistema.logs.unshift({ data: agora, acao });
}

// ==========================================
// 2. SISTEMA DE ROTEAMENTO (NAVEGAÇÃO)
// ==========================================

const mainContainer = document.getElementById('mainDynamicContent');
const navButtons = document.querySelectorAll('#sidebarNav .nav-btn');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    navButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const targetMenu = button.getAttribute('data-target');
    carregarMenu(targetMenu);
  });
});

function carregarMenu(menu) {
  registrarLog(`Menu alterado para: ${menu}`);
  switch(menu) {
    case 'dashboard': renderDashboard(); break;
    case 'cobrancas': renderCobrancas(); break;
    case 'clientes': renderClientes(); break;
    case 'assinaturas': renderAssinaturas(); break;
    case 'relatorios': renderRelatorios(); break;
    case 'configuracoes': renderConfiguracoes(); break;
  }
}

// ==========================================
// 3. RENDERIZADORES DAS TELAS DINÂMICAS
// ==========================================

// --- TELA: DASHBOARD ---
function renderDashboard() {
  const saldoTotal = dadosSistema.cobrancas.reduce((acc, c) => c.status === 'Pago' ? acc + c.valor : acc, 0);
  
  mainContainer.innerHTML = `
    <header class="main-header">
      <div>
        <h2 class="page-title">Dashboard Financeiro</h2>
        <p class="page-subtitle">Controle completo das cobranças e pagamentos.</p>
      </div>
      <button class="btn-primary" onclick="abrirModalCobranca()">+ Nova Cobrança</button>
    </header>

    <section class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Recebido Disponível</span>
        <h3 class="metric-value">${formatarMoeda(saldoTotal)}</h3>
        <span class="badge badge-success">Atualizado</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Clientes Cadastrados</span>
        <h3 class="metric-value">${dadosSistema.clientes.length}</h3>
        <span class="badge badge-info">Base Geral</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Contratos Ativos</span>
        <h3 class="metric-value">${dadosSistema.assinaturas.length}</h3>
        <span class="badge badge-brand">Recorrência</span>
      </div>
    </section>

    <div class="content-grid" style="grid-template-cols: 1fr;">
      <section class="card-panel">
        <h3 class="panel-title" style="margin-bottom: 20px;">Resumo Operacional</h3>
        <p class="panel-subtitle">Utilize o menu lateral para gerenciar as operações de cobrança, emitir contratos ou configurar integrações com APIs e WhatsApp.</p>
      </section>
    </div>
  `;
}

// --- TELA: COBRANÇAS ---
function renderCobrancas() {
  mainContainer.innerHTML = `
    <header class="main-header">
      <div>
        <h2 class="page-title">Gerenciador de Cobranças</h2>
        <p class="page-subtitle">Filtre seus recebíveis por status operacional.</p>
      </div>
      <button class="btn-primary" onclick="abrirModalCobranca()">+ Nova Cobrança</button>
    </header>

    <div class="tabs-sub-menu">
      <button class="sub-tab active" onclick="filtrarCobrancas('Todas')">Todas</button>
      <button class="sub-tab" onclick="filtrarCobrancas('Pago')">Pagas</button>
      <button class="sub-tab" onclick="filtrarCobrancas('Vencida')">Vencidas</button>
      <button class="sub-tab" onclick="filtrarCobrancas('Pendente')">A Vencer</button>
    </div>

    <section class="card-panel" style="margin-top: 20px;">
      <div class="billing-list" id="listaCobrancasFiltro"></div>
    </section>
  `;
  filtrarCobrancas('Todas');
}

window.filtrarCobrancas = function(status) {
  document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.classList.toggle('active', tab.innerText.includes(status) || (status === 'Todas' && tab.innerText === 'Todas'));
  });

  const listaHtml = document.getElementById('listaCobrancasFiltro');
  const filtradas = status === 'Todas' ? dadosSistema.cobrancas : dadosSistema.cobrancas.filter(c => c.status === status);

  if(filtradas.length === 0) {
    listaHtml.innerHTML = `<p class="panel-subtitle">Nenhuma cobrança encontrada nesta categoria.</p>`;
    return;
  }

  listaHtml.innerHTML = filtradas.map(item => `
    <div class="billing-item">
      <div class="item-info">
        <h4>${item.cliente}</h4>
        <p class="item-id">${item.id} • Vencimento: ${item.vencimento.split('-').reverse().join('/')}</p>
      </div>
      <div>
        <p class="item-meta-label">Método</p>
        <h4 class="item-meta-value">${item.metodo}</h4>
      </div>
      <div>
        <p class="item-meta-label">Valor</p>
        <h4 class="item-amount">${formatarMoeda(item.valor)}</h4>
      </div>
      <div>
        <span class="status-tag ${item.status.toLowerCase()}">${item.status}</span>
      </div>
    </div>
  `).join('');
};

// --- TELA: CLIENTES ---
function renderClientes() {
  mainContainer.innerHTML = `
    <header class="main-header">
      <div>
        <h2 class="page-title">Gestão de Clientes</h2>
        <p class="page-subtitle">Gerencie sua carteira comercial e mude a situação dos cadastros.</p>
      </div>
    </header>

    <div class="content-grid">
      <section class="card-panel billing-panel">
        <h3 class="panel-title" style="margin-bottom: 20px;">Clientes Cadastrados</h3>
        <div class="billing-list" id="listaGeralClientes"></div>
      </section>

      <section class="card-panel form-panel">
        <h3 class="panel-title">Novo Cadastro</h3>
        <p class="panel-subtitle" style="margin-bottom: 20px;">Adicione uma nova pessoa ou empresa à carteira.</p>
        
        <form class="billing-form" id="formNovoCliente">
          <div class="form-group"><label>Nome Completo</label><input type="text" id="cliNome" required></div>
          <div class="form-group"><label>E-mail</label><input type="email" id="cliEmail" required></div>
          <div class="form-group"><label>Telefone / WhatsApp</label><input type="text" id="cliFone" placeholder="(17) 99999-9999" required></div>
          <button type="submit" class="btn-primary btn-block">Salvar Cliente</button>
        </form>
      </section>
    </div>
  `;

  renderListaClientes();

  document.getElementById('formNovoCliente').addEventListener('submit', function(e) {
    e.preventDefault();
    const novo = {
      id: `#CLI-${String(dadosSistema.clientes.length + 1).padStart(2, '0')}`,
      nome: document.getElementById('cliNome').value,
      email: document.getElementById('cliEmail').value,
      telefone: document.getElementById('cliFone').value,
      status: 'Ativo'
    };
    dadosSistema.clientes.push(novo);
    registrarLog(`Novo cliente cadastrado: ${novo.nome}`);
    renderListaClientes();
    this.reset();
  });
}

function renderListaClientes() {
  const container = document.getElementById('listaGeralClientes');
  container.innerHTML = dadosSistema.clientes.map((cli, index) => `
    <div class="billing-item">
      <div class="item-info">
        <h4>${cli.nome}</h4>
        <p class="item-id">${cli.id} • ${cli.email} • ${cli.telefone}</p>
      </div>
      <div>
        <p class="item-meta-label">Situação</p>
        <select class="select-table-status" onchange="alterarStatusCliente(${index}, this.value)">
          <option value="Ativo" ${cli.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
          <option value="Sem Movimento" ${cli.status === 'Sem Movimento' ? 'selected' : ''}>Sem Movimento</option>
        </select>
      </div>
    </div>
  `).join('');
}

window.alterarStatusCliente = function(index, novoStatus) {
  dadosSistema.clientes[index].status = novoStatus;
  registrarLog(`Status do cliente ${dadosSistema.clientes[index].nome} alterado para: ${novoStatus}`);
};

// --- TELA: ASSINATURAS E CONTRATOS ---
function renderAssinaturas() {
  mainContainer.innerHTML = `
    <header class="main-header">
      <div>
        <h2 class="page-title">Contratos & Assinaturas</h2>
        <p class="page-subtitle">Emita e visualize os termos de acordos financeiros recorrentes.</p>
      </div>
    </header>

    <div class="content-grid">
      <section class="card-panel billing-panel">
        <h3 class="panel-title" style="margin-bottom: 20px;">Contratos em Vigência</h3>
        <div class="billing-list" id="listaContratos"></div>
      </section>

      <section class="card-panel form-panel">
        <h3 class="panel-title">Gerador de Contrato</h3>
        <p class="panel-subtitle" style="margin-bottom: 20px;">Formulário rápido para emissão e aceite mútuo de parcelas.</p>
        
        <form class="billing-form" id="formContrato">
          <div class="form-group">
            <label>Selecione o Cliente</label>
            <select id="contCliente">${dadosSistema.clientes.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Valor Total do Acordo</label><input type="number" id="contValor" required></div>
          <div class="form-group"><label>Forma de Parcelamento</label><input type="text" id="contParcelas" placeholder="Ex: 12x fixas" required></div>
          <div class="form-group">
            <label>Meio de Pagamento</label>
            <select id="contMeio"><option>PIX</option><option>Cartão de Crédito</option><option>Boleto Bancário</option></select>
          </div>
          <button type="submit" class="btn-primary btn-block">Gerar e Firmar Contrato</button>
        </form>
      </section>
    </div>
  `;

  renderListaContratos();

  document.getElementById('formContrato').addEventListener('submit', function(e) {
    e.preventDefault();
    const novoContrato = {
      id: `#CON-${501 + dadosSistema.assinaturas.length}`,
      cliente: document.getElementById('contCliente').value,
      valor: formatarMoeda(parseFloat(document.getElementById('contValor').value)),
      parcelas: document.getElementById('contParcelas').value,
      forma: document.getElementById('contMeio').value,
      data: new Date().toLocaleDateString('pt-BR')
    };
    dadosSistema.assinaturas.push(novoContrato);
    registrarLog(`Contrato firmado com sucesso para: ${novoContrato.cliente} (${novoContrato.valor})`);
    renderListaContratos();
    this.reset();
  });
}

function renderListaContratos() {
  document.getElementById('listaContratos').innerHTML = dadosSistema.assinaturas.map(c => `
    <div class="billing-item" style="border-left: 4px solid var(--cyan);">
      <div class="item-info">
        <h4>${c.cliente}</h4>
        <p class="item-id">${c.id} • Emitido em: ${c.data}</p>
      </div>
      <div><p class="item-meta-label">Estrutura</p><h4 class="item-meta-value">${c.parcelas} via ${c.forma}</h4></div>
      <div><p class="item-meta-label">Total Pactuado</p><h4 class="item-amount">${c.valor}</h4></div>
    </div>
  `).join('');
}

// --- TELA: RELATÓRIOS ---
function renderRelatorios() {
  mainContainer.innerHTML = `
    <header class="main-header">
      <div>
        <h2 class="page-title">Auditoria Geral do Sistema</h2>
        <p class="page-subtitle">Logs gerados em tempo real pelas interações dos usuários.</p>
      </div>
    </header>

    <section class="card-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 class="panel-title">Histórico de Ocorrências (Logs)</h3>
        <button class="btn-secondary" onclick="limparLogs()">Limpar Histórico</button>
      </div>
      <div class="log-timeline-container" id="logTimeline"></div>
    </section>
  `;
  renderLogs();
}

function renderLogs() {
  document.getElementById('logTimeline').innerHTML = dadosSistema.logs.map(log => `
    <div class="log-item" style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px;">
      <span style="color: var(--cyan); font-family: monospace; font-size: 0.85rem; shrink-0">${log.data}</span>
      <span style="color: #cbd5e1; font-size: 0.9rem;">${log.acao}</span>
    </div>
  `).join('');
}

window.limparLogs = function() {
  dadosSistema.logs = [];
  registrarLog('Histórico de auditoria limpo pelo usuário.');
  renderLogs();
};

// --- TELA: CONFIGURAÇÕES ---
function renderConfiguracoes() {
  mainContainer.innerHTML = `
    <header class="main-header">
      <div>
        <h2 class="page-title">Ajustes & Conexões do Sistema</h2>
        <p class="page-subtitle">Gerencie chaves de API BAAS e gateways de mensageria via WhatsApp.</p>
      </div>
    </header>

    <div class="content-grid" style="grid-template-cols: 1fr lg:grid-template-cols: 1fr 1fr;">
      <section class="card-panel">
        <h3 class="panel-title" style="margin-bottom:15px;">Integração WhatsApp Disparador</h3>
        <p class="panel-subtitle" style="margin-bottom:20px;">As mensagens de notificações de vencimento e PIX cópia e cola serão enviadas por esta chave.</p>
        <div class="form-group">
          <label>Token de Acesso Instância API</label>
          <input type="password" value="${dadosSistema.configuracoes.whatsappToken}" id="waToken" onchange="salvarConfig('whatsappToken', this.value)">
        </div>
      </section>

      <section class="card-panel">
        <h3 class="panel-title" style="margin-bottom:15px;">API Key BAAS (Gateway de Pagamentos)</h3>
        <p class="panel-subtitle" style="margin-bottom:20px;">Insira as credenciais fornecidas pelo seu parceiro bancário White Label.</p>
        <div class="form-group" style="margin-bottom: 15px;">
          <label>Chave Secreta de Produção</label>
          <input type="password" value="${dadosSistema.configuracoes.apiBaasKey}" id="baasKey" onchange="salvarConfig('apiBaasKey', this.value)">
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="checkbox" id="chkSandbox" ${dadosSistema.configuracoes.sandbox ? 'checked' : ''} onchange="salvarConfig('sandbox', this.checked)" style="width:auto; margin:0;">
          <label for="chkSandbox" style="font-size:0.85rem; color: var(--text-muted); cursor:pointer;">Ativar ambiente de testes (Sandbox)</label>
        </div>
      </section>
    </div>
  `;
}

window.salvarConfig = function(campo, valor) {
  dadosSistema.configuracoes[campo] = valor;
  registrarLog(`Configuração atualizada no campo: [${campo}]`);
};

// ==========================================
// 4. GERENCIAMENTO E LOGICA DE MODAIS
// ==========================================

const modalCobranca = document.getElementById('modalNovaCobranca');
const modalPix = document.getElementById('modalPixSucesso');
const btnFecharCob = document.getElementById('btnFecharModal');
const btnFecharPix = document.getElementById('btnFecharModalPix');
const formModal = document.getElementById('formModalCobranca');
const btnCopiarPix = document.getElementById('btnCopiarPixGeral');

window.abrirModalCobranca = function() {
  modalCobranca.classList.add('active');
  document.getElementById('cobVencimento').value = new Date().toISOString().split('T')[0];
};

window.fecharModalCobranca = function() {
  modalCobranca.classList.remove('active');
  formModal.reset();
};

btnFecharCob.addEventListener('click', fecharModalCobranca);
btnFecharPix.addEventListener('click', () => modalPix.classList.remove('active'));

// Fechamento clicando fora dos modais
window.addEventListener('click', function(e) {
  if (e.target === modalCobranca) fecharModalCobranca();
  if (e.target === modalPix) modalPix.classList.remove('active');
});

// Ação de envio do formulário de cobrança com geração de QR Code
formModal.addEventListener('submit', function(e) {
  e.preventDefault();

  const cliente = document.getElementById('cobCliente').value;
  const valor = parseFloat(document.getElementById('cobValor').value);
  const metodo = document.getElementById('cobMetodo').value;
  const vencimento = document.getElementById('cobVencimento').value;

  const novaCobranca = {
    id: `#UP-${1001 + dadosSistema.cobrancas.length}`,
    cliente: cliente,
    valor: valor,
    metodo: metodo,
    status: 'Pendente',
    vencimento: vencimento
  };

  dadosSistema.cobrancas.unshift(novaCobranca);
  registrarLog(`Cobrança avulsa gerada para ${cliente} no valor de ${formatarMoeda(valor)} via ${metodo}`);

  // Atualiza as telas de fundo se estiverem ativas
  const botaoCobrancasAtivo = document.querySelector('[data-target="cobrancas"]').classList.contains('active');
  const botaoDashboardAtivo = document.querySelector('[data-target="dashboard"]').classList.contains('active');
  if (botaoCobrancasAtivo) filtrarCobrancas('Todas');
  else if (botaoDashboardAtivo) renderDashboard();

  fecharModalCobranca();

  // Tratamento visual profissional baseado no método escolhido
  const renderSpace = document.getElementById('qrcodeRenderSpace');
  const txtCopiaCola = document.getElementById('inputPixCopiaCola');
  const visualWrapper = document.getElementById('wrapperDisplayVisual');
  
  if (metodo === 'PIX') {
    document.getElementById('pixModalTitulo').innerText = "Cobrança PIX Gerada!";
    document.getElementById('pixModalMensagem').innerText = `Cliente: ${cliente} • Valor: ${formatarMoeda(valor)}`;
    visualWrapper.style.display = 'block';
    renderSpace.innerHTML = ''; // Limpa geração anterior

    // Payload fictício simulando a chave estática padrão BR Code/PIX
    const payloadPixFicticio = `00020101021226580014br.gov.bcb.pix0114+55179999999995204000053039865405${valor.toFixed(2)}5802BR5912UniversalPay6009SaoPaulo62070503***6304A1B2`;
    txtCopiaCola.value = payloadPixFicticio;

    // Instancia o gerador dinâmico de QR Code
    qrcodeInstance = new QRCode(renderSpace, {
      text: payloadPixFicticio,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    modalPix.classList.add('active');
  } else {
    // Layout adaptativo caso seja Boleto ou Cartão
    document.getElementById('pixModalTitulo').innerText = "Sucesso!";
    document.getElementById('pixModalMensagem').innerText = `A cobrança de ${formatarMoeda(valor)} para ${cliente} via ${metodo} foi registrada e enviada por e-mail com sucesso!`;
    visualWrapper.style.display = 'none';
    modalPix.classList.add('active');
  }
});

// Ação de copiar link/PIX da área de transferência
btnCopiarPix.addEventListener('click', function() {
  const txtCopiaCola = document.getElementById('inputPixCopiaCola');
  if(txtCopiaCola.value) {
    navigator.clipboard.writeText(txtCopiaCola.value);
    const btnOriginalText = btnCopiarPix.innerText;
    btnCopiarPix.innerText = "Copiado!";
    btnCopiarPix.style.background = "linear-gradient(to right, var(--green), #22c55e)";
    setTimeout(() => {
      btnCopiarPix.innerText = btnOriginalText;
      btnCopiarPix.style.background = "";
    }, 2000);
  } else {
    modalPix.classList.remove('active');
  }
});

// Inicialização primária do painel principal
carregarMenu('dashboard');