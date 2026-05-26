# Configuration reference

## Environment variables

| Variable              | Required | Description                        |
| --------------------- | -------- | ---------------------------------- |
| `EXPO_PUBLIC_API_URL` | Yes      | URL of the Frontis GraphQL gateway |

### Values by context

| Context     | Value                                                   |
| ----------- | ------------------------------------------------------- |
| Development | `https://frontis-gateway.nicolas-lamirault.workers.dev` |
| Production  | `https://frontis-gateway.pilotariak.com`                |
| Local       | `http://localhost:4000/graphql`                         |

Variables prefixed `EXPO_PUBLIC_` are bundled into the client at build time. They are **not** secrets — do not store credentials in these variables.

## EAS build profiles

Defined in `eas.json`.

| Profile       | Extends | Channel      | `autoIncrement` | Notes                            |
| ------------- | ------- | ------------ | --------------- | -------------------------------- |
| `base`        | —       | —            | No              | Shared bun version and base env  |
| `development` | `base`  | —            | No              | Dev client, iOS simulator target |
| `preview`     | `base`  | `preview`    | No              | Internal distribution            |
| `production`  | `base`  | `production` | Yes             | Store release, overrides API URL |

## EAS CLI version

Minimum required: `>= 18.3.0` (enforced by `eas.json`).

## App version source

Set to `remote` — the build number is managed by EAS, not `app.json`. Do not increment build numbers manually.
