# Contas de demonstração

Criadas por `prisma/seed.ts` quando `SEED_DEMO_DATA=true` (padrão no `docker-compose.yml`; desligado em produção).
Os e-mails usam o domínio reservado `.test`, que nunca entrega mensagens.

> **Somente para desenvolvimento e apresentações.** Estas senhas são públicas — nunca habilite os dados de demonstração em produção.

## Equipe e conta base

| Perfil | Nome | E-mail | Senha | Portal de login |
| --- | --- | --- | --- | --- |
| Admin | Admin Barbeiro | admin@example.com | 1234 | Admin |
| Barbeiro | João Mestre | joao.mestre@barbershop.com | 123456 | Admin |
| Barbeiro | Pedro Silva | pedro@barbershop.com | 123456 | Admin |
| Barbeiro | Carlos Barbosa | carlos@barbershop.com | 123456 | Admin |
| Cliente | João Silva | joao@test.com | 123456 | Cliente |

## Clientes de demonstração

Todos entram pelo portal **Cliente**.

| Nome | E-mail | Telefone | Senha |
| --- | --- | --- | --- |
| Lucas Oliveira | lucas.oliveira@exemplo.test | (11) 98765-4321 | Lucas@2026 |
| Gabriel Santos | gabriel.santos@exemplo.test | (11) 97654-3210 | Gabriel@2026 |
| Matheus Souza | matheus.souza@exemplo.test | (11) 96543-2109 | Matheus@2026 |
| Rafael Pereira | rafael.pereira@exemplo.test | (11) 95432-1098 | Rafael@2026 |
| Felipe Costa | felipe.costa@exemplo.test | (11) 94321-0987 | Felipe@2026 |
| Bruno Almeida | bruno.almeida@exemplo.test | (11) 93210-9876 | Bruno@2026 |
| Thiago Rodrigues | thiago.rodrigues@exemplo.test | (11) 92109-8765 | Thiago@2026 |
| Gustavo Ferreira | gustavo.ferreira@exemplo.test | (11) 91098-7654 | Gustavo@2026 |
| Leonardo Lima | leonardo.lima@exemplo.test | (11) 99876-1234 | Leonardo@2026 |
| Vinícius Carvalho | vinicius.carvalho@exemplo.test | (11) 98761-2345 | Vinicius@2026 |
| Pedro Henrique Ribeiro | pedro.ribeiro@exemplo.test | (11) 97612-3456 | PedroH@2026 |
| João Victor Martins | joao.martins@exemplo.test | (11) 96123-4567 | JoaoV@2026 |
| Caio Barbosa | caio.barbosa@exemplo.test | (11) 91234-5678 | Caio@2026 |
| Diego Araújo | diego.araujo@exemplo.test | (11) 92345-6789 | Diego@2026 |
| Rodrigo Gomes | rodrigo.gomes@exemplo.test | (11) 93456-7890 | Rodrigo@2026 |
| André Nascimento | andre.nascimento@exemplo.test | (11) 94567-8901 | Andre@2026 |
| Marcelo Rocha | marcelo.rocha@exemplo.test | (11) 95678-9012 | Marcelo@2026 |
| Eduardo Dias | eduardo.dias@exemplo.test | (11) 96789-0123 | Eduardo@2026 |
| Ricardo Teixeira | ricardo.teixeira@exemplo.test | (11) 97890-1234 | Ricardo@2026 |
| Fernando Moreira | fernando.moreira@exemplo.test | (11) 98901-2345 | Fernando@2026 |

## Agendamentos

- Período: 20/11/2026 a 31/01/2027, de segunda a sexta, 08:00–18:00 (horário de Brasília), sem atendimento em 25/12 e 01/01.
- Gerados de forma determinística (mesma semente → mesma agenda), sem sobreposição por barbeiro ou por cliente.
- Antes de 20/11/2026 15:00: concluídos ou cancelados. Depois: pendentes, confirmados ou cancelados.
- Gerados só uma vez: se já existirem agendamentos `demo-*`, o seed não cria novos.
