// ================================================================
//  DASHBOARD MOVIMENTAÇÕES PATINETES — Backend (Google Apps Script)
//  Web App completo com upload Excel, cruzamento monitor, histórico
// ================================================================

// ---- CONFIG ----
var DASH_CONFIG = {
  PLANILHA_ID: ""  // Deixe vazio: será criada automaticamente na 1ª execução
};

// ================================================================
//  PONTOS MONITOR — Carregados dinamicamente da aba Pontos_Config
//  Upload via CSV (Belo Horizonte.csv) na aba Upload do dashboard
//  weekday-morning = DIA (0h-12h), weekday-evening = NOITE (12h-24h)
// ================================================================
function _carregarPontosMonitor(d) {
  d = d || {};
  var cidadeAtual = String(d.cidade || "");
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Pontos_Config");
  var dia = [], noite = [], fds = [], all = [];
  var todosPontos = {};
  // Lookup: normalizedKey → {dia:bool, noite:bool, fds:bool}
  var membership = {};
  if (!aba || aba.getLastRow() < 2) return {dia:dia, noite:noite, fds:fds, all:all, membership:membership, todosPontos:todosPontos};
  var vals = aba.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    var nome = String(vals[i][0] || "");
    var lat = parseFloat(vals[i][1]) || 0;
    var lng = parseFloat(vals[i][2]) || 0;
    var cap = parseInt(vals[i][3]) || 0;
    var schedule = String(vals[i][4] || "").toLowerCase();
    var cidadeLinha = String(vals[i][5] || "");
    if (!nome || !_cidadeConfigMatch(cidadeLinha, cidadeAtual)) continue;
    var ponto = {endereco:nome, lat:lat, lng:lng, capacidade:cap, zona:"CSV", schedule:schedule};
    all.push(ponto);
    // Track membership by coordinate key (more reliable than name)
    var coordKey = lat.toFixed(5) + "," + lng.toFixed(5);
    if (!membership[coordKey]) membership[coordKey] = {dia:false, noite:false, fds:false, endereco:nome};
    if (schedule === "weekday-morning") { dia.push(ponto); membership[coordKey].dia = true; }
    else if (schedule === "weekday-evening") { noite.push(ponto); membership[coordKey].noite = true; }
    else if (schedule === "weekend") { fds.push(ponto); membership[coordKey].fds = true; }
  }

  // Load Todos_Pontos for name/zona enrichment
  var abaTodos = ss.getSheetByName("Todos_Pontos");
  if (abaTodos && abaTodos.getLastRow() >= 2) {
    var valsTodos = abaTodos.getDataRange().getValues();
    for (var t = 1; t < valsTodos.length; t++) {
      var tNome = String(valsTodos[t][0] || "");
      var tLat = parseFloat(valsTodos[t][1]) || 0;
      var tLng = parseFloat(valsTodos[t][2]) || 0;
      var tZona = String(valsTodos[t][3] || "");
      var tCidade = String(valsTodos[t][5] || "");
      if (tNome && tLat && _cidadeConfigMatch(tCidade, cidadeAtual)) {
        var tKey = tLat.toFixed(4) + "," + tLng.toFixed(4);
        todosPontos[tKey] = {nome:tNome, lat:tLat, lng:tLng, zona:tZona};
      }
    }
  }

  return {dia:dia, noite:noite, fds:fds, all:all, membership:membership, todosPontos:todosPontos};
}

// REMOVIDO: Arrays hardcoded — pontos agora vêm do CSV via Pontos_Config
// ================================================================
//  HTTP HANDLERS
// ================================================================
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("dashboard")
    .setTitle("Dashboard Movimentacoes")
    .addMetaTag("viewport","width=device-width,initial-scale=1,maximum-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    return despachar(d);
  } catch(err) {
    return respJson({ok:false, msg:String(err)});
  }
}

function handleRequest(payload) {
  var r = despachar(payload);
  return JSON.parse(r.getContent());
}

function despachar(d) {
  // Rotas publicas (nao precisam de auth)
  if (d.acao === "login")         return loginUsuario(d);
  if (d.acao === "validarSessao") return validarSessao(d);

  // Validar sessao para todas as outras acoes
  if (!_verificarAuth(d)) return respJson({ok:false, msg:"Sessao expirada. Faca login novamente.", authError:true});

  // Rotas de admin (gerenciar usuarios)
  if (d.acao === "criarUsuario")    return criarUsuario(d);
  if (d.acao === "listarUsuarios")  return listarUsuarios(d);
  if (d.acao === "deletarUsuario")  return deletarUsuario(d);
  if (d.acao === "alterarSenha")    return alterarSenha(d);

  if (d.acao === "cadastrarCidade")    return cadastrarCidade(d);
  if (d.acao === "listarCidadesCad")   return listarCidadesCadastradas(d);
  if (d.acao === "deletarCidade")      return deletarCidade(d);
  if (d.acao === "listarEstados")      return listarEstados();
  if (d.acao === "atribuirCidades")    return atribuirCidadesUsuario(d);
  if (d.acao === "buscarMunicipios") return buscarMunicipios(d);

  // Injetar cidades do usuario no payload para filtragem
  d._cidadesUsuario = _obterCidadesDoToken(d._token) || "";

  if (d.acao === "importar")      return importarDados(d);
  if (d.acao === "listarDatas")   return listarDatas(d);
  if (d.acao === "carregarData")  return carregarData(d);
  if (d.acao === "comparar")      return compararDatas(d);
  if (d.acao === "pontosMonitor") return getPontosMonitor();
  if (d.acao === "deletarData")   return deletarData(d);
  if (d.acao === "eficiencia")    return getEficiencia(d);
  if (d.acao === "importarBaterias") return importarBaterias(d);
  if (d.acao === "baterias")         return getBaterias(d);
  if (d.acao === "listarDatasBat")   return listarDatasBaterias(d);
  if (d.acao === "salvarPontosCSV")  return salvarPontosCSV(d);
  if (d.acao === "carregarPontos")   return carregarPontosConfig(d);
  if (d.acao === "limparDados")      return limparDados(d);
  if (d.acao === "resumoGeral")      return getResumoGeral(d);
  if (d.acao === "salvarTodosPontos")  return salvarTodosPontos(d);
  if (d.acao === "carregarTodosPontos") return carregarTodosPontos(d);
  if (d.acao === "buscarPontosGoJet")  return buscarPontosGoJet(d);
  if (d.acao === "listarCidadesGoJet") return listarCidadesGoJet();
  if (d.acao === "deletarBatData")   return deletarBatData(d);
  if (d.acao === "salvarFuncionario") return salvarFuncionario(d);
  if (d.acao === "listarFuncionarios") return listarFuncionarios();
  if (d.acao === "deletarFuncionario") return deletarFuncionario(d);
  if (d.acao === "salvarZonas")    return salvarZonas(d);
  if (d.acao === "carregarZonas")  return carregarZonas(d);
  if (d.acao === "listarConfigs")     return listarConfigs(d);
  if (d.acao === "deletarConfig")     return deletarConfig(d);
  return respJson({ok:false, msg:"Acao desconhecida"});
}

// ================================================================
//  PLANILHA AUTO-CREATE
// ================================================================
function obterPlanilha() {
  if (DASH_CONFIG.PLANILHA_ID) {
    try { return SpreadsheetApp.openById(DASH_CONFIG.PLANILHA_ID); } catch(e) {}
  }
  // Procura planilha existente por nome
  var files = DriveApp.getFilesByName("Dashboard Movimentacoes Patinetes");
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  // Cria nova
  var ss = SpreadsheetApp.create("Dashboard Movimentacoes Patinetes");
  return ss;
}

function garantirAba(ss, nome, colunas) {
  var aba = ss.getSheetByName(nome);
  if (!aba) {
    aba = ss.insertSheet(nome);
    aba.appendRow(colunas);
    aba.getRange(1,1,1,colunas.length).setBackground("#1e3a5f").setFontColor("#fff").setFontWeight("bold");
    aba.setFrozenRows(1);
  }
  return aba;
}

// ================================================================
//  CONFIG SHEET HELPERS
// ================================================================
function garantirAbaSchema(ss, nome, colunas) {
  var aba = garantirAba(ss, nome, colunas);
  var lastCol = Math.max(aba.getLastColumn(), 1);
  var headers = aba.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h){ return String(h || ""); });
  for (var i = 0; i < colunas.length; i++) {
    if (headers.indexOf(colunas[i]) === -1) {
      headers.push(colunas[i]);
      aba.getRange(1, headers.length).setValue(colunas[i]);
    }
  }
  aba.getRange(1, 1, 1, headers.length).setBackground("#1e3a5f").setFontColor("#fff").setFontWeight("bold");
  aba.setFrozenRows(1);
  return aba;
}

function _cidadeConfigMatch(cidadeLinha, cidadeAtual) {
  cidadeLinha = String(cidadeLinha || "");
  cidadeAtual = String(cidadeAtual || "");
  if (!cidadeAtual) return true;
  return !cidadeLinha || cidadeLinha === cidadeAtual;
}

function _removerConfigCidade(aba, cidadeAtual, cidadeCol) {
  if (!aba || aba.getLastRow() < 2) return;
  cidadeAtual = String(cidadeAtual || "");
  var vals = aba.getDataRange().getValues();
  for (var i = vals.length - 1; i >= 1; i--) {
    var cidadeLinha = String(vals[i][cidadeCol - 1] || "");
    if (!cidadeAtual || !cidadeLinha || cidadeLinha === cidadeAtual) {
      aba.deleteRow(i + 1);
    }
  }
}
// ================================================================
//  NORMALIZAR ENDERECO (para matching)
// ================================================================
function normalizar(s) {
  if (!s) return "";
  var mapa = {"a":"\u00e0\u00e1\u00e2\u00e3\u00e4","e":"\u00e8\u00e9\u00ea\u00eb","i":"\u00ec\u00ed\u00ee\u00ef","o":"\u00f2\u00f3\u00f4\u00f5\u00f6","u":"\u00f9\u00fa\u00fb\u00fc","c":"\u00e7","n":"\u00f1","A":"\u00c0\u00c1\u00c2\u00c3\u00c4","E":"\u00c8\u00c9\u00ca\u00cb","I":"\u00cc\u00cd\u00ce\u00cf","O":"\u00d2\u00d3\u00d4\u00d5\u00d6","U":"\u00d9\u00da\u00db\u00dc","C":"\u00c7","N":"\u00d1"};
  var r = String(s);
  for (var base in mapa) { for (var i=0;i<mapa[base].length;i++) r = r.split(mapa[base][i]).join(base); }
  return r.replace(/[^\w\s]/g,"").replace(/\s+/g," ").trim().toLowerCase();
}

// ================================================================
//  HAVERSINE — distancia em metros entre 2 coordenadas
// ================================================================
function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371000;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ================================================================
//  EMOJI/ZONA HELPERS — extrai emoji e zona do nome do ponto
// ================================================================
function extrairZonaDoEmoji(nome) {
  if (!nome) return "Sem Zona";
  // Get first codepoint
  var cp = nome.codePointAt ? nome.codePointAt(0) : nome.charCodeAt(0);
  // 🟧 = U+1F7E7, 🟥 = U+1F7E5, 🟦 = U+1F7E6, 🟩 = U+1F7E9, 🟨 = U+1F7E8
  // ⬛ = U+2B1B, 🏁 = U+1F3C1
  if (cp === 0x1F7E7) return "Zona Laranja";
  if (cp === 0x1F7E5) return "Zona Vermelha";
  if (cp === 0x1F7E6) return "Zona Azul";
  if (cp === 0x1F7E9) return "Zona Verde";
  if (cp === 0x1F7E8) return "Zona Amarela";
  if (cp === 0x2B1B) return "Zona Preta";
  if (cp === 0x1F3C1) return "Zona Quadriculada";
  if (String(nome).toLowerCase().indexOf("promo") === 0) return "Promo";
  if (String(nome).toLowerCase().indexOf("zona") === 0) return nome.split(" - ")[0].trim();
  return "Sem Zona";
}

function extrairEmoji(nome) {
  if (!nome) return "";
  var cp = nome.codePointAt ? nome.codePointAt(0) : nome.charCodeAt(0);
  if (cp > 127) return String.fromCodePoint(cp);
  return "";
}

// ================================================================
//  ENDERECO OFICINA — detecta endereço da oficina (não conta como monitor)
// ================================================================
var OFICINA_PATTERNS = ["99wc+wfh", "сан-паулу", "бразилия", "centro de servi", "oficina", "levar para o centro", "centro de servico"];
function isOficina(endereco) {
  if (!endereco) return false;
  var lower = String(endereco).toLowerCase();
  for (var i = 0; i < OFICINA_PATTERNS.length; i++) {
    if (lower.indexOf(OFICINA_PATTERNS[i]) > -1) return true;
  }
  return false;
}

// ================================================================
//  MATCHING: Endereço/Coordenadas → Ponto Monitor
//  1. Tenta match por coordenadas (haversine 100m) — mais confiável
//  2. Fallback: match por texto (palavras em comum)
//  Busca em TODOS os arrays (DIA + NOITE + FDS)
// ================================================================
function matchPontoMonitorUnificado(endereco, dropoffLat, dropoffLng, pontosAll) {
  if (!endereco && !dropoffLat) return null;

  // Match EXCLUSIVAMENTE por coordenadas (raio 50m)
  // O CSV define pontos com lat/lng; o matching é feito por proximidade geográfica
  if (dropoffLat && dropoffLng) {
    var melhorDist = 50; // raio máximo 50 metros
    var melhorCoord = null;
    for (var i = 0; i < pontosAll.length; i++) {
      var p = pontosAll[i];
      if (!p.lat || !p.lng) continue;
      var dist = haversine(dropoffLat, dropoffLng, p.lat, p.lng);
      if (dist < melhorDist) {
        melhorDist = dist;
        melhorCoord = p;
      }
    }
    if (melhorCoord) return melhorCoord;
  }
  return null; // Sem coordenadas = sem match
}

// Legacy wrapper (used by carregarData for old data)
function matchPontoMonitor(enderecoEntrega, pontosArray) {
  return matchPontoMonitorUnificado(enderecoEntrega, null, null, pontosArray || []);
}

