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