# EdustayFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Deploy Automatico En Vercel

Este repositorio ya incluye:

- `vercel.json` con configuracion para Angular SPA.
- `.github/workflows/vercel-deploy.yml` para despliegue automatico.

Comportamiento del workflow:

- `push` a `master` o `main`: deploy a produccion.
- `pull_request`: deploy preview y comentario con URL en el PR.

### 1. Crear proyecto en Vercel y vincularlo una vez

En tu maquina local, en la raiz del proyecto:

```bash
npx vercel login
npx vercel link
```

Esto crea `.vercel/project.json` localmente con IDs del proyecto.

### 2. Configurar Secrets en GitHub

En `GitHub > Settings > Secrets and variables > Actions`, crea estos secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Puedes obtener `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` de `.vercel/project.json` despues de ejecutar `vercel link`.

### 3. Confirmar rama de produccion

El workflow despliega produccion cuando hay push a `master` o `main`.