// ================================================================
//  CALCULAR EFICIENCIA POR RESPONSAVEL
// ================================================================
function calcularEficiencia(registros) {
  // Group by responsavel
  var porPessoa = {};
  registros.forEach(function(r) {
    var resp = r.responsavel || r["Responsavel"] || "Desconhecido";
    if (!porPessoa[resp]) porPessoa[resp] = [];
    porPessoa[resp].push(r);
  });

  var resultado = [];
  for (var nome in porPessoa) {
    var regs = porPessoa[nome];

    // Sort by delivery time
    regs.sort(function(a,b) {
      var ta = String(a.horaEntrega || a["Hora Entrega"] || "");
      var tb = String(b.horaEntrega || b["Hora Entrega"] || "");
      return ta.localeCompare(tb);
    });

    var totalMov = regs.length;
    var totalMonitor = 0, totalNaoMonitor = 0, totalOficina = 0;
    var totalMonitorDia = 0, totalMonitorNoite = 0, totalMonitorAmbos = 0;
    var pontosVisitados = {}; // endereco -> {count, ehMonitor, tipoMonitor}
    var temposEntre = []; // minutes between consecutive deliveries

    for (var i = 0; i < regs.length; i++) {
      var r = regs[i];
      var end = r.endereco || r["Endereco Entrega"] || "";
      var ponto = r.pontoMonitor || r["Ponto Monitor"] || "";
      var tipoMon = r.tipoMonitor || r["Tipo Monitor"] || "";
      var ehOfic = tipoMon === "OFICINA" || ponto === "OFICINA";
      var ehMon = !ehOfic && ponto !== "NAO MONITOR" && ponto !== "";

      if (ehOfic) totalOficina++;
      else if (ehMon) totalMonitor++;
      else totalNaoMonitor++;

      // Track DIA/NOITE/AMBOS monitor counts
      if (tipoMon === "Monitor DIA") totalMonitorDia++;
      else if (tipoMon === "Monitor NOITE") totalMonitorNoite++;
      else if (tipoMon === "Monitor AMBOS") totalMonitorAmbos++;
      else if (tipoMon === "Monitor FDS") totalMonitorDia++; // count FDS as DIA for stats

      var chaveP = end || ponto;
      if (!pontosVisitados[chaveP]) pontosVisitados[chaveP] = {endereco:end, ehMonitor:ehMon, count:0};
      pontosVisitados[chaveP].count++;

      // Time between this delivery and previous
      if (i > 0) {
        var horaAnt = String(regs[i-1].horaEntrega || regs[i-1]["Hora Entrega"] || "");
        var horaAtual = String(r.horaColeta || r["Hora Coleta"] || "");
        if (horaAnt && horaAtual) {
          var partsA = horaAnt.split(":");
          var partsB = horaAtual.split(":");
          if (partsA.length >= 2 && partsB.length >= 2) {
            var minA = parseInt(partsA[0]) * 60 + parseInt(partsA[1]);
            var minB = parseInt(partsB[0]) * 60 + parseInt(partsB[1]);
            var diff = minB - minA;
            if (diff < 0) diff += 1440;
            if (diff > 0 && diff < 480) { // ignore gaps > 8 hours
              temposEntre.push(diff);
            }
          }
        }
      }
    }

    var avgTempo = temposEntre.length > 0 ? Math.round(temposEntre.reduce(function(a,b){return a+b;},0) / temposEntre.length) : 0;

    var pontosArr = [];
    for (var k in pontosVisitados) pontosArr.push(pontosVisitados[k]);
    pontosArr.sort(function(a,b){return b.count-a.count;});

    resultado.push({
      nome: nome,
      totalMov: totalMov,
      totalMonitor: totalMonitor,
      totalNaoMonitor: totalNaoMonitor,
      totalOficina: totalOficina,
      totalMonitorDia: totalMonitorDia,
      totalMonitorNoite: totalMonitorNoite,
      totalMonitorAmbos: totalMonitorAmbos,
      avgTempoMin: avgTempo,
      temposEntre: temposEntre,
      pontos: pontosArr
    });
  }

  // Sort by total movimentacoes descending (ranking)
  resultado.sort(function(a,b){return b.totalMov - a.totalMov;});
  for (var i = 0; i < resultado.length; i++) resultado[i].ranking = i + 1;

  return resultado;
}

// ================================================================
//  GET EFICIENCIA (action handler)
// ================================================================
function getEficiencia(d) {
  var dataResp = JSON.parse(carregarData({data:d.data, cidade:d.cidade}).getContent());
  if (!dataResp.ok) return respJson({ok:false, msg:"Erro ao carregar dados para eficiencia"});
  var eficiencia = calcularEficiencia(dataResp.registros || []);
  return respJson({ok:true, eficiencia:eficiencia, dataLabel:d.data});
}

// ================================================================
//  IMPORTAR DADOS (recebe array de rows do Excel parseado no front)
// ================================================================
function importarDados(d) {
  var rows = d.rows || [];
  var dataLabel = d.dataLabel || "";
  if (!rows.length) return respJson({ok:false, msg:"Nenhum dado recebido"});
  if (!dataLabel) return respJson({ok:false, msg:"Informe a data do arquivo"});

  var ss = obterPlanilha();

  // Colunas do registro processado
  var COLUNAS = [
    "Status","Veiculo","Responsavel","Data Coleta","Hora Coleta","Data Entrega","Hora Entrega",
    "Endereco Entrega","Trabalho Realizado","Tipo Entrega","Distancia",
    "Ponto Monitor","Zona Monitor","Capacidade Monitor","Lat Monitor","Lng Monitor",
    "Periodo","Qtd Patinetes","Bloco","Tipo Monitor",
    "Pickup Lat","Pickup Lng","Dropoff Lat","Dropoff Lng"
  ];

  var cidadeCod = d.cidade ? _codigoCidade(d.cidade) : "";
  var nomeAba = cidadeCod ? "MOV_" + cidadeCod + "_" + dataLabel.replace(/\//g,"-") : "MOV_" + dataLabel.replace(/\//g,"-");
  var abaExist = ss.getSheetByName(nomeAba);
  if (abaExist) ss.deleteSheet(abaExist);

  var aba = ss.insertSheet(nomeAba);
  aba.appendRow(COLUNAS);
  aba.getRange(1,1,1,COLUNAS.length).setBackground("#1e3a5f").setFontColor("#fff").setFontWeight("bold");
  aba.setFrozenRows(1);

  // Carregar pontos monitor do CSV (Pontos_Config sheet)
  var _pm = _carregarPontosMonitor(d);
  var PONTOS_ALL = _pm.all || [];
  var MEMBERSHIP = _pm.membership || {};
  var semPontosMonitor = (PONTOS_ALL.length === 0);
  var TODOS_PONTOS = _pm.todosPontos || {};

  var processados = [];
  var registrosParaEficiencia = [];
  var stats = {total:0, monitor:0, naoMonitor:0, monitorDia:0, monitorNoite:0, monitorAmbos:0, monitorFds:0, oficina:0, manha:0, tarde:0, pontos:{}, zonas:{}, responsaveis:{}};
  var porHoraMov = [];
  for (var hh = 0; hh < 24; hh++) porHoraMov.push({total:0, monDia:0, monNoite:0, monAmbos:0, oficina:0, naoMon:0});

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    // Se nao tem endereco NEM dropoff NEM coletaEntrega, pula
    if (!r.endereco && !r.dropoff && !r.coletaEntrega && !r.veiculo) continue;

    // Parse coleta/entrega "DD.MM.YYYY HH:MM/DD.MM.YYYY HH:MM"
    var ce = String(r.coletaEntrega || "");
    var partes = ce.split("/");
    var dataColeta = "", horaColeta = "", dataEntrega = "", horaEntrega = "";
    if (partes.length >= 1) {
      var p1 = partes[0].trim().split(" ");
      dataColeta = p1[0] || "";
      horaColeta = p1[1] || "";
    }
    if (partes.length >= 2) {
      var p2 = partes[1].trim().split(" ");
      dataEntrega = p2[0] || "";
      horaEntrega = p2[1] || "";
    }

    // Período (mantido para compatibilidade)
    var horaNum = horaEntrega ? parseInt(horaEntrega.split(":")[0]) : -1;
    var periodo = horaNum >= 0 && horaNum <= 11 ? "Manha (00-12)" : "Tarde (12-24)";
    if (horaNum < 0) periodo = "Sem hora";

    // Bloco DIA/NOITE
    var bloco = horaNum >= 0 && horaNum <= 11 ? "DIA" : "NOITE";
    if (horaNum < 0) bloco = "SEM HORA";

    // Extrair lat/lng do Pickup (origem)
    var pickLat = 0, pickLng = 0;
    if (r.pickup) {
      var pickParts = String(r.pickup).split(",");
      if (pickParts.length >= 2) {
        pickLat = parseFloat(pickParts[0].trim()) || 0;
        pickLng = parseFloat(pickParts[1].trim()) || 0;
      }
    }

    // Extrair lat/lng do Dropoff (destino) para matching por coordenadas
    var dropLat = 0, dropLng = 0;
    if (r.dropoff) {
      var dropParts = String(r.dropoff).split(",");
      if (dropParts.length >= 2) {
        dropLat = parseFloat(dropParts[0].trim()) || 0;
        dropLng = parseFloat(dropParts[1].trim()) || 0;
      }
    }

    // Se endereco vazio, usar tipoEntrega ou coordenadas como fallback
    var enderecoReal = r.endereco || "";
    if (!enderecoReal && r.tipoEntrega) enderecoReal = r.tipoEntrega;
    if (!enderecoReal && dropLat) enderecoReal = dropLat.toFixed(6) + ", " + dropLng.toFixed(6);

    // Detectar oficina (verifica endereco E trabalho E tipoEntrega)
    var ehOficina = isOficina(enderecoReal) || isOficina(r.trabalho || "") || isOficina(r.tipoEntrega || "");

    // Match contra TODOS os pontos (coordenadas primeiro, texto depois)
    var match = ehOficina ? null : matchPontoMonitorUnificado(enderecoReal, dropLat, dropLng, PONTOS_ALL);
    var tipoMonitor = "NAO MONITOR";
    if (ehOficina) {
      tipoMonitor = "OFICINA";
    } else if (match) {
      // Verificar membership: em quais listas o ponto aparece
      var coordKey = match.lat.toFixed(5) + "," + match.lng.toFixed(5);
      var memb = MEMBERSHIP[coordKey] || {};
      var inDia = memb.dia || false;
      var inNoite = memb.noite || false;
      if (inDia && inNoite) {
        tipoMonitor = "Monitor AMBOS";
      } else if (bloco === "DIA" && inDia) {
        tipoMonitor = "Monitor DIA";
      } else if (bloco === "NOITE" && inNoite) {
        tipoMonitor = "Monitor NOITE";
      } else if (inDia) {
        tipoMonitor = "Monitor DIA";
      } else if (inNoite) {
        tipoMonitor = "Monitor NOITE";
      } else {
        tipoMonitor = "Monitor FDS";
      }
    }

    var pontoNome = "";
    var zonaM = "";
    var capM = match ? match.capacidade : "";
    var latM = match ? match.lat : (dropLat || "");
    var lngM = match ? match.lng : (dropLng || "");
    var ehMonitor = match ? true : false;

    // Lookup name/zona from Todos_Pontos (uses coordinate proximity)
    var lookupCoord = (match ? match.lat : dropLat) || 0;
    var lookupLng = (match ? match.lng : dropLng) || 0;
    var todoMatch = null;
    if (lookupCoord && lookupLng) {
      // Try exact key match first (4 decimal precision ~11m)
      var lk = parseFloat(lookupCoord).toFixed(4) + "," + parseFloat(lookupLng).toFixed(4);
      todoMatch = TODOS_PONTOS[lk] || null;
      // If no exact match, try nearby keys (search within ~50m)
      if (!todoMatch) {
        var bestDist = 50;
        for (var tk in TODOS_PONTOS) {
          var tp = TODOS_PONTOS[tk];
          var tdist = haversine(lookupCoord, lookupLng, tp.lat, tp.lng);
          if (tdist < bestDist) {
            bestDist = tdist;
            todoMatch = tp;
          }
        }
      }
    }

    if (todoMatch) {
      pontoNome = todoMatch.nome;
      zonaM = todoMatch.zona;
    } else if (match) {
      pontoNome = match.endereco;
      zonaM = match.zona || "CSV";
    } else {
      pontoNome = enderecoReal;
      zonaM = "";
    }

    var row = [
      r.status || "",
      r.veiculo || "",
      r.responsavel || "",
      dataColeta,
      horaColeta,
      dataEntrega,
      horaEntrega,
      enderecoReal,
      r.trabalho || "",
      r.tipoEntrega || "",
      r.distancia || "",
      ehOficina ? "OFICINA" : (ehMonitor ? pontoNome : "NAO MONITOR"),
      zonaM,
      capM,
      latM,
      lngM,
      periodo,
      1,
      bloco,
      tipoMonitor,
      pickLat,
      pickLng,
      dropLat,
      dropLng
    ];
    processados.push(row);

    // Build registro for eficiencia calculation
    registrosParaEficiencia.push({
      responsavel: r.responsavel || "",
      endereco: enderecoReal,
      pontoMonitor: ehMonitor ? pontoNome : "NAO MONITOR",
      horaColeta: horaColeta,
      horaEntrega: horaEntrega,
      enderecoOriginal: enderecoReal,
      bloco: bloco,
      tipoMonitor: tipoMonitor
    });

    // Stats
    stats.total++;
    if (ehOficina) { stats.oficina++; }
    else if (ehMonitor) { stats.monitor++; } else { stats.naoMonitor++; }
    if (tipoMonitor === "Monitor DIA") stats.monitorDia++;
    else if (tipoMonitor === "Monitor NOITE") stats.monitorNoite++;
    else if (tipoMonitor === "Monitor AMBOS") stats.monitorAmbos++;
    else if (tipoMonitor === "Monitor FDS") stats.monitorFds = (stats.monitorFds || 0) + 1;
    if (periodo.indexOf("Manha") > -1) stats.manha++; else stats.tarde++;

    // For non-monitor points, group by original address; for monitor, group by matched point
    var enderecoOriginal = r.endereco || "";
    var chaveNome = ehMonitor ? pontoNome : enderecoOriginal;
    var chave = chaveNome + "|" + zonaM;
    if (!stats.pontos[chave]) stats.pontos[chave] = {nome:chaveNome,zona:zonaM,cap:capM,lat:latM,lng:lngM,total:0,manha:0,tarde:0,ehMonitor:ehMonitor,enderecoOriginal:enderecoOriginal,tipoMonitor:tipoMonitor,responsaveis:{}};
    stats.pontos[chave].total++;
    if (periodo.indexOf("Manha") > -1) stats.pontos[chave].manha++;
    else stats.pontos[chave].tarde++;
    var respPonto = r.responsavel || "Desconhecido";
    stats.pontos[chave].responsaveis[respPonto] = (stats.pontos[chave].responsaveis[respPonto] || 0) + 1;

    if (zonaM) {
      if (!stats.zonas[zonaM]) stats.zonas[zonaM] = {total:0,manha:0,tarde:0};
      stats.zonas[zonaM].total++;
      if (periodo.indexOf("Manha") > -1) stats.zonas[zonaM].manha++;
      else stats.zonas[zonaM].tarde++;
    }

    var resp = r.responsavel || "Desconhecido";
    if (!stats.responsaveis[resp]) stats.responsaveis[resp] = 0;
    stats.responsaveis[resp]++;

    // Contagem por hora com tipo de monitor
    if (horaNum >= 0 && horaNum <= 23) {
      porHoraMov[horaNum].total++;
      if (tipoMonitor === "Monitor DIA") porHoraMov[horaNum].monDia++;
      else if (tipoMonitor === "Monitor NOITE") porHoraMov[horaNum].monNoite++;
      else if (tipoMonitor === "Monitor AMBOS" || tipoMonitor === "Monitor FDS") porHoraMov[horaNum].monAmbos++;
      else if (ehOficina) porHoraMov[horaNum].oficina++;
      else porHoraMov[horaNum].naoMon++;
    }
  }

  // Escreve tudo de uma vez (performance)
  if (processados.length > 0) {
    aba.getRange(2,1,processados.length,COLUNAS.length).setValues(processados);
  }

  // Salva no índice
  // Contar pontos distintos monitor vs nao-monitor
  var pontosMonCount = 0, pontosNaoMonCount = 0;
  for (var pk in stats.pontos) {
    if (stats.pontos[pk].ehMonitor) pontosMonCount++;
    else pontosNaoMonCount++;
  }
  var pctBase = stats.total - stats.oficina;
  var pctEfic = pctBase > 0 ? Math.min(100, Math.round((stats.monitor / pctBase) * 1000) / 10) : 0;

  var abaIdx = garantirAba(ss, "Indice", ["Data","Aba","Total","Monitor","Nao Monitor","Manha","Tarde","Importado Em","Monitor DIA","Monitor NOITE","Ptos Monitor","Ptos Nao Mon","% Eficiencia","Cidade"]);
  var agora = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  abaIdx.appendRow([dataLabel, nomeAba, stats.total, stats.monitor, stats.naoMonitor, stats.manha, stats.tarde, agora, stats.monitorDia, stats.monitorNoite, pontosMonCount, pontosNaoMonCount, pctEfic, d.cidade || ""]);

  // Converte pontos para array
  var pontosArr = [];
  for (var k in stats.pontos) {
    var p = stats.pontos[k];
    p.responsaveis = Object.keys(p.responsaveis).map(function(n){ return {nome:n, qtd:p.responsaveis[n]}; }).sort(function(a,b){return b.qtd-a.qtd;});
    pontosArr.push(p);
  }
  var zonasArr = [];
  for (var z in stats.zonas) zonasArr.push({zona:z, total:stats.zonas[z].total, manha:stats.zonas[z].manha, tarde:stats.zonas[z].tarde});
  var respArr = [];
  for (var rr in stats.responsaveis) respArr.push({nome:rr, total:stats.responsaveis[rr]});

  // Calcular eficiencia
  var eficiencia = calcularEficiencia(registrosParaEficiencia);

  // Construir array de movimentos para mapa (pickup→dropoff)
  var movimentosArr = [];
  for (var m = 0; m < processados.length; m++) {
    var pr = processados[m];
    var pLat = pr[20], pLng = pr[21], dLat = pr[22], dLng = pr[23];
    if (pLat && pLng && dLat && dLng) {
      movimentosArr.push({
        veiculo: pr[1],
        responsavel: pr[2],
        horaColeta: pr[4],
        horaEntrega: pr[6],
        trabalho: pr[8],
        tipoEntrega: pr[9],
        pontoMonitor: pr[11],
        tipoMonitor: pr[19],
        bloco: pr[18],
        pickLat: pLat, pickLng: pLng,
        dropLat: dLat, dropLng: dLng
      });
    }
  }

  var msgFinal = "Importados " + stats.total + " registros para " + dataLabel;
  if (semPontosMonitor) {
    msgFinal += " | ATENCAO: Pontos Monitor nao configurados! Importe o CSV de pontos primeiro (Belo Horizonte.csv) para que o cruzamento funcione.";
  } else if (stats.monitor === 0 && stats.total > 0) {
    msgFinal += " | ATENCAO: Nenhuma movimentacao foi classificada como Monitor. Verifique se o CSV de pontos esta correto.";
  }

  return respJson({
    ok:true,
    msg:msgFinal,
    stats:stats,
    pontos:pontosArr,
    zonas:zonasArr,
    responsaveis:respArr,
    eficiencia:eficiencia,
    movimentos:movimentosArr,
    dataLabel:dataLabel,
    porHoraMov:porHoraMov,
    semPontosMonitor:semPontosMonitor
  });
}

