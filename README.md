# Bakor Hospital Information Management System — prototype

This repository is an independent academic prototype for a private-hospital case study. It is not affiliated with Bakor Hospital. All demo patients, staff and figures are fictional. This is not a certified clinical system and must not be used for real patient care or real patient data. Clinicians make all clinical decisions. The prototype has no automated diagnosis, telemedicine, video or chat; appointments are in person.

## Scope and design choices

The case source lists registration, medical records, appointments, billing and reports; its objectives and DFD also call for laboratory and pharmacy/inventory, so those are included in the schema and initial workspaces. The diagram shows Patient, Doctor and Admin; DFD and operating processes require receptionist, cashier, lab technician and pharmacist roles, which are modeled. Nurses are named as stakeholders but have no process in the diagrams; they are not modeled, and doctors record vitals. Payments are cashier record-keeping for cash, POS and bank transfer, not gateway transactions. There is no HMO/insurance module. The source gives no field-level schema; this schema is original. Reports are intended as descriptive statistics, not machine learning. Health data is sensitive; role checks and selected AES-256-GCM encryption are included as prototype controls, not a legal compliance certification. No real deployment was performed.

The implementation provides seven role dashboards with working prototype flows: patients can book/cancel appointments and review finalized visit summaries and released results; reception can register patients, book visits and check patients in; doctors can open visits, save/finalize consultations, order tests and prescribe medicines; laboratory staff can collect samples, enter results and release them; pharmacists can receive stock and dispense prescriptions; cashiers can create invoices and record payments; administrators can manage accounts, catalogs, doctor schedules, leave and settings, and review audit activity and summary reports. Appointment slot lookup observes doctor schedules, existing bookings and leave. Writes use CSRF protection and role checks, and clinical free text uses the configured AES-256-GCM helper.

This remains an academic prototype. It does not include a complete clinical record lifecycle, patient self-registration, password reset/change screens, exports, configurable reporting, standards-based interoperability, or production-grade billing/inventory controls. The UI uses the project’s custom CSS rather than Bootstrap.

## Requirements

Node.js 20+, npm, and MySQL 8. Docker Compose is supported.

## Configure and run locally

1. Copy `.env.example` to `.env`.
2. Set database credentials and a session secret of at least 32 characters. Generate the encryption key with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and set `DATA_ENCRYPTION_KEY` to its output. The server refuses to start without exactly 64 hex characters.
3. Create the configured MySQL database and apply `db/schema.sql` within that database.
4. Run `npm install`, `npm run seed`, then `npm start`.
5. Open `http://localhost:3000`.

## Deploy to Vercel

The Vercel entry point is `api/index.js`. It exports the Express app without starting the local scheduler or opening a listening port. Connect this repository in Vercel and set the project root to the repository root; Vercel reads `vercel.json` and uses Node.js 20 or newer.

Vercel needs a MySQL database reachable from the public internet (or through a supported private connection). Create the empty database and a restricted database user with the steps below, then apply `db/schema.sql` once from your computer. Do not use the local Docker database for a hosted deployment.

