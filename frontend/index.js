import React, { useState, useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function Narrative({name, tags}) {
  const [transcription, setTranscription] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchTranscription() {
      const t = await fetch(`narratives/${name}.txt`)
        .then(async res => res.text());

      if (!ignore) {
        setTranscription(t);
      }
    }

    fetchTranscription();

    return () => {
      ignore = false;
    };

  }, []);

  return (
    <div className={'narrative'}>
      <div className={'transcription'}>
        {transcription}
      </div>
      <div>
        <audio controls>
          <source src={`narratives/${name}.mp3`} type={'audio/mpeg'} />
          {'Your browser does not support the audio element'}
        </audio>
      </div>
    </div>
  );
}

function App() {
  const [recordingsData, setRecordingsData] = useState([]);
  
  useEffect(() => {
    let ignore = false;

    async function fetchRecordingsData() {
      const recordings = await fetch('recordings-data.json')
        .then(res => res.json())
        .then(async (json) => json.recordings);

      if (!ignore) {
        setRecordingsData(recordings);
      }
    }

    fetchRecordingsData();

    return () => {
      ignore = true;
    };

  }, []);

  return (
    <>
      <img className={'logo'} src={'jsn-logo-transparent.png'} />
      {recordingsData.map(datum => 
        <Narrative key={datum.name} name={datum.name} tags={datum.tags} />
      )}
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
