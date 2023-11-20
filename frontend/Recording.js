import React, { useState, useRef, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

function Audio({ name, setPlaybackTime }) {
  const {height, width} = useWindowDimensions();
  const ref = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      setInterval(() => setPlaybackTime(ref.current.audioEl.current?.currentTime), 100);
    }
    return () => clearInterval(interval);
  });
  

  return (
    <div className={'audio-container'}>
      <ReactAudioPlayer 
        src={`narratives/${name}.mp3`} 
        controls 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        ref={ref}
      />
    </div>
  );
}

export default function Recording({name, tags}) {
  const [transcription, setTranscription] = useState('');
  const [transcriptionExpanded, setTranscriptionExpanded] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

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
                  if (currIndex % 2 === 0) {
                    acc.push(
                      {
                        'start': convertTimestampToSeconds(arr[currIndex]),
                        'end': currIndex + 2 === arr.length ? 
                          Infinity : convertTimestampToSeconds(arr[currIndex + 2]),
                        'text': arr[currIndex + 1]
                      }
                    );
                  }
                  return acc;
                }, []).map((para, i) =>
                  <p key={i}>
                    <span
                      style={
                        playbackTime > para.start && playbackTime < para.end ? 
                        {backgroundColor: '#404e87', '-webkit-text-fill-color': 'white'} : null }>
                      {para.text}
                    </span>
                  </p>
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
      
      <Audio name={name} setPlaybackTime={setPlaybackTime} />
    
    </div>
  );
}

