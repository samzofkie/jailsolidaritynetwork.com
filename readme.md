## jailsolidaritynetwork.com

[jailsolidaritynetwork.com](https://jailsolidaritynetwork.com) is a site for publishing writings and recordings from inmates incarcerated in Cook County Jail in Chicago.

### Frontend
TODO

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
 
The `node` container's API is specified in `backend/openapi.yaml`.