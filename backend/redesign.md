### <u>containers</u>:

  1) reverse proxy (nginx)
  2) API (node)
  3) database (postgres)

The reverse proxy implements SSL, serves static content, and forwards certain requests to the API.

The API includes two main resources and some methods:

| HTTP Request | REST Method | Authenticated | Request Body | Response Body |
| --- | --- | --- | --- | --- |
| `GET /auth` | `Get` | Password | Username and plain-text password (query string) | JWT |
| `GET /categories` | `List` | | | JSON array of categories |
| `GET /divisions` | `List` | | | JSON array of divisions |
| `GET /genders` | `List` | | | JSON array of valid values for gender |
| `GET /testimonies` | `List` | | Query parameters | JSON array of testimonies |
| `GET /testimonies/:id` | `Get` | | | JSON testimony |
| `POST /testimonies` | `Create ` | Token | Testimony data | |
| `PUT /testimonies/:id` | `Update` | Token | Testimony data |
| `DELETE /testimonies/:id` | `Delete` | Token | |

This all is coming from reading [https://cloud.google.com/apis/design](https://cloud.google.com/apis/design).
  