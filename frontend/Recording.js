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

  function convertTimestampToSeconds(ts) {
    return Number(ts.slice(0,2)) * 60 + Number(ts.slice(3));
  }
  
  return (
    <div className={'recording'}>
      
      <div className={'transcription'} 
        style={transcriptionExpanded ? 
          {'WebkitTextFillColor': 'black'} : 
          {'maxHeight': '30vh'}}>
            {
              transcription
                .split('\n')
                .filter(s => s.length > 0)
                .reduce((acc, curr, currIndex, arr) => {
                  if (currIndex % 2 === 0)
                    acc.push(
                      {
                        'seconds': convertTimestampToSeconds(arr[currIndex]),
                        'text': arr[currIndex + 1]
                      }
                    );
                  return acc;
                }, []).map((para, i) =>
                  <p key={i} seconds={para.seconds}>{para.text}</p>
                )
            }
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