// ================================================================
//  LISTAR DATAS IMPORTADAS
// ================================================================
function listarDatas(d) {
  d = d || {};
  var cidade = String(d.cidade || "");
  var cidadesUsuario = d._cidadesUsuario || "";
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Indice");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, datas:[]});
  var vals = aba.getDataRange().getValues();
  var datas = [];
  for (var i = 1; i < vals.length; i++) {
    var cidadeReg = String(vals[i][13] || "");
    if (cidade && cidadeReg !== cidade) continue;
    if (cidadesUsuario && cidadesUsuario !== "TODAS" && cidadesUsuario.indexOf(cidadeReg) === -1 && cidadeReg !== "") continue;
    datas.push({
      data: vals[i][0] instanceof Date ? Utilities.formatDate(vals[i][0], "America/Sao_Paulo", "yyyy-MM-dd") : String(vals[i][0]),
      aba: String(vals[i][1]),
      total: vals[i][2],
      monitor: vals[i][3],
      naoMonitor: vals[i][4],
      manha: vals[i][5],
      tarde: vals[i][6],
      importadoEm: vals[i][7] instanceof Date ? Utilities.formatDate(vals[i][7], "America/Sao_Paulo", "dd/MM/yyyy HH:mm") : String(vals[i][7]),
      monitorDia: vals[i][8] || 0,
      monitorNoite: vals[i][9] || 0,
      ptosMonitor: vals[i][10] || 0,
      ptosNaoMon: vals[i][11] || 0,
      pctEfic: vals[i][12] || 0,
      cidade: cidadeReg
    });
  }
  return respJson({ok:true, datas:datas});
}

// ================================================================
//  CARREGAR DADOS DE UMA DATA
// ================================================================
function carregarData(d) {
  var ss = obterPlanilha();
  var cidadeCod = d.cidade ? _codigoCidade(d.cidade) : "";
  var nomeAba = cidadeCod ? "MOV_" + cidadeCod + "_" + String(d.data || "").replace(/\//g,"-") : "MOV_" + String(d.data || "").replace(/\//g,"-");
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) {
    // Tentar encontrar aba com formato alternativo
    var sheets = ss.getSheets();
    var movSheets = [];
    for (var si = 0; si < sheets.length; si++) {
      var sn = sheets[si].getName();
      if (sn.indexOf("MOV_") === 0) movSheets.push(sn);
    }
    // Tentar match parcial (caso a data tenha formato diferente)
    var dataClean = String(d.data || "").replace(/[-\/\.]/g,"");
    for (var sj = 0; sj < movSheets.length; sj++) {
      if (movSheets[sj].replace(/[-\/\.]/g,"").indexOf(dataClean) > -1) {
        aba = ss.getSheetByName(movSheets[sj]);
        break;
      }
    }
    if (!aba) return respJson({ok:false, msg:"Aba " + nomeAba + " nao encontrada. Abas MOV: " + movSheets.join(", ")});
  }
  if (aba.getLastRow() < 2) return respJson({ok:false, msg:"Aba " + nomeAba + " esta vazia"});

  var vals = aba.getDataRange().getValues();
  var cab = vals[0];
  var registros = [];
  var stats = {total:0,monitor:0,naoMonitor:0,monitorDia:0,monitorNoite:0,monitorAmbos:0,monitorFds:0,oficina:0,manha:0,tarde:0,pontos:{},zonas:{},responsaveis:{}};
  var porHoraMov = [];
  for (var hh = 0; hh < 24; hh++) porHoraMov.push({total:0, monDia:0, monNoite:0, monAmbos:0, oficina:0, naoMon:0});

  for (var i = 1; i < vals.length; i++) {
    var obj = {};
    for (var j = 0; j < cab.length; j++) obj[cab[j]] = vals[i][j];
    registros.push(obj);

    stats.total++;
    var pontoMonStr = String(obj["Ponto Monitor"]);
    var tipoMonitor = String(obj["Tipo Monitor"] || "");
    var bloco = String(obj["Bloco"] || "");

    // Detect oficina e monitor pelo tipoMonitor (mais confiavel que pontoMonStr)
    var ehOficina = (tipoMonitor === "OFICINA" || pontoMonStr === "OFICINA");
    var ehM = !ehOficina && tipoMonitor.indexOf("Monitor") === 0;

    if (ehOficina) { stats.oficina++; }
    else if (ehM) { stats.monitor++; }
    else { stats.naoMonitor++; }

    // If columns don't exist (old data), recalculate
    if (!tipoMonitor && !bloco) {
      var _horaRaw = obj["Hora Entrega"];
      var horaEnt = (_horaRaw instanceof Date) ? Utilities.formatDate(_horaRaw, "America/Sao_Paulo", "HH:mm") : String(_horaRaw || "");
      var hNum = horaEnt ? parseInt(horaEnt.split(":")[0]) : -1;
      bloco = hNum >= 0 && hNum <= 11 ? "DIA" : "NOITE";
      if (hNum < 0) bloco = "SEM HORA";

      if (ehOficina) {
        tipoMonitor = "OFICINA";
      } else if (ehM) {
        if (bloco === "DIA") {
          tipoMonitor = "Monitor DIA";
        } else {
          tipoMonitor = "Monitor NOITE";
        }
      } else {
        tipoMonitor = "NAO MONITOR";
      }
      obj["Bloco"] = bloco;
      obj["Tipo Monitor"] = tipoMonitor;
    }

    if (tipoMonitor === "Monitor DIA") stats.monitorDia++;
    else if (tipoMonitor === "Monitor NOITE") stats.monitorNoite++;
    else if (tipoMonitor === "Monitor AMBOS") stats.monitorAmbos++;
    else if (tipoMonitor === "Monitor FDS") stats.monitorFds++;

    var per = String(obj["Periodo"] || "");
    if (per.indexOf("Manha") > -1) stats.manha++; else stats.tarde++;

    // For non-monitor: use original address from Endereco Entrega as point name
    var enderecoOriginal = String(obj["Endereco Entrega"] || "");
    var chaveNome = ehM ? pontoMonStr : enderecoOriginal;
    var chave = chaveNome + "|" + obj["Zona Monitor"];
    if (!stats.pontos[chave]) stats.pontos[chave] = {nome:chaveNome,zona:obj["Zona Monitor"],cap:obj["Capacidade Monitor"],lat:obj["Lat Monitor"],lng:obj["Lng Monitor"],total:0,manha:0,tarde:0,ehMonitor:ehM,enderecoOriginal:enderecoOriginal,tipoMonitor:tipoMonitor,responsaveis:{}};
    stats.pontos[chave].total++;
    if (per.indexOf("Manha") > -1) stats.pontos[chave].manha++; else stats.pontos[chave].tarde++;
    var respPonto = String(obj["Responsavel"] || "Desconhecido");
    stats.pontos[chave].responsaveis[respPonto] = (stats.pontos[chave].responsaveis[respPonto] || 0) + 1;

    var zm = String(obj["Zona Monitor"] || "");
    if (zm) {
      if (!stats.zonas[zm]) stats.zonas[zm] = {total:0,manha:0,tarde:0};
      stats.zonas[zm].total++;
      if (per.indexOf("Manha") > -1) stats.zonas[zm].manha++; else stats.zonas[zm].tarde++;
    }
    var resp = String(obj["Responsavel"] || "Desc");
    if (!stats.responsaveis[resp]) stats.responsaveis[resp] = 0;
    stats.responsaveis[resp]++;

    // Contagem por hora com tipo de monitor (para grafico de movimentacoes por hora)
    var horaEntRaw = obj["Hora Entrega"];
    var horaEntStr = "";
    if (horaEntRaw instanceof Date) {
      horaEntStr = Utilities.formatDate(horaEntRaw, "America/Sao_Paulo", "HH:mm");
    } else {
      horaEntStr = String(horaEntRaw || "");
    }
    var hEntNum = horaEntStr ? parseInt(horaEntStr.split(":")[0]) : -1;
    if (hEntNum >= 0 && hEntNum <= 23) {
      porHoraMov[hEntNum].total++;
      if (tipoMonitor === "Monitor DIA") porHoraMov[hEntNum].monDia++;
      else if (tipoMonitor === "Monitor NOITE") porHoraMov[hEntNum].monNoite++;
      else if (tipoMonitor === "Monitor AMBOS" || tipoMonitor === "Monitor FDS") porHoraMov[hEntNum].monAmbos++;
      else if (tipoMonitor === "OFICINA") porHoraMov[hEntNum].oficina++;
      else porHoraMov[hEntNum].naoMon++;
    }
  }

  var pontosArr = [];
  for (var k in stats.pontos) {
    var p = stats.pontos[k];
    p.responsaveis = Object.keys(p.responsaveis).map(function(n){ return {nome:n, qtd:p.responsaveis[n]}; }).sort(function(a,b){return b.qtd-a.qtd;});
    pontosArr.push(p);
  }
  var zonasArr = [];
  for (var z in stats.zonas) zonasArr.push({zona:z, total:stats.zonas[z].total, manha:stats.zonas[z].manha, tarde:stats.zonas[z].tarde});
  var respArr = [];
  for (var rr in stats.responsaveis) respArr.push({nome:rr, total:stats.responsaveis[rr]});

  // Calcular eficiencia from stored data
  var eficiencia = calcularEficiencia(registros);

  // Se solicitado com incluirMovimentos, construir array (usado pelo Mapa Movimentos)
  var resultado = {
    ok:true,
    stats:stats,
    pontos:pontosArr,
    zonas:zonasArr,
    responsaveis:respArr,
    eficiencia:eficiencia,
    dataLabel:d.data,
    porHoraMov:porHoraMov
  };

  // Movimentos só são incluídos quando solicitados (evita payload enorme)
  if (d.incluirMovimentos) {
    var movimentosArr = [];
    for (var mm = 0; mm < registros.length; mm++) {
      var reg = registros[mm];
      var pLat = parseFloat(reg["Pickup Lat"]) || 0;
      var pLng = parseFloat(reg["Pickup Lng"]) || 0;
      var dLat = parseFloat(reg["Dropoff Lat"]) || 0;
      var dLng = parseFloat(reg["Dropoff Lng"]) || 0;
      // Converter Date objects para string (Sheets retorna Date para campos de hora)
      var hColeta = reg["Hora Coleta"];
      var hEntrega = reg["Hora Entrega"];
      if (hColeta instanceof Date) hColeta = Utilities.formatDate(hColeta, "America/Sao_Paulo", "HH:mm");
      if (hEntrega instanceof Date) hEntrega = Utilities.formatDate(hEntrega, "America/Sao_Paulo", "HH:mm");
      if (pLat && pLng && dLat && dLng) {
        movimentosArr.push({
          veiculo: String(reg["Veiculo"] || ""),
          responsavel: String(reg["Responsavel"] || ""),
          horaColeta: String(hColeta || ""),
          horaEntrega: String(hEntrega || ""),
          trabalho: String(reg["Trabalho Realizado"] || ""),
          tipoEntrega: String(reg["Tipo Entrega"] || ""),
          pontoMonitor: String(reg["Ponto Monitor"] || ""),
          tipoMonitor: String(reg["Tipo Monitor"] || ""),
          bloco: String(reg["Bloco"] || ""),
          pickLat: pLat, pickLng: pLng,
          dropLat: dLat, dropLng: dLng
        });
      }
    }
    resultado.movimentos = movimentosArr;
  }

  return respJson(resultado);
}

