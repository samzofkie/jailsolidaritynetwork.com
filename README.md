### [jailsolidaritynetwork.com](https://jailsolidaritynetwork.github.io)

The `manifest.json` file is the first thing `fetch`ed by the frontend-- it's main property is called `testimonies`, and it's value is an array of objects, each containing the metadata for an audio or scanned, handwritten testimony. The testimony objects' (required) fields are
|property|value|
|-|-|
|`id`| A unique `nanoid`. |
|`type`| (Currently) `"audio"` or `"document"`. |
|`date`| A month and year value, in the format `"YYYY-MM"` (e.g. `"2023-09"`.) |

Code `fetch`es different resources (audio, images, ect.) from the server based on the `type` property. All testimonies have a `.txt` file that is a text transcription of the audio recording, or scanned written document. Currently, audio recordings follow the format:

```
00:00
A transcribed sentence from the recording.

00:01
More text
...
```

and so on, where the timestamps correspond to the beginning of that sentence in the audio recording.

Testimonies with `type` `"document"` follow the format:

```
Sentence sentence sentence

More text
...
```

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

- Separate pages for testimonies
  - Mobile page margin top
  - Document page
- `TestimonyTranscription` proper async, fetchTranscription() method return Promise
- `Loadable`, `Title`, `Component` classes
- Only make variable member if actually needed
- `.root` member
- Comments

- UI design doc
- Tests
- `AudioTestimonyTranscription` text highlighting
- Handling window resizing?
- What are the documents in response to (text)?
- Where were the recordings taken?
- Server side rendering

### Coding Style

This project has been a fun experiment about the best way to structure a frontend with a decent amount of complexity using only vanilla JS. The guiding principles I've been exploring have been:

- Doing everything programatically (i.e. creating all HTML elements and doing all CSS styling with JavaScript)
- Using an OOP-like, React-like separation of concerns

Almost every class handles the creation and population of a `<div>` called `.rootDiv`, which is then injected into the proper place in the DOM by the creator of the object. This forms a React-like hierarchy of objects (components).
