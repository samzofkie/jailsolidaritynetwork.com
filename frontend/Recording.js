import React, { useState, useEffect } from 'react';

export default function Recording({name, tags}) {
  const [transcription, setTranscription] = useState('');
  const [transcriptionExpanded, setTranscriptionExpanded] = useState(false);

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
    <div className={'recording'}>
      
      <div className={'transcription'} 
        style={transcriptionExpanded ? 
          {'WebkitTextFillColor': 'black'} : 
          {'maxHeight': '100px'}}>
            {transcription}
      </div>
      
      <div className={'expand-and-tags-row'}>
        <span 
          className={'material-symbols-outlined'} 
          onClick={() => setTranscriptionExpanded(!transcriptionExpanded)}> 
            {'expand_' + (transcriptionExpanded ? 'less' : 'more')} 
        </span>
        {tags.map((tag, i) => <span key={i} className={'tag'}>{tag}</span>)}
      </div>
      
      <div className={'audio-container'}>
        <audio controls>
          <source src={`narratives/${name}.mp3`} type={'audio/mpeg'} />
          {'Your browser does not support the audio element'}
        </audio>
      </div>
    
    </div>
  );
}