// ================================================================
//  COMPARAR DUAS DATAS
// ================================================================
function compararDatas(d) {
  var r1 = JSON.parse(carregarData({data:d.data1, cidade:d.cidade}).getContent());
  var r2 = JSON.parse(carregarData({data:d.data2, cidade:d.cidade}).getContent());
  if (!r1.ok) return respJson({ok:false, msg:"Erro data1 (" + d.data1 + "): " + (r1.msg||"desconhecido")});
  if (!r2.ok) return respJson({ok:false, msg:"Erro data2 (" + d.data2 + "): " + (r2.msg||"desconhecido")});
  return respJson({ok:true, data1:r1, data2:r2});
}

// ================================================================
//  PONTOS MONITOR (retorna lista para o frontend)
// ================================================================
function getPontosMonitor() {
  var _pm = _carregarPontosMonitor(d);
  return respJson({ok:true, pontos:_pm.dia, pontosDia:_pm.dia, pontosNoite:_pm.noite, pontosFds:_pm.fds, total:_pm.dia.length+_pm.noite.length+_pm.fds.length});
}

// ================================================================
//  DELETAR DATA
// ================================================================
function deletarData(d) {
  var ss = obterPlanilha();
  var cidadeCod = d.cidade ? _codigoCidade(d.cidade) : "";
  var nomeAba = cidadeCod ? "MOV_" + cidadeCod + "_" + String(d.data || "").replace(/\//g,"-") : "MOV_" + String(d.data || "").replace(/\//g,"-");
  var aba = ss.getSheetByName(nomeAba);
  if (aba) ss.deleteSheet(aba);
  // Remove do indice
  var abaIdx = ss.getSheetByName("Indice");
  if (abaIdx && abaIdx.getLastRow() >= 2) {
    var vals = abaIdx.getDataRange().getValues();
    for (var i = vals.length - 1; i >= 1; i--) {
      var dataIdx = vals[i][0] instanceof Date ? Utilities.formatDate(vals[i][0], "America/Sao_Paulo", "yyyy-MM-dd") : String(vals[i][0]);
      if (dataIdx === String(d.data)) {
        abaIdx.deleteRow(i + 1);
        break;
      }
    }
  }
  return respJson({ok:true, msg:"Data " + d.data + " deletada"});
}

// ================================================================
//  IMPORTAR BATERIAS (recebe array de rows do frontend)
// ================================================================
function importarBaterias(d) {
  var rows = d.rows || [];
  var dataLabel = d.dataLabel || "";
  if (!rows.length) return respJson({ok:false, msg:"Nenhum dado recebido"});
  if (!dataLabel) return respJson({ok:false, msg:"Informe a data do arquivo"});

  var ss = obterPlanilha();

  // Filtra apenas status "Substituído" / "Substituido"
  var filtrados = [];
  for (var i = 0; i < rows.length; i++) {
    var st = String(rows[i].status || "").toLowerCase()
      .replace(/í/g,"i").replace(/\u00ed/g,"i");
    if (st === "substituido") filtrados.push(rows[i]);
  }

  if (!filtrados.length) return respJson({ok:false, msg:"Nenhum registro com status Substituido encontrado"});

  var COLUNAS = [
    "Veiculo","Data","Hora","Executante","Funcao","CargaInicial","CargaFinal",
    "Delta","BatAntiga","BatNova","Bloco","Lat","Lng"
  ];

  var cidadeCod = d.cidade ? _codigoCidade(d.cidade) : "";
  var nomeAba = cidadeCod ? "BAT_" + cidadeCod + "_" + dataLabel.replace(/\//g,"-") : "BAT_" + dataLabel.replace(/\//g,"-");
  var abaExist = ss.getSheetByName(nomeAba);
  if (abaExist) ss.deleteSheet(abaExist);

  var aba = ss.insertSheet(nomeAba);
  aba.appendRow(COLUNAS);
  aba.getRange(1,1,1,COLUNAS.length).setBackground("#1e3a5f").setFontColor("#fff").setFontWeight("bold");
  aba.setFrozenRows(1);

  var processados = [];
  for (var i = 0; i < filtrados.length; i++) {
    var r = filtrados[i];
    var veiculo = String(r.veiculo || "");
    var data = String(r.data || "");
    var hora = String(r.hora || "");
    var executante = String(r.executante || "");
    var funcao = String(r.funcao || "");
    var cargaInicial = parseInt(r.cargaInicial) || 0;
    var cargaFinal = parseInt(r.cargaFinal) || 0;
    var delta = cargaFinal - cargaInicial;
    var batAntiga = String(r.batAntiga || "");
    var batNova = String(r.batNova || "");

    // Bloco DIA/NOITE baseado na hora
    var horaNum = hora ? parseInt(hora.split(":")[0]) : -1;
    var bloco = horaNum >= 0 && horaNum <= 11 ? "DIA" : "NOITE";
    if (horaNum < 0) bloco = "SEM HORA";

    // Coordenadas separadas por ponto-e-virgula
    var lat = "";
    var lng = "";
    var coords = String(r.coordenadas || "");
    if (coords) {
      var coordParts = coords.split(";");
      if (coordParts.length >= 2) {
        lat = parseFloat(coordParts[0].trim()) || "";
        lng = parseFloat(coordParts[1].trim()) || "";
      }
    }

    var row = [veiculo, data, hora, executante, funcao, cargaInicial, cargaFinal, delta, batAntiga, batNova, bloco, lat, lng];
    processados.push(row);
  }

  // Escreve tudo de uma vez (performance)
  if (processados.length > 0) {
    aba.getRange(2,1,processados.length,COLUNAS.length).setValues(processados);
  }

  // Calcula estatisticas
  var registros = [];
  for (var i = 0; i < processados.length; i++) {
    var p = processados[i];
    registros.push({
      veiculo: p[0], data: p[1], hora: p[2], executante: p[3], funcao: p[4],
      cargaInicial: p[5], cargaFinal: p[6], delta: p[7],
      batAntiga: p[8], batNova: p[9], bloco: p[10], lat: p[11], lng: p[12]
    });
  }

  var calc = calcularBaterias(registros);

  // Salva no indice de baterias (com colunas extras de turno/bloco)
  var abaIdx = garantirAba(ss, "Indice_Baterias", [
    "Data","Aba","Total","TotalSucesso","TotalFalha","MediaCargaInicial","MediaCargaFinal","ImportadoEm",
    "TotalDia","TotalNoite","TotalT0","TotalT1","TotalT2","Cidade"
  ]);
  var agora = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  abaIdx.appendRow([
    dataLabel, nomeAba, calc.stats.total, calc.stats.totalSucesso, calc.stats.totalFalha,
    Math.round(calc.stats.mediaCargaInicial * 100) / 100,
    Math.round(calc.stats.mediaCargaFinal * 100) / 100,
    agora,
    calc.stats.totalDia || 0,
    calc.stats.totalNoite || 0,
    calc.stats.totalT0 || 0,
    calc.stats.totalT1 || 0,
    calc.stats.totalT2 || 0,
    d.cidade || ""
  ]);

  return respJson({
    ok:true,
    msg:"Importados " + calc.stats.total + " registros de baterias para " + dataLabel,
    rows:registros,
    stats:calc.stats,
    executantes:calc.executantes,
    porHora:calc.porHora,
    porTurno:calc.porTurno,
    topVeiculos:calc.topVeiculos,
    distribuicao:calc.distribuicao,
    dataLabel:dataLabel
  });
}

// ================================================================
//  CALCULAR BATERIAS (estatisticas por executante e globais)
// ================================================================
function _classificarTurno(hora) {
  var hNum = hora ? parseInt(String(hora).split(":")[0]) : -1;
  if (hNum >= 0 && hNum <= 7) return "T0";
  if (hNum >= 8 && hNum <= 15) return "T1";
  if (hNum >= 16 && hNum <= 23) return "T2";
  return "SEM HORA";
}

function calcularBaterias(registros) {
  // Agrupar por executante
  var porPessoa = {};
  for (var i = 0; i < registros.length; i++) {
    var r = registros[i];
    var exec = r.executante || "Desconhecido";
    if (!porPessoa[exec]) porPessoa[exec] = [];
    porPessoa[exec].push(r);
  }

  var executantes = [];
  var globalCargaIni = [], globalCargaFim = [], globalDelta = [];
  var porHora = {};
  for (var h = 0; h < 24; h++) porHora[h] = 0;
  var totalDia = 0, totalNoite = 0;
  var totalT0 = 0, totalT1 = 0, totalT2 = 0;
  var totalSucesso = 0, totalFalha = 0;
  var veiculoMap = {}; // veiculo -> {trocas, cargaIniArr, executantesSet, ultimaHora}

  // Turno accumulators for porTurno stats
  var turnoStats = {T0:{total:0,cargaIniArr:[],cargaFimArr:[]}, T1:{total:0,cargaIniArr:[],cargaFimArr:[]}, T2:{total:0,cargaIniArr:[],cargaFimArr:[]}};

  for (var nome in porPessoa) {
    var regs = porPessoa[nome];
    var cargaIniArr = [], cargaFimArr = [], deltaArr = [];
    var dia = 0, noite = 0;
    var pessoaT0 = 0, pessoaT1 = 0, pessoaT2 = 0;
    var veiculosSet = {};

    // Ordenar por hora para calcular tempo medio entre trocas
    regs.sort(function(a,b) {
      return String(a.hora || "").localeCompare(String(b.hora || ""));
    });

    var temposEntre = [];
    for (var j = 0; j < regs.length; j++) {
      var reg = regs[j];
      cargaIniArr.push(reg.cargaInicial);
      cargaFimArr.push(reg.cargaFinal);
      deltaArr.push(reg.delta);
      globalCargaIni.push(reg.cargaInicial);
      globalCargaFim.push(reg.cargaFinal);
      globalDelta.push(reg.delta);

      if (reg.bloco === "DIA") { dia++; totalDia++; }
      else if (reg.bloco === "NOITE") { noite++; totalNoite++; }

      // Turno classification
      var turno = _classificarTurno(reg.hora);
      if (turno === "T0") { pessoaT0++; totalT0++; }
      else if (turno === "T1") { pessoaT1++; totalT1++; }
      else if (turno === "T2") { pessoaT2++; totalT2++; }

      // Accumulate turno carga stats
      if (turnoStats[turno]) {
        turnoStats[turno].total++;
        turnoStats[turno].cargaIniArr.push(reg.cargaInicial);
        turnoStats[turno].cargaFimArr.push(reg.cargaFinal);
      }

      // Sucesso: delta > 0, Falha: delta <= 0
      if (reg.delta > 0) totalSucesso++; else totalFalha++;

      veiculosSet[reg.veiculo] = true;

      // porHora
      var hNum = reg.hora ? parseInt(String(reg.hora).split(":")[0]) : -1;
      if (hNum >= 0 && hNum <= 23) porHora[hNum]++;

      // veiculoMap global
      if (!veiculoMap[reg.veiculo]) {
        veiculoMap[reg.veiculo] = {veiculo:reg.veiculo, trocas:0, cargaIniArr:[], executantesSet:{}, ultimaHora:""};
      }
      veiculoMap[reg.veiculo].trocas++;
      veiculoMap[reg.veiculo].cargaIniArr.push(reg.cargaInicial);
      veiculoMap[reg.veiculo].executantesSet[reg.executante] = true;
      veiculoMap[reg.veiculo].ultimaHora = reg.hora || veiculoMap[reg.veiculo].ultimaHora;

      // Tempo entre trocas consecutivas
      if (j > 0) {
        var horaAnt = String(regs[j-1].hora || "");
        var horaAtual = String(reg.hora || "");
        if (horaAnt && horaAtual) {
          var partsA = horaAnt.split(":");
          var partsB = horaAtual.split(":");
          if (partsA.length >= 2 && partsB.length >= 2) {
            var minA = parseInt(partsA[0]) * 60 + parseInt(partsA[1]);
            var minB = parseInt(partsB[0]) * 60 + parseInt(partsB[1]);
            var diff = minB - minA;
            if (diff < 0) diff += 1440;
            if (diff > 0 && diff < 480) temposEntre.push(diff);
          }
        }
      }
    }

    var avgCargaIni = cargaIniArr.length > 0 ? cargaIniArr.reduce(function(a,b){return a+b;},0) / cargaIniArr.length : 0;
    var avgCargaFim = cargaFimArr.length > 0 ? cargaFimArr.reduce(function(a,b){return a+b;},0) / cargaFimArr.length : 0;
    var avgDelta = deltaArr.length > 0 ? deltaArr.reduce(function(a,b){return a+b;},0) / deltaArr.length : 0;
    var avgTempo = temposEntre.length > 0 ? Math.round(temposEntre.reduce(function(a,b){return a+b;},0) / temposEntre.length) : 0;
    var veiculosUnicos = 0;
    for (var v in veiculosSet) veiculosUnicos++;
    var cargaMinima = cargaIniArr.length > 0 ? Math.min.apply(null, cargaIniArr) : 0;

    executantes.push({
      nome: nome,
      totalTrocas: regs.length,
      totalDia: dia,
      totalNoite: noite,
      totalT0: pessoaT0,
      totalT1: pessoaT1,
      totalT2: pessoaT2,
      mediaCargaInicial: Math.round(avgCargaIni * 100) / 100,
      mediaCargaFinal: Math.round(avgCargaFim * 100) / 100,
      mediaDelta: Math.round(avgDelta * 100) / 100,
      tempoMedioEntreTrocas: avgTempo,
      veiculosUnicos: veiculosUnicos,
      cargaMinima: cargaMinima
    });
  }

  // Sort executantes by totalTrocas desc
  executantes.sort(function(a,b){return b.totalTrocas - a.totalTrocas;});

  // Stats globais
  var total = registros.length;
  var gAvgIni = globalCargaIni.length > 0 ? globalCargaIni.reduce(function(a,b){return a+b;},0) / globalCargaIni.length : 0;
  var gAvgFim = globalCargaFim.length > 0 ? globalCargaFim.reduce(function(a,b){return a+b;},0) / globalCargaFim.length : 0;
  var gAvgDelta = globalDelta.length > 0 ? globalDelta.reduce(function(a,b){return a+b;},0) / globalDelta.length : 0;

  // Build porTurno array
  var porTurno = [];
  var turnoKeys = ["T0", "T1", "T2"];
  for (var ti = 0; ti < turnoKeys.length; ti++) {
    var tk = turnoKeys[ti];
    var ts = turnoStats[tk];
    var tAvgIni = ts.cargaIniArr.length > 0 ? ts.cargaIniArr.reduce(function(a,b){return a+b;},0) / ts.cargaIniArr.length : 0;
    var tAvgFim = ts.cargaFimArr.length > 0 ? ts.cargaFimArr.reduce(function(a,b){return a+b;},0) / ts.cargaFimArr.length : 0;
    porTurno.push({
      turno: tk,
      total: ts.total,
      mediaCargaIni: Math.round(tAvgIni * 100) / 100,
      mediaCargaFin: Math.round(tAvgFim * 100) / 100
    });
  }

  // topVeiculos
  var topVeiculos = [];
  for (var vk in veiculoMap) {
    var vm = veiculoMap[vk];
    var mediaCargaIni = vm.cargaIniArr.length > 0 ? Math.round(vm.cargaIniArr.reduce(function(a,b){return a+b;},0) / vm.cargaIniArr.length * 100) / 100 : 0;
    var execs = [];
    for (var ek in vm.executantesSet) execs.push(ek);
    topVeiculos.push({
      veiculo: vm.veiculo,
      trocas: vm.trocas,
      mediaCargaIni: mediaCargaIni,
      executantes: execs,
      ultimaHora: vm.ultimaHora
    });
  }
  topVeiculos.sort(function(a,b){return b.trocas - a.trocas;});
  topVeiculos = topVeiculos.slice(0, 20);

  // distribuicaoCarga baseada em delta absoluto
  var distribuicao = {faixa0_5:0, faixa5_10:0, faixa10_15:0, faixa15_20:0, faixa20plus:0};
  for (var i = 0; i < globalDelta.length; i++) {
    var d = Math.abs(globalDelta[i]);
    if (d < 5) distribuicao.faixa0_5++;
    else if (d < 10) distribuicao.faixa5_10++;
    else if (d < 15) distribuicao.faixa10_15++;
    else if (d < 20) distribuicao.faixa15_20++;
    else distribuicao.faixa20plus++;
  }

  return {
    stats: {
      total: total,
      totalDia: totalDia,
      totalNoite: totalNoite,
      totalT0: totalT0,
      totalT1: totalT1,
      totalT2: totalT2,
      totalSucesso: totalSucesso,
      totalFalha: totalFalha,
      mediaCargaInicial: Math.round(gAvgIni * 100) / 100,
      mediaCargaFinal: Math.round(gAvgFim * 100) / 100,
      mediaDelta: Math.round(gAvgDelta * 100) / 100
    },
    executantes: executantes,
    porHora: porHora,
    porTurno: porTurno,
    topVeiculos: topVeiculos,
    distribuicao: distribuicao
  };
}

// ================================================================
//  GET BATERIAS (carrega dados de uma data e recalcula)
// ================================================================
function getBaterias(d) {
  var ss = obterPlanilha();
  var dataKey = d.data || d.dataLabel || "";
  var cidadeCod = d.cidade ? _codigoCidade(d.cidade) : "";
  var nomeAba = cidadeCod ? "BAT_" + cidadeCod + "_" + String(dataKey).replace(/\//g,"-") : "BAT_" + String(dataKey).replace(/\//g,"-");
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) {
    // Tentar match parcial
    var sheets = ss.getSheets();
    var dataClean = String(dataKey).replace(/[-\/\.]/g,"");
    for (var si = 0; si < sheets.length; si++) {
      var sn = sheets[si].getName();
      if (sn.indexOf("BAT_") === 0 && sn.replace(/[-\/\.]/g,"").indexOf(dataClean) > -1) {
        aba = sheets[si]; break;
      }
    }
  }
  if (!aba || aba.getLastRow() < 2) return respJson({ok:false, msg:"Dados de baterias nao encontrados para " + dataKey + " (aba: " + nomeAba + ")"});

  var vals = aba.getDataRange().getValues();
  var cab = vals[0];
  var registros = [];
  for (var i = 1; i < vals.length; i++) {
    var obj = {};
    for (var j = 0; j < cab.length; j++) obj[String(cab[j]).toLowerCase().replace(/ /g,"")] = vals[i][j];
    registros.push({
      veiculo: String(obj["veiculo"] || ""),
      hora: obj["hora"] instanceof Date ? Utilities.formatDate(obj["hora"], "America/Sao_Paulo", "HH:mm:ss") : String(obj["hora"] || ""),
      executante: String(obj["executante"] || ""),
      cargaInicial: parseInt(obj["cargainicial"]) || 0,
      cargaFinal: parseInt(obj["cargafinal"]) || 0,
      delta: parseInt(obj["delta"]) || 0,
      batAntiga: String(obj["batantiga"] || ""),
      batNova: String(obj["batnova"] || ""),
      bloco: String(obj["bloco"] || "")
    });
  }

  var calc = calcularBaterias(registros);
  return respJson({
    ok:true,
    rows:registros,
    stats:calc.stats,
    executantes:calc.executantes,
    porHora:calc.porHora,
    porTurno:calc.porTurno,
    topVeiculos:calc.topVeiculos,
    distribuicao:calc.distribuicao,
    dataLabel:dataKey
  });
}

// ================================================================
//  LISTAR DATAS BATERIAS IMPORTADAS
// ================================================================
function listarDatasBaterias(d) {
  d = d || {};
  var cidade = String(d.cidade || "");
  var cidadesUsuario = d._cidadesUsuario || "";
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Indice_Baterias");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, datas:[]});
  var vals = aba.getDataRange().getValues();
  var datas = [];
  for (var i = 1; i < vals.length; i++) {
    var cidadeReg = String(vals[i][13] || "");
    if (cidade && cidadeReg !== cidade) continue;
    if (cidadesUsuario && cidadesUsuario !== "TODAS" && cidadesUsuario.indexOf(cidadeReg) === -1 && cidadeReg !== "") continue;
    datas.push({
      data: vals[i][0] instanceof Date ? Utilities.formatDate(vals[i][0], "America/Sao_Paulo", "yyyy-MM-dd") : String(vals[i][0]),
      aba: String(vals[i][1]),
      total: vals[i][2],
      totalSucesso: vals[i][3],
      totalFalha: vals[i][4],
      mediaCargaInicial: vals[i][5],
      mediaCargaFinal: vals[i][6],
      mediaCargaIni: vals[i][5],
      mediaCargaFin: vals[i][6],
      importadoEm: vals[i][7] instanceof Date ? Utilities.formatDate(vals[i][7], "America/Sao_Paulo", "dd/MM/yyyy HH:mm") : String(vals[i][7]),
      totalDia: vals[i][8] || 0,
      totalNoite: vals[i][9] || 0,
      totalT0: vals[i][10] || 0,
      totalT1: vals[i][11] || 0,
      totalT2: vals[i][12] || 0,
      cidade: cidadeReg
    });
  }
  return respJson({ok:true, datas:datas});
}

// ================================================================
//  SALVAR PONTOS CSV (recebe rows parseados do CSV Belo Horizonte)
//  CSV format: city_id;city_name;schedule_id;schedule_name;parking_id;parking_name;parking_latitude;parking_longitude;capacity
//  Schedule mapping: weekday-morning = DIA, weekday-evening = NOITE, weekend = FDS
// ================================================================
function salvarPontosCSV(d) {
  var rows = d.rows || [];
  if (!rows.length) return respJson({ok:false, msg:"Nenhum dado recebido"});

  var ss = obterPlanilha();
  var cidadeAtual = String(d.cidade || "");
  var COLUNAS = ["parking_name","lat","lng","capacity","schedule","Cidade"];
  var aba = garantirAbaSchema(ss, "Pontos_Config", COLUNAS);
  _removerConfigCidade(aba, cidadeAtual, 6);

  var processados = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var nome = String(r.parking_name || r.parkingName || r.nome || "");
    var lat = parseFloat(r.parking_latitude || r.parkingLatitude || r.lat || 0);
    var lng = parseFloat(r.parking_longitude || r.parkingLongitude || r.lng || 0);
    var cap = parseInt(r.capacity || r.capacidade || 0);
    var schedule = String(r.schedule_name || r.scheduleName || r.schedule || "");
    if (!nome) continue;
    processados.push([nome, lat, lng, cap, schedule, cidadeAtual]);
  }

  if (processados.length > 0) {
    aba.getRange(aba.getLastRow()+1,1,processados.length,COLUNAS.length).setValues(processados);
  }

  var countDia = 0, countNoite = 0, countFds = 0, countOutro = 0;
  for (var j = 0; j < processados.length; j++) {
    var sched = String(processados[j][4]).toLowerCase();
    if (sched === "weekday-morning") countDia++;
    else if (sched === "weekday-evening") countNoite++;
    else if (sched === "weekend") countFds++;
    else countOutro++;
  }

  var abaIC = garantirAba(ss, "Indice_Config", ["Tipo","Descricao","Total","ImportadoEm","Cidade"]);
  var agoraIC = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  if (abaIC.getLastRow() >= 2) {
    var valsIC = abaIC.getDataRange().getValues();
    for (var ic = valsIC.length - 1; ic >= 1; ic--) {
      if (String(valsIC[ic][0]) === "pontos_monitor" && String(valsIC[ic][4]) === cidadeAtual) {
        abaIC.deleteRow(ic + 1);
      }
    }
  }
  abaIC.appendRow(["pontos_monitor", "Pontos Monitores CSV", processados.length, agoraIC, cidadeAtual]);

  return respJson({
    ok:true,
    msg:"Salvos " + processados.length + " pontos na configuracao (DIA:" + countDia + " NOITE:" + countNoite + " FDS:" + countFds + ")",
    total:processados.length,
    countDia:countDia,
    countNoite:countNoite,
    countFds:countFds
  });
}

// ================================================================
//  ZONAS GEOGRAFICAS (poligonos WKT do CSV)
// ================================================================
function salvarZonas(d) {
  var rows = d.rows || [];
  if (!rows.length) return respJson({ok:false, msg:"Nenhuma zona recebida"});
  var ss = obterPlanilha();
  var cidadeAtual = String(d.cidade || "");
  var aba = garantirAbaSchema(ss, "Zonas_Config", ["Nome","WKT","Cor","DataImport","Cidade"]);
  _removerConfigCidade(aba, cidadeAtual, 5);
  var dataLabel = d.dataLabel || Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");
  var dados = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r.wkt || !r.nome) continue;
    dados.push([r.nome, r.wkt, r.cor || "", dataLabel, cidadeAtual]);
  }
  if (dados.length > 0) {
    aba.getRange(aba.getLastRow()+1,1,dados.length,5).setValues(dados);
  }
  var abaIC = garantirAba(ss, "Indice_Config", ["Tipo","Descricao","Total","ImportadoEm","Cidade"]);
  var agoraIC = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  if (abaIC.getLastRow() >= 2) {
    var valsIC = abaIC.getDataRange().getValues();
    for (var ic = valsIC.length - 1; ic >= 1; ic--) {
      if (String(valsIC[ic][0]) === "zonas" && String(valsIC[ic][4]) === cidadeAtual) {
        abaIC.deleteRow(ic + 1);
      }
    }
  }
  abaIC.appendRow(["zonas", "Mapa da Cidade - Zonas", dados.length, agoraIC, cidadeAtual]);

  return respJson({ok:true, msg:"Salvas " + dados.length + " zonas", total:dados.length});
}

