### little stuff:
- Add `testimony_id` column to `testimony_sentences_categories`
- Reconsider migrating `api` from CommonJS to ES6
- What happens if file upload fails?
  -  redirect or success message on file upload success
- API and frontend should use camel case
- Header logo should redirect to index.html
- Rename `categories` `topics`
  - `testimony_sentences` `sentence` `text`
  - Plural noun usage in all tables
- Shared function between frontend and backend
  - `formatDate`
- `testimonies` `gender` column value should be text
- test `data.transcription` upload functionality for `POST /testimonies`
- `UploadForm.js` making `POST /testimonies/:id/files` request when you click add file and then cancel
- Consider best place to store static files (currently in `document/` directory in `backend/`) and logs in production
- `validateTestimonyWriteObject` is massive-- class?
- Wouldn't the SQL `SELECT` commands in the handlers for `GET /testimonies` and `GET /testimonies/:id` feel more natural in `db.js`?
- MIME type column in testimony_files
- `uploaded_by` and `last_updated` columns in most tables
- refactor helper function out of `verifyTestimonyId` and `verifyFileId`
- File upload should return 201 not 200

### big stuff:
  - Finish API
  - Redesign UI
  - Testing
    - Jest
    - Playwright (or Puppeteer)
    - Integration testing (?)
  - Rewrite API for [idempotency](https://medium.com/@sahintalha1/the-way-psps-such-as-paypal-stripe-and-adyen-prevent-duplicate-payment-idempotency-keys-615845c185bf)
  - Use Cloudflare for DDOS security and CDN performance
  - Implement system for Nginx log rotation
  - Implement system for database backups and restores
  - Implement SSR
  - Improve SEO
  - Implement front-end routing

----
testing thoughts:

- Integration test `api` with `database` without Nginx
- Integration test everything through Nginx HTTPS ignoring invalid certificate warnings
- Integration test everything with special `nginx.conf` to allow HTTP
- Figure out how i will seperate concerns in Express app and unit test domain logic 
  - i would like the route's handler's logic to be in the `app.use(...` call, and would prefer to keep the route all in the `api.js` file with the database connection pool as a top-level variable