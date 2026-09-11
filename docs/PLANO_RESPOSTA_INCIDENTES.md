# 🚨 Plano de Resposta a Incidentes de Segurança — Catraki SEM

**Sistema:** Saúde em Movimento (sem.catraki.com.br)  
**Classificação dos Dados:** Dados Pessoais Sensíveis de Saúde (LGPD Art. 5º, II + Art. 11)  
**Última revisão:** 2026-09-11  

---

## 1. Classificação de Severidade

| Nível | Descrição | Exemplo | Tempo de Resposta |
|:-----:|:----------|:--------|:------------------|
| **P0 — Crítico** | Acesso não autorizado a dados PII ou comprometimento de chaves criptográficas | Vazamento de KEK_HEX, SQL injection com exfiltração, acesso admin não autorizado | **Imediato** (< 1h) |
| **P1 — Alto** | Tentativa de exploração ativa ou vulnerabilidade confirmada em produção | Brute force massivo, XSS persistente, escalação de privilégio | **< 4h** |
| **P2 — Médio** | Vulnerabilidade identificada sem exploração ativa | CVE em dependência, configuração incorreta de CORS | **< 24h** |
| **P3 — Baixo** | Anomalia sem impacto direto na segurança dos dados | Rate limit excedido por bot, tentativa de login falha recorrente | **< 72h** |

---

## 2. Contatos de Emergência

| Papel | Nome | Contato | Responsabilidade |
|:------|:-----|:--------|:-----------------|
| **Responsável Técnico** | [PREENCHER] | [TELEFONE/EMAIL] | Isolamento técnico, análise forense |
| **DPO (Encarregado de Dados)** | [PREENCHER] | [TELEFONE/EMAIL] | Notificação ANPD, comunicação aos titulares |
| **Gestor do Projeto** | [PREENCHER] | [TELEFONE/EMAIL] | Decisões de negócio, comunicação institucional |
| **ANPD** | Autoridade Nacional de Proteção de Dados | anpd.gov.br | Notificação obrigatória em caso de incidente com dados pessoais |

---

## 3. Procedimento de Resposta (Passo a Passo)

### 3.1 Detecção e Triagem (0–30 min)

1. **Identificar o incidente** — Verificar alertas, logs do Cloudflare, relatos de usuários
2. **Classificar a severidade** — Usar a tabela acima
3. **Documentar evidências iniciais** — Capturar logs, timestamps, IPs envolvidos
4. **Notificar o Responsável Técnico** — Imediatamente para P0/P1

### 3.2 Contenção Imediata (30 min – 2h)

#### Se houver acesso não autorizado:
```
1. Revogar TODOS os tokens JWT ativos:
   → INSERT INTO tokens_revogados (jti, expira_em) 
     SELECT DISTINCT jti, exp FROM [analisar logs de emissão]
   → Ou: rotacionar JWT_SECRET no painel do Cloudflare (invalida todos os tokens)

2. Desativar contas comprometidas:
   → UPDATE usuarios SET ativo = 0 WHERE id = '<id_comprometido>'

3. Se a KEK_HEX foi comprometida:
   → Rotacionar IMEDIATAMENTE no Cloudflare Pages → Environment Variables
   → ⚠️ IMPORTANTE: Antes de rotacionar, exportar todos os dados PII com a KEK atual
   → Re-criptografar com a nova KEK
```

#### Se houver ataque em andamento:
```
1. Ativar modo de manutenção (se disponível)
2. Bloquear IPs atacantes no Cloudflare WAF / Firewall Rules
3. Verificar se rate limiting está funcionando
4. Analisar logs: POST /api/v1/auth/login com múltiplas falhas
```

### 3.3 Análise e Investigação (2h – 24h)

1. **Analisar logs de auditoria** — Filtrar por `tipo: 'AUDITORIA'` e `tipo: 'LOG_ACESSO'`
2. **Verificar acessos** — Quais dados foram acessados? Por quem? Quando?
3. **Avaliar impacto** — Quantos titulares afetados? Quais dados expostos?
4. **Preservar evidências** — Exportar logs antes que expirem (Cloudflare retém 72h no Free)

### 3.4 Notificação LGPD (até 72h)

Se o incidente envolver dados pessoais:

> **LGPD Art. 48:** O controlador deverá comunicar à ANPD e ao titular a ocorrência de incidente de segurança que possa acarretar risco ou dano relevante.

**Comunicar à ANPD:**
- Descrição da natureza dos dados pessoais afetados
- Informações sobre os titulares envolvidos
- Indicação das medidas técnicas de segurança utilizadas
- Riscos relacionados ao incidente
- Medidas tomadas para reverter ou mitigar os efeitos

**Comunicar aos titulares (se aplicável):**
- Em linguagem clara e acessível
- Quais dados foram afetados
- O que estamos fazendo para protegê-los

### 3.5 Recuperação (24h – 72h)

1. **Restaurar serviços** — Após confirmação de que a ameaça foi neutralizada
2. **Verificar integridade dos dados** — Comparar com backups
3. **Aplicar correções** — Patches, atualizações de dependências, ajustes de configuração
4. **Monitoramento intensificado** — 7 dias após o incidente

### 3.6 Pós-Incidente (1–2 semanas)

1. **Relatório de incidente** — Documentar timeline, causa raiz, impacto, ações tomadas
2. **Lições aprendidas** — O que falhou? O que pode ser melhorado?
3. **Atualizar procedimentos** — Ajustar este plano conforme necessário
4. **Comunicação final** — Informar stakeholders sobre resolução

---

## 4. Checklist de Recuperação

- [ ] Tokens JWT comprometidos foram revogados
- [ ] Contas comprometidas foram desativadas
- [ ] Senhas foram rotacionadas (se aplicável)
- [ ] Chaves criptográficas foram rotacionadas (se aplicável)
- [ ] Logs foram preservados e exportados
- [ ] ANPD foi notificada (se aplicável, em até 72h)
- [ ] Titulares foram notificados (se aplicável)
- [ ] Correções técnicas foram aplicadas
- [ ] Monitoramento intensificado está ativo
- [ ] Relatório de incidente foi elaborado

---

## 5. Comandos Úteis de Emergência

```bash
# Gerar novas chaves criptográficas de produção
npm run gerar:chaves

# Verificar pacientes com retenção vencida
curl -X GET https://sem.catraki.com.br/api/v1/manutencao/retencao-vencida \
  -H "Cookie: token=<token_admin>"

# Executar limpeza de dados expirados
curl -X POST https://sem.catraki.com.br/api/v1/manutencao/limpeza \
  -H "Cookie: token=<token_admin>"
```