function carregarZonas(d) {
  d = d || {};
  var cidadeAtual = String(d.cidade || "");
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Zonas_Config");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, zonas:[], total:0});
  var vals = aba.getDataRange().getValues();
  var zonas = [];
  for (var i = 1; i < vals.length; i++) {
    if (!vals[i][0]) continue;
    var cidadeLinha = String(vals[i][4] || "");
    if (!_cidadeConfigMatch(cidadeLinha, cidadeAtual)) continue;
    zonas.push({nome:String(vals[i][0]), wkt:String(vals[i][1]), cor:String(vals[i][2]), cidade:cidadeLinha});
  }
  return respJson({ok:true, zonas:zonas, total:zonas.length});
}

// ================================================================
//  SALVAR TODOS OS PONTOS (423 pontos do Excel com emoji/zona)
// ================================================================
function salvarTodosPontos(d) {
  var rows = d.rows || [];
  if (!rows.length) return respJson({ok:false, msg:"Nenhum dado recebido"});
  var ss = obterPlanilha();
  var cidadeAtual = String(d.cidade || "");
  var COLUNAS = ["nome","lat","lng","zona","emoji","Cidade"];
  var aba = garantirAbaSchema(ss, "Todos_Pontos", COLUNAS);
  _removerConfigCidade(aba, cidadeAtual, 6);

  var processados = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var nome = String(r.nome || "").trim();
    var lat = parseFloat(r.lat) || 0;
    var lng = parseFloat(r.lng) || 0;
    if (!nome || !lat) continue;
    var zona = extrairZonaDoEmoji(nome);
    var emoji = extrairEmoji(nome);
    processados.push([nome, lat, lng, zona, emoji, cidadeAtual]);
  }

  if (processados.length > 0) {
    aba.getRange(aba.getLastRow()+1,1,processados.length,COLUNAS.length).setValues(processados);
  }

  var abaIC = garantirAba(ss, "Indice_Config", ["Tipo","Descricao","Total","ImportadoEm","Cidade"]);
  var agoraIC = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  if (abaIC.getLastRow() >= 2) {
    var valsIC = abaIC.getDataRange().getValues();
    for (var ic = valsIC.length - 1; ic >= 1; ic--) {
      if (String(valsIC[ic][0]) === "todos_pontos" && String(valsIC[ic][4]) === cidadeAtual) {
        abaIC.deleteRow(ic + 1);
      }
    }
  }
  abaIC.appendRow(["todos_pontos", "Todos os Pontos/Estacionamentos", processados.length, agoraIC, cidadeAtual]);

  return respJson({ok:true, msg:processados.length + " pontos salvos", total:processados.length});
}

// ================================================================
//  GOJET API — Buscar Pontos de Estacionamento Automaticamente
// ================================================================
var GOJET_API = "https://logistic.gojet.app/api/v0/urent";

