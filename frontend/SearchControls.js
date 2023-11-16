import React, { useState } from 'react';

export default function SearchControls({ allTags, selectedTags, toggleTag }) {  
  return (
    <div className={'search-controls'}>
      
      <img className={'logo'} src={'jsn-logo-transparent.png'} />
      
      <div className={'subject-title'}>
        {'Subject'.toUpperCase()}
        <hr className={'subject-title-hr'}/>
      </div>
 
      <div className={'tag-checklist'}>
        {allTags.current.map(tagName =>
          <div className={'tag-checkbox'} key={tagName}>
            <input 
              type={'checkbox'} 
              id={tagName} 
              checked={selectedTags.includes(tagName)}
              onChange={event => toggleTag(event.target.id)}
            />
            <label htmlFor={tagName}>{tagName}</label>
          </div>
        )}
      </div>

    </div>
  );
}

