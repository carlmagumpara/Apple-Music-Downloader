import React, { useState } from 'react';
import PropTypes from 'prop-types';

function SeeMore({ string = '', count = 30, onClick = null, textStyle= {}, textClass = '' }) {
  const [truncate, setTruncate] = useState(true);

  if ((string || '').length < count) return string;

  return (
    <span style={textStyle} className={textClass}>
      {truncate ? (
        <>
          <span dangerouslySetInnerHTML={{__html: string.substring(0, count) }} />{` `}
          <a
            role="button"
            className="text-link small"
            onClick={event => {
              event.preventDefault();
              if (onClick) {
                onClick();
              } else {
                setTruncate(prevState => !prevState);
              }
            }}
            hreh="#">
            See More...
          </a>
        </>
      ) : (
        <>
          <span dangerouslySetInnerHTML={{__html: string }} />{` `}
          <a
            role="button"
            className="text-link small"
            onClick={event => {
              event.preventDefault();
              if (onClick) {
                onClick();
              } else {
                setTruncate(prevState => !prevState);
              }
            }}
            hreh="#">
            See Less...
          </a>
        </>
      )}
    </span>
  );
}

export default SeeMore;