function listarCidadesGoJet() {
  try {
    // Buscar todas as cidades disponiveis na GoJet
    // A API nao tem endpoint de lista, entao usamos a lista hardcoded que mapeia com os IDs
    var cidadesGoJet = _getCidadesGoJetMap();
    var lista = [];
    for (var nome in cidadesGoJet) {
      lista.push({nome: nome, id: cidadesGoJet[nome]});
    }
    lista.sort(function(a,b){ return a.nome.localeCompare(b.nome); });
    return respJson({ok:true, cidades:lista, total:lista.length});
  } catch(e) {
    return respJson({ok:false, msg:"Erro ao listar cidades GoJet: " + String(e)});
  }
}

function buscarPontosGoJet(d) {
  var cidadeNome = String(d.cidade || "").trim();
  if (!cidadeNome) return respJson({ok:false, msg:"Cidade nao informada"});

  // Tentar encontrar o city_id pelo nome
  var cidadesMap = _getCidadesGoJetMap();
  var cityId = d.gojetCityId || "";

  // Se nao veio o ID direto, buscar pelo nome
  if (!cityId) {
    var nomeNorm = cidadeNome.toLowerCase().replace(/[áàãâ]/g,"a").replace(/[éèê]/g,"e").replace(/[íì]/g,"i").replace(/[óòõô]/g,"o").replace(/[úù]/g,"u").replace(/ç/g,"c");
    for (var nome in cidadesMap) {
      var nCheck = nome.toLowerCase().replace(/[áàãâ]/g,"a").replace(/[éèê]/g,"e").replace(/[íì]/g,"i").replace(/[óòõô]/g,"o").replace(/[úù]/g,"u").replace(/ç/g,"c");
      if (nCheck === nomeNorm || nCheck.indexOf(nomeNorm) >= 0 || nomeNorm.indexOf(nCheck) >= 0) {
        cityId = cidadesMap[nome];
        break;
      }
    }
  }

  if (!cityId) return respJson({ok:false, msg:"Cidade '" + cidadeNome + "' nao encontrada na GoJet. Use a aba Cidades para ver as cidades disponiveis."});

  try {
    // Buscar TODOS os parkings paginados
    var allParkings = [];
    var page = 1;
    var totalPages = 1;
    var limit = 500;

    while (page <= totalPages && page <= 20) { // max 20 paginas de seguranca
      var url = GOJET_API + "/parkings?city_id=" + cityId + "&page=" + page + "&limit=" + limit;
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Referer": "https://map.gojet.app/",
          "Origin": "https://map.gojet.app"
        },
        followRedirects: true
      });
      var code = response.getResponseCode();
      if (code !== 200) {
        return respJson({ok:false, msg:"GoJet API retornou status " + code + ". Tente novamente."});
      }
      var json = JSON.parse(response.getContentText());
      totalPages = json.total_pages || 1;
      var entries = json.entries || [];
      for (var i = 0; i < entries.length; i++) {
        allParkings.push(entries[i]);
      }
      page++;
    }

    if (!allParkings.length) {
      return respJson({ok:false, msg:"Nenhum ponto encontrado para " + cidadeNome + " na GoJet"});
    }

    // Converter para o formato do dashboard (nome, lat, lng)
    var pontos = [];
    for (var p = 0; p < allParkings.length; p++) {
      var pk = allParkings[p];
      var nome = String(pk.name || "").trim();
      var lat = parseFloat(pk.latitude) || 0;
      var lng = parseFloat(pk.longitude) || 0;
      if (!nome || !lat) continue;
      pontos.push({
        nome: nome,
        lat: lat,
        lng: lng,
        bikes_count: pk.bikes_count || 0,
        expected: pk.expected_bikes_count || 0,
        capacity: pk.capacity || 0,
        monitor: pk.monitor === true,
        gojet_id: pk.id || ""
      });
    }

    // Auto-salvar na aba Todos_Pontos para cache
    _salvarPontosGoJetCache(pontos, cidadeNome);

    return respJson({
      ok:true,
      pontos:pontos,
      total:pontos.length,
      cidade:cidadeNome,
      gojetCityId:cityId,
      msg:pontos.length + " pontos carregados da GoJet para " + cidadeNome
    });
  } catch(e) {
    return respJson({ok:false, msg:"Erro ao buscar GoJet: " + String(e)});
  }
}

function _salvarPontosGoJetCache(pontos, cidade) {
  var ss = obterPlanilha();
  var COLUNAS = ["nome","lat","lng","zona","emoji","Cidade"];
  var aba = garantirAbaSchema(ss, "Todos_Pontos", COLUNAS);
  _removerConfigCidade(aba, cidade, 6);

  var rows = [];
  for (var i = 0; i < pontos.length; i++) {
    var p = pontos[i];
    var zona = extrairZonaDoEmoji(p.nome);
    var emoji = extrairEmoji(p.nome);
    rows.push([p.nome, p.lat, p.lng, zona, emoji, cidade]);
  }
  if (rows.length > 0) {
    aba.getRange(aba.getLastRow()+1,1,rows.length,COLUNAS.length).setValues(rows);
  }

  var abaIC = garantirAba(ss, "Indice_Config", ["Tipo","Descricao","Total","ImportadoEm","Cidade"]);
  var agoraIC = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  if (abaIC.getLastRow() >= 2) {
    var valsIC = abaIC.getDataRange().getValues();
    for (var ic = valsIC.length - 1; ic >= 1; ic--) {
      if (String(valsIC[ic][0]) === "todos_pontos" && String(valsIC[ic][4]) === cidade) {
        abaIC.deleteRow(ic + 1);
      }
    }
  }
  abaIC.appendRow(["todos_pontos", "GoJet API - " + cidade, rows.length, agoraIC, cidade]);
}

function _getCidadesGoJetMap() {
  // Mapeamento nome → city_id da GoJet
  // Atualizado em 21/03/2026 com 57 cidades
  return {
    "Porto Belo": "697aee8e4821c38bfbeca550",
    "Serra": "695fc08a2479703707152316",
    "Florianopolis (Campeche)": "694cec30f73437e8d29ac592",
    "Florianopolis (Ingleses)": "694cec16f73437e8d29ab822",
    "Palhoca (Enseada da Pinheira)": "694ce9a5be7bda7b893023d4",
    "Joinville": "693046569305057d06bedfd8",
    "Anchieta": "692aff853460cff7c27b1cc4",
    "Guaratuba": "692601c15135ad34734ea005",
    "Itanhaem": "691daaddbd6bf79e82c06895",
    "Palhoca": "691760032219899d17be3885",
    "Mongagua": "690e206cbe482ae40ce3fe47",
    "Campos do Jordao": "690c9879d419e6cd63b5e4df",
    "Matinhos": "6903959e4a51c49c7a0f7023",
    "Belo Horizonte": "690388c7ad28bbbf340407e0",
    "Macae": "69030c566a5ed381129e627e",
    "Ubatuba": "68fbd43f4250726375e39777",
    "Natal": "68b04f07be72115f4f51278a",
    "Ilhabela": "68aef97ce618bd3b8e4f2248",
    "Belem": "68878e516923b6b7474e7bad",
    "Guarapari": "68427ddd6a7c4e0a60fe3303",
    "Aracaju": "67d2d76c77471d68d3c4be6e",
    "Santo Andre": "67ab79f4cd4d3cbb07a0c02e",
    "Novo Hamburgo": "67a5a7171825e70d1c89701b",
    "Brasilia": "6787b812c168def1b2c6d143",
    "Xangri-la": "6786a0c0c168def1b279cbce",
    "Torres": "678270969c1d0592907ac12e",
    "Santiago": "676a6a50724f119940da501b",
    "Capao da Canoa": "6763d2ab724f1199401b2a86",
    "Maceio": "6750ae6fe4b89285ddd91cb6",
    "Sao Luis": "67509c3c2d2edf38aac31eb1",
    "Recife": "674bf8e1f61e01bbafeaf4b3",
    "Joao Pessoa": "674bf86bf61e01bbafeaddee",
    "Salvador": "674bf7ddf61e01bbafeac67b",
    "Manaus": "674bf76af61e01bbafead0a5",
    "Fortaleza": "674bf6e7f61e01bbafeab17a",
    "Vitoria": "674bf668f61e01bbafeab059",
    "Santos": "674bf5f0f61e01bbafeaa8eb",
    "Campinas": "674bf578f61e01bbafeaa79b",
    "Porto Alegre": "674bf502f61e01bbafeaa6a5",
    "Curitiba": "674bf482f61e01bbafea9e94",
    "Rio de Janeiro": "674bf406f61e01bbafeab1e3",
    "Sao Paulo": "669f89ebd06775867c31b984",
    "Goiania": "674bf360f61e01bbafeaab6e",
    "Niteroi": "674bf294f61e01bbafeaa11a",
    "Praia Grande": "674bf213f61e01bbafeaa088",
    "Peruibe": "67e21f4c0c79dc6a3f72a1ad",
    "Sao Vicente": "67e08f640c79dc6a3f36fca3",
    "Florianopolis": "674bf10df61e01bbafea9af9",
    "Balneario Camboriu": "674bf094f61e01bbafea9820",
    "Itapema": "674bf01ef61e01bbafea972b",
    "Navegantes": "674befa8f61e01bbafea9685",
    "Penha": "674bef36f61e01bbafea8fa7",
    "Itajai": "674beebbf61e01bbafea8aef",
    "Picarras": "674bee3ef61e01bbafea88c2",
    "Sao Jose": "674bedc5f61e01bbafea8853",
    "Biguacu": "674bed4bf61e01bbafea875e",
    "Tijucas": "674becdbf61e01bbafea8699"
  };
}

// ================================================================
//  CARREGAR TODOS OS PONTOS (le da aba Todos_Pontos)
// ================================================================
function carregarTodosPontos(d) {
  d = d || {};
  var cidadeAtual = String(d.cidade || "");
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Todos_Pontos");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, pontos:[], total:0});
  var vals = aba.getDataRange().getValues();
  var pontos = [];
  for (var i = 1; i < vals.length; i++) {
    var cidadeLinha = String(vals[i][5] || "");
    if (!_cidadeConfigMatch(cidadeLinha, cidadeAtual)) continue;
    pontos.push({nome:String(vals[i][0]), lat:parseFloat(vals[i][1])||0, lng:parseFloat(vals[i][2])||0, zona:String(vals[i][3]||""), emoji:String(vals[i][4]||""), cidade:cidadeLinha});
  }
  return respJson({ok:true, pontos:pontos, total:pontos.length});
}

// ================================================================
//  CARREGAR PONTOS CONFIG (le da aba Pontos_Config e organiza)
//  Retorna: { dia:[], noite:[], fds:[] }
// ================================================================
function carregarPontosConfig(d) {
  d = d || {};
  var cidadeAtual = String(d.cidade || "");
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Pontos_Config");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, dia:[], noite:[], fds:[], total:0});

  var vals = aba.getDataRange().getValues();
  var dia = [], noite = [], fds = [];

  for (var i = 1; i < vals.length; i++) {
    var nome = String(vals[i][0] || "");
    var lat = parseFloat(vals[i][1]) || 0;
    var lng = parseFloat(vals[i][2]) || 0;
    var cap = parseInt(vals[i][3]) || 0;
    var schedule = String(vals[i][4] || "").toLowerCase();
    var cidadeLinha = String(vals[i][5] || "");
    if (!nome || !_cidadeConfigMatch(cidadeLinha, cidadeAtual)) continue;

    var ponto = {endereco:nome, lat:lat, lng:lng, capacidade:cap, zona:"CSV", schedule:schedule, cidade:cidadeLinha};
    if (schedule === "weekday-morning") dia.push(ponto);
    else if (schedule === "weekday-evening") noite.push(ponto);
    else if (schedule === "weekend") fds.push(ponto);
  }

  return respJson({
    ok:true,
    dia:dia,
    noite:noite,
    fds:fds,
    total:dia.length + noite.length + fds.length
  });
}

// ================================================================
//  LIMPAR DADOS — Remove abas selecionadas da planilha
// ================================================================
function limparDados(d) {
  var ss = obterPlanilha();
  var msgs = [];

  // Helper: safe delete sheet (keeps at least 1 sheet in spreadsheet)
  function safeDel(nome) {
    var ab = ss.getSheetByName(nome);
    if (ab && ss.getSheets().length > 1) { try { ss.deleteSheet(ab); msgs.push(nome + " removida"); } catch(e){} }
  }

  if (d.limparPontos) { safeDel("Pontos_Config"); }

  if (d.limparBaterias) {
    var sheets = ss.getSheets();
    for (var i = sheets.length - 1; i >= 0; i--) {
      var nome = sheets[i].getName();
      if (nome.indexOf("BAT_") === 0 && ss.getSheets().length > 1) {
        try { ss.deleteSheet(sheets[i]); msgs.push(nome + " removida"); } catch(e){}
      }
    }
    safeDel("Indice_Baterias");
  }

  if (d.limparMovimentacoes) {
    var sheetsMov = ss.getSheets();
    for (var m = sheetsMov.length - 1; m >= 0; m--) {
      var nomeMov = sheetsMov[m].getName();
      if (nomeMov.indexOf("MOV_") === 0 && ss.getSheets().length > 1) {
        try { ss.deleteSheet(sheetsMov[m]); msgs.push(nomeMov + " removida"); } catch(e){}
      }
    }
    safeDel("Indice");
  }

  if (d.limparPontos || d.limparTodosPontos) { safeDel("Todos_Pontos"); }

  if (d.limparZonas) {
    var abaZonas = ss.getSheetByName("Zonas_Config");
    if (abaZonas && ss.getSheets().length > 1) { ss.deleteSheet(abaZonas); msgs.push("Zonas_Config removido"); }
  }

  // Limpar Indice_Config entries
  if (d.limparPontos || d.limparTodosPontos || d.limparZonas) {
    var abaIC = ss.getSheetByName("Indice_Config");
    if (abaIC && abaIC.getLastRow() >= 2) {
      var valsIC = abaIC.getDataRange().getValues();
      for (var ic = valsIC.length - 1; ic >= 1; ic--) {
        var tipo = String(valsIC[ic][0]);
        if ((d.limparPontos && tipo === "pontos_monitor") ||
            (d.limparTodosPontos && tipo === "todos_pontos") ||
            (d.limparZonas && tipo === "zonas")) {
          abaIC.deleteRow(ic + 1);
        }
      }
    }
  }

  return respJson({ok:true, msg:"Dados limpos com sucesso (" + msgs.length + " itens removidos)", detalhes:msgs});
}

