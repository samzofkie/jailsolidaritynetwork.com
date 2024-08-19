## jailsolidaritynetwork.com

[jailsolidaritynetwork.com](https://jailsolidaritynetwork.com) is a site for publishing writings and recordings from inmates incarcerated in Cook County Jail in Chicago.

### Frontend
Public-facing pages:
- `index.html`
- `archive.html`
- `dart.html`
- `timeline.html`
- `about.html`
- `action.html`
- `:id.html`

Admin-only pages:
- `login.html`
- `admin.html`
- `upload.html`

The frontend uses `vite` for development (dev server and bundling), `nanoid` to generate unique identifiers for a few features, my own small NPM package [`@samzofkie/component`](https://www.npmjs.com/package/@samzofkie/component).

### Backend
The backend is orchestrated with Docker Compose, and is made up of a few microservices:
- An `nginx` reverse proxy that 
  - serves static content, 
  - forwards certain requests to the `node` API container, 
  - implements SSL,
  - redirects HTTP to HTTPS and
  - handles log rotation with `cron` and `logrotate`
- A `node` container that provides a REST API (documented below) that primarily
  - provides CRUD operations for testimony data in the `postgres` database,
  - implements JWT-based user authentication and
  - handles file uploads.
- A `postgres` database that is read from and written to by the `node` API
 
The `node` container's REST API exposes the following endpoints:

| REST Method | HTTP Request | Header | Query String | Request Body | Response Body |
| --- | --- | --- | --- | --- | --- |
| `Get`    | `GET /categories` |
| `Get`    | `GET /divisions` |
| `Create` | `POST /auth` |
| `List`   | `GET /testimonies` |
| `Create` | `POST /testimonies` |
| `Get`    | `GET /testimonies/:id` |
| `Update` | `PUT /testimonies/:id` |
| `Delete` | `DELETE /testimonies/:id` |
| `Create` | `POST /testimonies/:id/files` |
| `Update` | `PUT /testimonies/:id/files/:fileId` |
| `Delete` | `DELETE /testimonies/:id/file/:fileId` |

A *testimonyObject* has the following properties:
- `id` (*integer*): the database id for the particular testimony
- `date_received` (*string*): a date of the form `MM-DD-YYYY`
- `length_of_stay` (*integer*): the number of months the respondent has been incarcerated
- `gender` (*string*): the gender of the respondent
- `divisions` (*array of strings*): the divisions the respondent has been incarcerated in
- `sentences` (*array of objects*):
  - `id` (*integer*): the integer id of that sentence
  - `sentence` (*string*): the actual text of that sentence (a Postgres `TEXT` value)
  - `categories` (*array of strings*): the full name of the categories associated with that sentence
- `files` (*array of strings*): a list of document files associated with the testimony

`GET /testimonies` responds with an array of *testimonyObject*s, one for each testimony in the database, and `GET /testimonies/:id` responds with the data for the single testimony with the id value `:id`.