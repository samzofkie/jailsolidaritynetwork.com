### <u>containers</u>:

  1) reverse proxy (nginx)
  2) API (node)
  3) database (postgres)

The reverse proxy implements SSL, serves static content, and forwards certain requests to the API.

The API has the following resource model:
  - a resource respresenting valid categories: `categories`,
  - a resource representing valid divisions: `divisions`,
  - a collection serving authentication tokens: `auth`,
  - and a collection of testimonies: `testimonies/*`, where each testimony has:
    - a collection of files: `testimonies/*/files/*`,

and supports the following methods:
| REST Method | HTTP Request | Header |
| --- | --- | --- |
| `Get`    | `GET /categories` |
| `Get`    | `GET /divisions` |
| `Create` | `POST /auth` |
| `List`   | `GET /testimonies` |
| `Create` | `POST /testimonies` |
| `Get`    | `GET /testimony/:id` |
| `Update` | `PUT /testimony/:id` |
| `Delete` | `DELETE /testimony/:id` |
| `Create` | `POST /testimony/:id/files` |
| `Update` | `PUT /testimonies/:id/files/:fileId` |
| `Delete` | `DELETE /testimonies/:id/file/:fileId` |


(Inspired by [https://cloud.google.com/apis/design](https://cloud.google.com/apis/design)).
  