// ================================================================
//  RESUMO GERAL — Combina movimentacoes e baterias por pessoa
// ================================================================
function getResumoGeral(d) {
  var dataLabel = d.data || "";
  if (!dataLabel) return respJson({ok:false, msg:"Data nao informada"});

  // Carregar movimentacoes
  var movData = null;
  try {
    var movResp = carregarData({data: dataLabel, cidade: d.cidade});
    movData = JSON.parse(movResp.getContent());
  } catch(e) {
    movData = null;
  }

  // Carregar baterias
  var batData = null;
  try {
    var batResp = getBaterias({data: dataLabel, cidade: d.cidade});
    batData = JSON.parse(batResp.getContent());
  } catch(e) {
    batData = null;
  }

  if ((!movData || !movData.ok) && (!batData || !batData.ok)) {
    return respJson({ok:false, msg:"Nenhum dado encontrado para " + dataLabel});
  }

  // Calcular eficiencia por pessoa a partir dos registros de mov
  var eficienciaPorPessoa = {};
  if (movData && movData.ok && movData.eficiencia) {
    for (var e = 0; e < movData.eficiencia.length; e++) {
      var ef = movData.eficiencia[e];
      var chaveEf = String(ef.nome || "").toUpperCase().replace(/^\s+|\s+$/g, "");
      eficienciaPorPessoa[chaveEf] = ef;
    }
  }

  // Indexar executantes de baterias por nome normalizado
  var batPorPessoa = {};
  if (batData && batData.ok && batData.executantes) {
    for (var b = 0; b < batData.executantes.length; b++) {
      var ex = batData.executantes[b];
      var chaveBat = String(ex.nome || "").toUpperCase().replace(/^\s+|\s+$/g, "");
      batPorPessoa[chaveBat] = ex;
    }
  }

  // Coletar todas as pessoas (uniao de ambas as fontes)
  var todasPessoas = {};
  var chave;
  for (chave in eficienciaPorPessoa) todasPessoas[chave] = true;
  for (chave in batPorPessoa) todasPessoas[chave] = true;

  var resumo = [];
  var totalMovGeral = 0;
  var totalBatGeral = 0;
  var totalMonitorGeral = 0;
  var totalNaoMonitorGeral = 0;
  var totalOficinaGeral = 0;
  var totalPessoas = 0;

  for (var nomeNorm in todasPessoas) {
    var ef2 = eficienciaPorPessoa[nomeNorm] || null;
    var bt = batPorPessoa[nomeNorm] || null;

    // Determinar nome de exibicao (preferir o original)
    var nomeExib = (ef2 ? ef2.nome : (bt ? bt.nome : nomeNorm));

    var totalMov = ef2 ? ef2.totalMov : 0;
    var totalMonitor = ef2 ? ef2.totalMonitor : 0;
    var totalNaoMonitor = ef2 ? ef2.totalNaoMonitor : 0;
    var totalOficina = ef2 ? (ef2.totalOficina || 0) : 0;
    var pctMonitor = totalMov > 0 ? Math.round(totalMonitor / totalMov * 10000) / 100 : 0;
    var totalBaterias = bt ? bt.totalTrocas : 0;
    var mediaCargaInicial = bt ? bt.mediaCargaInicial : 0;
    var mediaCargaFinal = bt ? bt.mediaCargaFinal : 0;
    var mediaDelta = bt ? bt.mediaDelta : 0;
    var tempoMedioMov = ef2 ? ef2.avgTempoMin : 0;
    var tempoMedioBat = bt ? bt.tempoMedioEntreTrocas : 0;

    totalMovGeral += totalMov;
    totalBatGeral += totalBaterias;
    totalMonitorGeral += totalMonitor;
    totalNaoMonitorGeral += totalNaoMonitor;
    totalOficinaGeral += totalOficina;
    totalPessoas++;

    resumo.push({
      nome: nomeExib,
      totalMov: totalMov,
      totalMonitor: totalMonitor,
      totalNaoMonitor: totalNaoMonitor,
      totalOficina: totalOficina,
      pctMonitor: pctMonitor,
      totalBaterias: totalBaterias,
      mediaCargaInicial: mediaCargaInicial,
      mediaCargaFinal: mediaCargaFinal,
      mediaDelta: mediaDelta,
      tempoMedioMov: tempoMedioMov,
      tempoMedioBat: tempoMedioBat
    });
  }

  // Ordenar por total de atividades (mov + bat) desc
  resumo.sort(function(a,b) {
    return (b.totalMov + b.totalBaterias) - (a.totalMov + a.totalBaterias);
  });

  // Build totais from the actual source data (not from per-person merge)
  // This ensures totals are correct even when names don't match between sources
  var totais = {
    totalMovGeral: 0,
    totalBatGeral: 0,
    totalPessoas: totalPessoas,
    mediaMovPorPessoa: 0,
    mediaBatPorPessoa: 0
  };

  // Movimentacoes totais — take directly from stats (always correct regardless of name matching)
  if (movData && movData.ok && movData.stats) {
    var ms = movData.stats;
    totais.totalMovGeral = ms.total || 0;
    totais.movTotal = ms.total || 0;
    totais.movMonitor = ms.monitor || 0;
    totais.movNaoMonitor = ms.naoMonitor || 0;
    totais.movOficina = ms.oficina || 0;
    totais.movManha = ms.manha || 0;
    totais.movTarde = ms.tarde || 0;
    totais.movMonitorDia = ms.monitorDia || 0;
    totais.movMonitorNoite = ms.monitorNoite || 0;
    totais.movMonitorAmbos = ms.monitorAmbos || 0;
    totais.movMonitorFds = ms.monitorFds || 0;
    totais.pctMonitorGeral = ms.total > 0 ? Math.round((ms.monitor || 0) / ms.total * 10000) / 100 : 0;
  }

  // Baterias totais — take directly from stats
  if (batData && batData.ok && batData.stats) {
    var bs = batData.stats;
    totais.totalBatGeral = bs.total || 0;
    totais.batTotal = bs.total || 0;
    totais.batTotalDia = bs.totalDia || 0;
    totais.batTotalNoite = bs.totalNoite || 0;
    totais.batTotalT0 = bs.totalT0 || 0;
    totais.batTotalT1 = bs.totalT1 || 0;
    totais.batTotalT2 = bs.totalT2 || 0;
    totais.batTotalSucesso = bs.totalSucesso || 0;
    totais.batTotalFalha = bs.totalFalha || 0;
    totais.batMediaCargaInicial = bs.mediaCargaInicial || 0;
    totais.batMediaCargaFinal = bs.mediaCargaFinal || 0;
    totais.batMediaDelta = bs.mediaDelta || 0;
  }

  // Per-person averages (use actual totals from sources, not merged sums)
  var realPessoas = totalPessoas > 0 ? totalPessoas : 1;
  totais.mediaMovPorPessoa = Math.round((totais.totalMovGeral) / realPessoas * 100) / 100;
  totais.mediaBatPorPessoa = Math.round((totais.totalBatGeral) / realPessoas * 100) / 100;

  return respJson({ok:true, resumo:resumo, totais:totais, dataLabel:dataLabel});
}

// ================================================================
//  DELETAR DADOS DE BATERIAS POR DATA
// ================================================================
function deletarBatData(d) {
  var ss = obterPlanilha();
  var cidadeCod = d.cidade ? _codigoCidade(d.cidade) : "";
  var nomeAba = cidadeCod ? "BAT_" + cidadeCod + "_" + String(d.data || "").replace(/\//g,"-") : "BAT_" + String(d.data || "").replace(/\//g,"-");
  var aba = ss.getSheetByName(nomeAba);
  if (aba) ss.deleteSheet(aba);
  // Remove do Indice_Baterias
  var abaIdx = ss.getSheetByName("Indice_Baterias");
  if (abaIdx && abaIdx.getLastRow() >= 2) {
    var vals = abaIdx.getDataRange().getValues();
    for (var i = vals.length - 1; i >= 1; i--) {
      var dataIdx = vals[i][0] instanceof Date ? Utilities.formatDate(vals[i][0], "America/Sao_Paulo", "yyyy-MM-dd") : String(vals[i][0]);
      if (dataIdx === String(d.data)) {
        abaIdx.deleteRow(i + 1);
        break;
      }
    }
  }
  return respJson({ok:true, msg:"Baterias de " + d.data + " deletadas"});
}

// ================================================================
//  FUNCIONARIOS CRUD
// ================================================================
function salvarFuncionario(d) {
  var ss = obterPlanilha();
  var COLUNAS = ["NomeSistema","NomeCorreto","Cargo","Funcao","Turno","Zona","Obs",
                 "Gerente","Lider","Folga","DomingoMes","DataAdmissao","Ven1Dias","Ven1Data","Ven2Dias","Ven2Data","Telefone","Qualidade",
                 "Contrato","Prefixo","CPF","CNPJ","STService","Email","Fornecedor","Estado","Cidade","Telegram"];
  var aba = garantirAba(ss, "Funcionarios", COLUNAS);

  var nomeSistema = String(d.nomeSistema || "").trim();
  if (!nomeSistema) return respJson({ok:false, msg:"Nome do sistema obrigatorio"});

  // Calcular datas de vencimento
  var ven1Data = "", ven2Data = "";
  var dataAdm = d.dataAdmissao || "";
  var ven1Dias = parseInt(d.ven1Dias) || 0;
  var ven2Dias = parseInt(d.ven2Dias) || 0;
  if (dataAdm && ven1Dias > 0) {
    var dtAdm = new Date(dataAdm + "T12:00:00");
    var dt1 = new Date(dtAdm.getTime() + ven1Dias * 86400000);
    ven1Data = Utilities.formatDate(dt1, "America/Sao_Paulo", "dd/MM/yyyy");
    if (ven2Dias > 0) {
      var dt2 = new Date(dt1.getTime() + ven2Dias * 86400000);
      ven2Data = Utilities.formatDate(dt2, "America/Sao_Paulo", "dd/MM/yyyy");
    }
  }

  var row = [
    nomeSistema, d.nomeCorreto||"", d.cargo||"", d.funcao||"", d.turno||"", d.zona||"", d.obs||"",
    d.gerente||"", d.lider||"", d.folga||"", d.domingoMes||"", dataAdm, String(ven1Dias||""), ven1Data, String(ven2Dias||""), ven2Data, d.telefone||"", d.qualidade||"",
    d.contrato||"", d.prefixo||"", d.cpf||"", d.cnpj||"", d.stService||"", d.email||"", d.fornecedor||"", d.estado||"", d.cidade||"", d.telegram||""
  ];

  // Check if already exists - update
  var vals = aba.getDataRange().getValues();
  var found = false;
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toUpperCase() === nomeSistema.toUpperCase()) {
      aba.getRange(i+1, 1, 1, COLUNAS.length).setValues([row]);
      found = true;
      break;
    }
  }

  if (!found) {
    aba.appendRow(row);
  }

  return respJson({ok:true, msg:"Funcionario " + nomeSistema + " salvo"});
}

function listarFuncionarios() {
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Funcionarios");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, funcionarios:[]});
  var vals = aba.getDataRange().getValues();
  var funcs = [];
  for (var i = 1; i < vals.length; i++) {
    var dataAdm = vals[i][11] || "";
    if (dataAdm instanceof Date) dataAdm = Utilities.formatDate(dataAdm, "America/Sao_Paulo", "yyyy-MM-dd");
    funcs.push({
      nomeSistema: String(vals[i][0] || ""),
      nomeCorreto: String(vals[i][1] || ""),
      cargo: String(vals[i][2] || ""),
      funcao: String(vals[i][3] || ""),
      turno: String(vals[i][4] || ""),
      zona: String(vals[i][5] || ""),
      obs: String(vals[i][6] || ""),
      gerente: String(vals[i][7] || ""),
      lider: String(vals[i][8] || ""),
      folga: String(vals[i][9] || ""),
      domingoMes: String(vals[i][10] || ""),
      dataAdmissao: String(dataAdm),
      ven1Dias: String(vals[i][12] || ""),
      ven1Data: String(vals[i][13] || ""),
      ven2Dias: String(vals[i][14] || ""),
      ven2Data: String(vals[i][15] || ""),
      telefone: String(vals[i][16] || ""),
      qualidade: String(vals[i][17] || ""),
      contrato: String(vals[i][18] || ""),
      prefixo: String(vals[i][19] || ""),
      cpf: String(vals[i][20] || ""),
      cnpj: String(vals[i][21] || ""),
      stService: String(vals[i][22] || ""),
      email: String(vals[i][23] || ""),
      fornecedor: String(vals[i][24] || ""),
      estado: String(vals[i][25] || ""),
      cidade: String(vals[i][26] || ""),
      telegram: String(vals[i][27] || "")
    });
  }
  return respJson({ok:true, funcionarios:funcs});
}

function deletarFuncionario(d) {
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Funcionarios");
  if (!aba) return respJson({ok:false, msg:"Nenhum funcionario cadastrado"});
  var nomeSistema = String(d.nomeSistema || "").trim().toUpperCase();
  var vals = aba.getDataRange().getValues();
  for (var i = vals.length - 1; i >= 1; i--) {
    if (String(vals[i][0]).trim().toUpperCase() === nomeSistema) {
      aba.deleteRow(i + 1);
      return respJson({ok:true, msg:"Funcionario removido"});
    }
  }
  return respJson({ok:false, msg:"Funcionario nao encontrado"});
}

// ================================================================
//  UTILS
// ================================================================
// ================================================================
//  AUTENTICACAO - Login / Usuarios / Sessao
// ================================================================
function _hashSenha(senha) {
  // SHA-256 hash via Utilities
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, senha);
  var hex = "";
  for (var i = 0; i < raw.length; i++) {
    var b = raw[i]; if (b < 0) b += 256;
    hex += ("0" + b.toString(16)).slice(-2);
  }
  return hex;
}

function _gerarToken() {
  // Token aleatorio de 32 chars
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var token = "";
  for (var i = 0; i < 48; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

function _garantirAbaUsuarios() {
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Usuarios");
  if (!aba) {
    aba = ss.insertSheet("Usuarios");
    aba.appendRow(["Usuario","SenhaHash","Perfil","CriadoEm","UltimoLogin","Token","TokenExpira","Cidades"]);
    aba.getRange(1,1,1,8).setBackground("#1e3a5f").setFontColor("#fff").setFontWeight("bold");
    aba.setFrozenRows(1);
    // Criar usuario admin padrao: admin / admin123
    var agora = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
    aba.appendRow(["admin", _hashSenha("admin123"), "admin", agora, "", "", "", "TODAS"]);
  }
  return aba;
}

function loginUsuario(d) {
  var usuario = String(d.usuario || "").trim().toLowerCase();
  var senha = String(d.senha || "");
  if (!usuario || !senha) return respJson({ok:false, msg:"Usuario e senha obrigatorios"});

  var aba = _garantirAbaUsuarios();
  var vals = aba.getDataRange().getValues();
  var senhaHash = _hashSenha(senha);

  for (var i = 1; i < vals.length; i++) {
    var u = String(vals[i][0]).trim().toLowerCase();
    var h = String(vals[i][1]);
    if (u === usuario && h === senhaHash) {
      // Gerar token de sessao (expira em 12h)
      var token = _gerarToken();
      var expira = new Date();
      expira.setHours(expira.getHours() + 12);
      var expiraStr = Utilities.formatDate(expira, "America/Sao_Paulo", "yyyy-MM-dd HH:mm:ss");
      var agora = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");

      // Salvar token na planilha
      aba.getRange(i+1, 5).setValue(agora);   // UltimoLogin
      aba.getRange(i+1, 6).setValue(token);   // Token
      aba.getRange(i+1, 7).setValue(expiraStr); // TokenExpira

      var cidades = String(vals[i][7] || "");
      return respJson({
        ok:true,
        msg:"Login realizado com sucesso",
        token:token,
        usuario:usuario,
        perfil:String(vals[i][2] || "usuario"),
        cidades: cidades,
        expiraEm:expiraStr
      });
    }
  }
  return respJson({ok:false, msg:"Usuario ou senha incorretos"});
}

function validarSessao(d) {
  var token = String(d.token || "");
  if (!token) return respJson({ok:false, msg:"Token nao fornecido"});

  var aba = _garantirAbaUsuarios();
  var vals = aba.getDataRange().getValues();
  var agora = new Date();

  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][5]) === token) {
      var expiraStr = String(vals[i][6]);
      if (expiraStr) {
        var expira = new Date(expiraStr);
        if (agora > expira) return respJson({ok:false, msg:"Sessao expirada"});
      }
      return respJson({
        ok:true,
        usuario:String(vals[i][0]),
        perfil:String(vals[i][2] || "usuario"),
        cidades: String(vals[i][7] || "")
      });
    }
  }
  return respJson({ok:false, msg:"Sessao invalida"});
}

