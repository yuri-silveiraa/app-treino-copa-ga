# Copa GA Treino

MVP web para treino da Copa dos GA's. O projeto é um monorepo com `backend` em Node.js, Express, TypeScript, Prisma e SQLite, e `frontend` em React, Vite e TypeScript.

## Estrutura

```txt
copa-ga-treino/
  backend/
    prisma/
      schema.prisma
      seed.ts
    src/
      data/questions/
      middleware/
      routes/
      utils/
  frontend/
    src/
      components/
      contexts/
      pages/
      services/
      types/
  docker-compose.yml
```

## Rodando localmente

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

URLs locais:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3333`
- Healthcheck: `http://localhost:3333/health`

Usuários iniciais criados pelo seed:

- `yuri` / `123456`
- `paula` / `123456`
- `rafaela` / `123456`
- `natanael` / `123456`
- `masterson` / `123456`
- `jogador` / `123456`

## Questões

As questões ficam em `backend/src/data/questions`. Cada arquivo de tema exporta um array inicialmente vazio. Para cadastrar questões depois, preencha os arrays seguindo o tipo `QuestionSeed`.

Exemplo:

```ts
export const gaQuestions: QuestionSeed[] = [
  {
    theme: "GA",
    difficulty: "EASY",
    statement: "Texto da pergunta",
    alternatives: ["A", "B", "C", "D"],
    correct: "A",
    explanation: "Explicação da resposta correta",
    source: "Opcional",
  },
];
```

Depois rode o seed novamente.

## Resetando banco e seed

```bash
cd backend
npm run prisma:reset
```

O comando reseta o SQLite, aplica as migrations e roda o seed. Para rodar apenas o seed:

```bash
cd backend
npm run prisma:seed
```

## Docker com Traefik

Copie o exemplo de variáveis:

```bash
cp .env.example .env
```

Edite `APP_DOMAIN`, `API_DOMAIN`, `VITE_API_URL`, `JWT_SECRET` e `FRONTEND_URL`. O compose espera uma rede externa chamada `traefik-public`, criada pelo seu Traefik.

Suba com:

```bash
docker compose up -d --build
```

O backend usa SQLite persistido no volume Docker `backend_data`.

## Scripts

Backend:

- `npm run dev`
- `npm run build`
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run prisma:reset`

Frontend:

- `npm run dev`
- `npm run build`
