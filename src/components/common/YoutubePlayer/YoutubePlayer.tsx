import React from 'react';

type YoutubePlayerProps = {
  videoID: string;
};

export const YoutubePlayer = ({ videoID }: YoutubePlayerProps) => (
  <iframe
    className="drawer-panel-content__explanation-video"
    src={`https://www.youtube.com/embed/${videoID}`}
    title="YouTube video player"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
    data-testid="drawer-panel-content__explanation-video"
  />
);