function _verificarAuth(d) {
  var token = String(d._token || "");
  if (!token) return false;
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Usuarios");
  if (!aba || aba.getLastRow() < 2) return false;
  var vals = aba.getDataRange().getValues();
  var agora = new Date();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][5]) === token) {
      var expiraStr = String(vals[i][6]);
      if (expiraStr) {
        var expira = new Date(expiraStr);
        if (agora > expira) return false;
      }
      return true;
    }
  }
  return false;
}

function criarUsuario(d) {
  // Somente admin pode criar usuarios
  var perfil = _obterPerfilDoToken(d._token);
  if (perfil !== "admin") return respJson({ok:false, msg:"Apenas administradores podem criar usuarios"});

  var usuario = String(d.novoUsuario || "").trim().toLowerCase();
  var senha = String(d.novaSenha || "");
  var novoPerfil = String(d.novoPerfil || "usuario");
  if (!usuario || !senha) return respJson({ok:false, msg:"Usuario e senha obrigatorios"});
  if (senha.length < 4) return respJson({ok:false, msg:"Senha deve ter no minimo 4 caracteres"});

  var aba = _garantirAbaUsuarios();
  var vals = aba.getDataRange().getValues();
  // Verificar duplicidade
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toLowerCase() === usuario) {
      return respJson({ok:false, msg:"Usuario '" + usuario + "' ja existe"});
    }
  }
  var agora = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  var cidades = String(d.cidades || "");
  aba.appendRow([usuario, _hashSenha(senha), novoPerfil, agora, "", "", "", cidades]);
  return respJson({ok:true, msg:"Usuario '" + usuario + "' criado com sucesso"});
}

function listarUsuarios(d) {
  var perfil = _obterPerfilDoToken(d._token);
  if (perfil !== "admin") return respJson({ok:false, msg:"Apenas administradores podem listar usuarios"});

  var aba = _garantirAbaUsuarios();
  var vals = aba.getDataRange().getValues();
  var usuarios = [];
  for (var i = 1; i < vals.length; i++) {
    usuarios.push({
      usuario: String(vals[i][0]),
      perfil: String(vals[i][2] || "usuario"),
      criadoEm: String(vals[i][3] || ""),
      ultimoLogin: String(vals[i][4] || "Nunca"),
      cidades: String(vals[i][7] || "")
    });
  }
  return respJson({ok:true, usuarios:usuarios});
}

function deletarUsuario(d) {
  var perfil = _obterPerfilDoToken(d._token);
  if (perfil !== "admin") return respJson({ok:false, msg:"Apenas administradores podem deletar usuarios"});

  var alvo = String(d.usuarioAlvo || "").trim().toLowerCase();
  if (!alvo) return respJson({ok:false, msg:"Informe o usuario a deletar"});
  if (alvo === "admin") return respJson({ok:false, msg:"Nao e possivel deletar o usuario admin"});

  var aba = _garantirAbaUsuarios();
  var vals = aba.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toLowerCase() === alvo) {
      aba.deleteRow(i + 1);
      return respJson({ok:true, msg:"Usuario '" + alvo + "' removido"});
    }
  }
  return respJson({ok:false, msg:"Usuario nao encontrado"});
}

function alterarSenha(d) {
  var token = String(d._token || "");
  var novaSenha = String(d.novaSenha || "");
  var usuarioAlvo = String(d.usuarioAlvo || "").trim().toLowerCase();
  if (!novaSenha || novaSenha.length < 4) return respJson({ok:false, msg:"Senha deve ter no minimo 4 caracteres"});

  var aba = _garantirAbaUsuarios();
  var vals = aba.getDataRange().getValues();
  var perfil = _obterPerfilDoToken(token);

  // Admin pode alterar senha de qualquer usuario
  // Usuario comum so pode alterar a propria
  var tokenUser = _obterUsuarioDoToken(token);

  if (usuarioAlvo && usuarioAlvo !== tokenUser && perfil !== "admin") {
    return respJson({ok:false, msg:"Apenas admin pode alterar senha de outros usuarios"});
  }
  var target = usuarioAlvo || tokenUser;

  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toLowerCase() === target) {
      aba.getRange(i+1, 2).setValue(_hashSenha(novaSenha));
      return respJson({ok:true, msg:"Senha alterada com sucesso"});
    }
  }
  return respJson({ok:false, msg:"Usuario nao encontrado"});
}

function _obterPerfilDoToken(token) {
  if (!token) return "";
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Usuarios");
  if (!aba) return "";
  var vals = aba.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][5]) === String(token)) return String(vals[i][2] || "usuario");
  }
  return "";
}

function _obterUsuarioDoToken(token) {
  if (!token) return "";
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Usuarios");
  if (!aba) return "";
  var vals = aba.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][5]) === String(token)) return String(vals[i][0]).trim().toLowerCase();
  }
  return "";
}

// ================================================================
//  LISTAR CONFIGS (Pontos, Zonas, etc.)
// ================================================================
function listarConfigs(d) {
  d = d || {};
  var cidade = String(d.cidade || "");
  var cidadesUsuario = d._cidadesUsuario || "";
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Indice_Config");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, configs:[]});
  var vals = aba.getDataRange().getValues();
  var configs = [];
  for (var i = 1; i < vals.length; i++) {
    var cidadeReg = String(vals[i][4] || "");
    if (cidade && cidadeReg !== cidade) continue;
    if (cidadesUsuario && cidadesUsuario !== "TODAS" && cidadesUsuario.indexOf(cidadeReg) === -1 && cidadeReg !== "") continue;
    configs.push({
      tipo: String(vals[i][0]),
      descricao: String(vals[i][1]),
      total: vals[i][2] || 0,
      importadoEm: String(vals[i][3] || ""),
      cidade: cidadeReg
    });
  }
  return respJson({ok:true, configs:configs});
}

function deletarConfig(d) {
  var tipo = String(d.tipo || "");
  var cidade = String(d.cidade || "");
  if (!tipo) return respJson({ok:false, msg:"Tipo nao informado"});

  var ss = obterPlanilha();

  var aba = ss.getSheetByName("Indice_Config");
  if (aba && aba.getLastRow() >= 2) {
    var vals = aba.getDataRange().getValues();
    for (var i = vals.length - 1; i >= 1; i--) {
      if (String(vals[i][0]) === tipo && String(vals[i][4] || "") === cidade) {
        aba.deleteRow(i + 1);
      }
    }
  }

  var cfg = null;
  if (tipo === "pontos_monitor") cfg = {sheet:"Pontos_Config", cidadeCol:6};
  else if (tipo === "todos_pontos") cfg = {sheet:"Todos_Pontos", cidadeCol:6};
  else if (tipo === "zonas") cfg = {sheet:"Zonas_Config", cidadeCol:5};

  if (cfg) {
    var abaCfg = ss.getSheetByName(cfg.sheet);
    if (abaCfg) {
      if (cidade) _removerConfigCidade(abaCfg, cidade, cfg.cidadeCol);
      else { try { ss.deleteSheet(abaCfg); } catch(e) {} }
    }
  }

  return respJson({ok:true, msg:"Configuracao removida"});
}

function _codigoCidade(cidadeCompleta) {
  // "São Paulo/SP" -> "SaoPaulo_SP"
  if (!cidadeCompleta) return "";
  var s = String(cidadeCompleta);
  // Remove accents
  var mapa = {"a":"àáâãä","e":"èéêë","i":"ìíîï","o":"òóôõö","u":"ùúûü","c":"ç","n":"ñ","A":"ÀÁÂÃÄ","E":"ÈÉÊË","I":"ÌÍÎÏ","O":"ÒÓÔÕÖ","U":"ÙÚÛÜ","C":"Ç","N":"Ñ"};
  for (var base in mapa) { for (var i=0;i<mapa[base].length;i++) s = s.split(mapa[base][i]).join(base); }
  return s.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

function _obterCidadesDoToken(token) {
  if (!token) return "";
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Usuarios");
  if (!aba) return "";
  var vals = aba.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][5]) === String(token)) return String(vals[i][7] || "");
  }
  return "";
}

function cadastrarCidade(d) {
  var perfil = _obterPerfilDoToken(d._token);
  if (perfil !== "admin") return respJson({ok:false, msg:"Apenas admin pode cadastrar cidades"});
  var estado = String(d.estado || "").trim();
  var cidade = String(d.cidade || "").trim();
  if (!estado || !cidade) return respJson({ok:false, msg:"Estado e cidade sao obrigatorios"});

  var cidadeCompleta = cidade + "/" + estado;
  var ss = obterPlanilha();
  var aba = garantirAba(ss, "Cidades_Config", ["Estado","Cidade","CidadeCompleta","CriadoEm"]);

  // Check duplicate
  var vals = aba.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][2]).toLowerCase() === cidadeCompleta.toLowerCase()) {
      return respJson({ok:false, msg:"Cidade '" + cidadeCompleta + "' ja cadastrada"});
    }
  }
  var agora = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
  aba.appendRow([estado, cidade, cidadeCompleta, agora]);
  return respJson({ok:true, msg:"Cidade '" + cidadeCompleta + "' cadastrada", cidadeCompleta:cidadeCompleta});
}

function listarCidadesCadastradas(d) {
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Cidades_Config");
  if (!aba || aba.getLastRow() < 2) return respJson({ok:true, cidades:[]});
  var vals = aba.getDataRange().getValues();
  var cidades = [];
  for (var i = 1; i < vals.length; i++) {
    if (!vals[i][0]) continue;
    cidades.push({
      estado: String(vals[i][0]),
      cidade: String(vals[i][1]),
      cidadeCompleta: String(vals[i][2]),
      criadoEm: String(vals[i][3] || "")
    });
  }
  return respJson({ok:true, cidades:cidades});
}

function deletarCidade(d) {
  var perfil = _obterPerfilDoToken(d._token);
  if (perfil !== "admin") return respJson({ok:false, msg:"Apenas admin pode deletar cidades"});
  var cidadeCompleta = String(d.cidadeCompleta || "");
  if (!cidadeCompleta) return respJson({ok:false, msg:"Cidade nao informada"});
  var ss = obterPlanilha();
  var aba = ss.getSheetByName("Cidades_Config");
  if (!aba) return respJson({ok:false, msg:"Nenhuma cidade cadastrada"});
  var vals = aba.getDataRange().getValues();
  for (var i = vals.length - 1; i >= 1; i--) {
    if (String(vals[i][2]).toLowerCase() === cidadeCompleta.toLowerCase()) {
      aba.deleteRow(i + 1);
      return respJson({ok:true, msg:"Cidade '" + cidadeCompleta + "' removida"});
    }
  }
  return respJson({ok:false, msg:"Cidade nao encontrada"});
}

function listarEstados() {
  var estados = [
    {uf:"AC",nome:"Acre"},{uf:"AL",nome:"Alagoas"},{uf:"AP",nome:"Amapa"},{uf:"AM",nome:"Amazonas"},
    {uf:"BA",nome:"Bahia"},{uf:"CE",nome:"Ceara"},{uf:"DF",nome:"Distrito Federal"},{uf:"ES",nome:"Espirito Santo"},
    {uf:"GO",nome:"Goias"},{uf:"MA",nome:"Maranhao"},{uf:"MT",nome:"Mato Grosso"},{uf:"MS",nome:"Mato Grosso do Sul"},
    {uf:"MG",nome:"Minas Gerais"},{uf:"PA",nome:"Para"},{uf:"PB",nome:"Paraiba"},{uf:"PR",nome:"Parana"},
    {uf:"PE",nome:"Pernambuco"},{uf:"PI",nome:"Piaui"},{uf:"RJ",nome:"Rio de Janeiro"},{uf:"RN",nome:"Rio Grande do Norte"},
    {uf:"RS",nome:"Rio Grande do Sul"},{uf:"RO",nome:"Rondonia"},{uf:"RR",nome:"Roraima"},{uf:"SC",nome:"Santa Catarina"},
    {uf:"SP",nome:"Sao Paulo"},{uf:"SE",nome:"Sergipe"},{uf:"TO",nome:"Tocantins"}
  ];
  return respJson({ok:true, estados:estados});
}

function atribuirCidadesUsuario(d) {
  var perfil = _obterPerfilDoToken(d._token);
  if (perfil !== "admin") return respJson({ok:false, msg:"Apenas admin pode atribuir cidades"});
  var usuario = String(d.usuarioAlvo || "").trim().toLowerCase();
  var cidades = String(d.cidades || "");
  if (!usuario) return respJson({ok:false, msg:"Usuario nao informado"});

  var aba = _garantirAbaUsuarios();
  var vals = aba.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toLowerCase() === usuario) {
      aba.getRange(i+1, 8).setValue(cidades);
      return respJson({ok:true, msg:"Cidades atualizadas para '" + usuario + "'"});
    }
  }
  return respJson({ok:false, msg:"Usuario nao encontrado"});
}

function respJson(d) {
  return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON);
}

function autorizar() {
  var ss = obterPlanilha();
  Logger.log("Planilha: " + ss.getName() + " / ID: " + ss.getId());
  Logger.log("URL: " + ScriptApp.getService().getUrl());
  // SEM try/catch para forcar dialogo de permissao do UrlFetchApp
  var resp = UrlFetchApp.fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios?orderBy=nome");
  Logger.log("IBGE OK! Status: " + resp.getResponseCode() + " | Municipios SP: " + JSON.parse(resp.getContentText()).length);
}
