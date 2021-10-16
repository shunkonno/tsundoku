import React from 'react';
import PropTypes from 'prop-types';

export const VideoContainer = ({ children }) => (
  <main className="flex-1 relative overflow-hidden w-full h-full">
    {children}
  </main>
);

VideoContainer.propTypes = {
  children: PropTypes.node,
};
export default VideoContainer;