In Vercel, open **Project → Settings → Environment Variables** and add these for Production (and Preview only if you want preview deployments connected to a database):

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DB_HOST` | Database provider's host |
| `DB_PORT` | Provider's MySQL port, usually `3306` |
| `DB_NAME` | Database name you created |
| `DB_USER` | Restricted application database user |
| `DB_PASSWORD` | That user's password |
| `SESSION_SECRET` | A private random string of at least 32 characters |
| `DATA_ENCRYPTION_KEY` | A private key of exactly 64 hexadecimal characters |
| `NOTIFY_MODE` | `simulate` until SMTP and Twilio are intentionally configured |
| `DB_SSL` | `required` when using Aiven MySQL |
| `DB_SSL_CA_BASE64` | Base64-encoded Aiven project CA certificate |

Generate the two secrets locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (run it separately for each key). Never commit either value or your production `.env`. Set Vercel's Git Production Branch to `vercel` in **Project → Settings → Git**. Keep local development on `main`; merge reviewed deployment changes from `main` into `vercel` before deploying. Vercel creates Preview deployments for other branches according to the project's Git settings.

For Aiven MySQL, download the service's CA certificate from its Overview page. Set `DB_SSL=required` locally and in Vercel. For local use, save the downloaded file in the project folder as `aiven-ca.pem` and set `DB_SSL_CA=./aiven-ca.pem`. For Vercel, encode the downloaded file in PowerShell with `$ca = [Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\path\to\ca.pem'))` and paste `$ca` as `DB_SSL_CA_BASE64`. The application verifies the database certificate when this setting is enabled. Keep the CA value and all database credentials out of Git. [Aiven TLS certificate guidance](https://aiven.io/docs/platform/concepts/tls-ssl-certificates)

After adding environment variables, deploy the `vercel` branch from Vercel's Deployments page or push it to the connected GitHub repository. Confirm `/api/health`, sign in with a seeded account, and try each role's main workflow against the hosted database. Seed only fictional/demo data in hosted environments. Configure backups and database network access with the provider. The local in-process scheduler in `src/jobs/scheduler.js` does not run on Vercel; reminder, no-show, and stock-alert jobs need a separately configured scheduled worker before those background tasks are relied on in production. Vercel Cron runs against Production deployments; its available schedule frequency depends on the Vercel plan.

If you need to publish the local branches to GitHub, run `git push -u origin main` and `git push -u origin vercel` from the project folder. Then connect or import that GitHub repository in Vercel and select `vercel` as its Production Branch.

## Create the MySQL database only

These steps create the database and a dedicated app user in MySQL 8. They do not install MySQL or configure Vercel. Run them in MySQL Workbench's SQL editor or the MySQL command line as an administrator. Replace both example passwords with unique private values.

```sql
CREATE DATABASE bakor_hospital CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'bkh'@'%' IDENTIFIED BY 'replace-with-a-long-unique-password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON bakor_hospital.* TO 'bkh'@'%';
FLUSH PRIVILEGES;
```

Then apply the schema to that database. From PowerShell in the project folder, if the MySQL client is installed:

```powershell
Get-Content db/schema.sql -Raw | mysql -h YOUR_DB_HOST -P 3306 -u bkh -p bakor_hospital
```

Enter the `bkh` password when prompted. The schema command creates the application's tables; then configure matching `DB_*` variables in `.env` for local use or in Vercel for deployment. To load demo logins and sample records, separately run `npm run seed` in an environment with those variables configured. Do not use seeded demo credentials for real accounts.

## Docker Compose

Copy `.env.example` to `.env`, provide unique local passwords/secrets, then run `docker compose up --build`. The MySQL container initializes tables from `db/schema.sql`. In a second terminal run `docker compose exec app npm run seed`. Stop with `docker compose down`. Persistent local database files remain in the `mysql_data` volume.

For deployment, run the app and database on a private cloud VM/network, expose only the app through a reverse proxy with HTTPS, set `NODE_ENV=production`, use managed secrets and backups, restrict database ingress, configure SMTP/Twilio only if live notification delivery is intended, and monitor patching and logs. No deployment has been performed.

## Demo accounts

Each seeded account password is exactly `password123`:

| Role | Login |
| --- | --- |
| Admin | `admin@bakorhospital.test` |
| Doctors | `doctor1@bakorhospital.test`, `doctor2@bakorhospital.test`, `doctor3@bakorhospital.test` |
| Receptionist | `reception1@bakorhospital.test` |
| Cashier | `cashier1@bakorhospital.test` |
| Lab technician | `lab1@bakorhospital.test` |
| Pharmacist | `pharmacist1@bakorhospital.test` |
| Patients | `patient1@bakorhospital.test`, `patient2@bakorhospital.test`, `patient3@bakorhospital.test` |

## Notification mode

`NOTIFY_MODE=simulate` records outgoing email messages in `sent_messages`. `NOTIFY_MODE=live` uses SMTP for email and Twilio for SMS; credentials must be configured. Do not use live mode with real patient data.

## Schema notes

The schema is an original design, not supplied by the case source. Clinical free-text columns are named with `_enc`; AES-256-GCM helpers are in `src/engine/crypto.js`. Do not populate those columns with plaintext. Demo seed data is categorical and fictional.

## Exact commands

Local: `Copy-Item .env.example .env`; configure `.env`; `npm install`; `mysql -u bkh -p bakor_hospital < db/schema.sql`; `npm run seed`; `npm start`.

Docker: `Copy-Item .env.example .env`; configure `.env`; `docker compose up --build -d`; `docker compose exec app npm run seed`.
