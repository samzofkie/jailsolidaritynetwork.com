import React, { useState, useEffect, useRef, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Recording from './Recording.js';
import SearchControls from './SearchControls.js';

function App() {
  const [recordingsList, setRecordingsList] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  let allTags = useRef([]);
  
  useEffect(() => {
    let ignore = false;

    async function fetchRecordingsList() {
      let recordings = await fetch('recordings-data.json')
        .then(res => res.json())
        .then(async (json) => json.recordings);

      if (!ignore) {
        recordings = recordings.map(recording => ({ 
          ...recording, 
          ...(recording.tags === undefined ? { tags: [] } : {})
        }));

        setRecordingsList(recordings);

        allTags.current = recordings.reduce((all, r) => [...all, ...r.tags.filter(tag => !all.includes(tag))], []);
        
        setSelectedTags(allTags.current);

      }
    }

    fetchRecordingsList();

    return () => {
      ignore = true;
    };

  }, []);

  function toggleTag(tagName) {
    if (selectedTags.includes(tagName))
      setSelectedTags(selectedTags.filter(tag => tag !== tagName));
    else
      setSelectedTags(selectedTags.concat([tagName]));
   }

  const allTagsSelected = allTags.current.length === selectedTags.length;

  return (
    <>
      <SearchControls allTags={allTags} selectedTags={selectedTags} toggleTag={toggleTag} />
      <div>
        {
          (allTagsSelected ? recordingsList : 
            recordingsList.filter(recording => recording.tags.reduce(
              (oneTagSelected, tag) => oneTagSelected || selectedTags.includes(tag), false
            ))
          ).map(recording =>
              <Recording 
                key={recording.name} 
                name={recording.name} 
                tags={recording.tags} 
              />
          )
        }
      </div>
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
