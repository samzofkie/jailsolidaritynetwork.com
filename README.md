### [jailsolidaritynetwork.com](https://jailsolidaritynetwork.github.io)

The `manifest.json` file is the first thing `fetch`ed by the frontend-- it's main property is called `testimonies`, and it's value is an array of objects, each containing the metadata for an audio or scanned, handwritten testimony. The testimony objects' (required) fields are
|property|value|
|-|-|
|name| Essentially a unique identifier. |
|type| (Currently) `"audio"` or `"document"`. |
|date| A month and year value, in the format `"YYYY-MM"` (e.g. `"2023-09"`.) |

### Plan

1. Cards to display each testimony
   1. How to handle long transcription text? Does each transcription card link to a whole page?
   1. Design for `"audio"` type
      1. Where does the `<audio>` player sit in relation to the transcription text?
      2. Text highlighting corresponding to the audio
   1. Design for `"document"` type
      1. Where does `<img>` sit in relation to the transcription text?
      2. Is there a button to open the full PDF?
2. Search page
   1. Detail the transcription format, including timestamps and tags
   2. A new page or a drop down menu on the new page?
3. User input
   1. A server
   2. Where to put the `<textarea>`

### TODO

- Tests
- `DocumentTestionyCard`
- `TestimonyDeck`
- Separate pages for testimonies
