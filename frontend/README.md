# React + Vite

## Environment setup

- Backend: copy `../backend/.env.example` to `../backend/.env` and set `DATABASE_URL` to the PostgreSQL connection string from your Supabase project's **Connect** dialog. URL-encode special characters in the password and keep this file private.
- Frontend: `VITE_API_BASE_URL` optionally overrides the hosted API URL configured in `src/api.js`. Set it in the frontend host's environment settings if using a different backend; Vite reads this variable at build time.
- CORS: when changing the deployed frontend domain, add its origin (scheme and hostname, without a path) to `allow_origins` in `../backend/app/main.py`.

Install backend dependencies from the `backend` directory with `pip install -r requirements.txt`, then start the API with `uvicorn app.main:app --reload`. Start the frontend from the `frontend` directory with `npm install` and `npm run dev`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
