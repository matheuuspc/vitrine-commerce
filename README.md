# Vitrine — plataforma de pedidos para e-commerce

Loja demonstrativa em React e Spring Boot. O fluxo inclui catálogo, busca, filtro por categoria, carrinho, finalização de pedido e controle de estoque no servidor.

## Tecnologias

- Frontend: React 18, Vite e Lucide.
- Backend: Java 17, Spring Boot 3, Spring Web, Spring Data JPA e Bean Validation.
- Banco local: H2 em memória (os dados de demonstração são criados ao iniciar a API).
- Banco para evolução: PostgreSQL, já incluído como dependência.

## Executar localmente

Pré-requisitos: Node.js 20+ e Java 17+. Maven 3.9+ para executar a API. Para executar tudo em containers, instale Docker com Compose.

1. Inicie a API:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Em outro terminal, inicie o site:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Acesse http://localhost:5173. A documentação da API está abaixo; o console H2 local fica em http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:vitrine`, usuário `sa`, senha vazia).

Se a API não estiver ligada, a interface abre com catálogo demonstrativo e checkout de demonstração. Com a API ligada, o pedido é persistido e o estoque é atualizado pelo backend.

### Executar a versão completa com Docker

Na raiz do projeto, rode `docker compose up --build` e acesse http://localhost:5173. O banco PostgreSQL mantém os dados entre reinicializações.

## Como o estoque evita vendas acima do disponível

O frontend usa o estoque para orientar a pessoa durante a compra, mas essa informação pode ficar desatualizada. No checkout, o backend agrupa unidades repetidas, adquire um bloqueio pessimista nas linhas de produto, em ordem estável, valida a quantidade dentro de uma transação e só então reduz o estoque e grava o pedido. Se duas compras disputarem as últimas unidades, a segunda espera a primeira transação e recebe HTTP 409 quando não houver saldo. Se qualquer etapa falhar, a transação reverte tanto o pedido quanto a baixa de estoque.

## API

### `GET /api/products`

Retorna catálogo, preço e unidades disponíveis.

### `POST /api/orders`

```json
{
  "customerName": "Ana Silva",
  "customerEmail": "ana@example.com",
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

Retorna HTTP 201 com o pedido criado. Dados inválidos retornam HTTP 400; estoque insuficiente ou produto inexistente retornam HTTP 409 com uma mensagem em `message`.

## Próximas evoluções para portfólio

- Autenticação e perfis administrativos.
- Paginação, ordenação e cadastro de produtos.
- Histórico de pedidos e atualização das etapas de entrega.
- Idempotência no checkout, trilha de auditoria e documentação OpenAPI.
- Histórico de pedidos e atualização das etapas de entrega.

O GitHub Actions executa o build do React e a suíte de testes do backend em cada pull request e envio para `main`. O teste de concorrência tenta consumir as mesmas unidades em duas compras simultâneas e confirma que apenas um pedido é aceito.
