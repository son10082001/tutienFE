'use client';

import { useMergedRef } from '@mantine/hooks';
import React, { forwardRef, useCallback, useEffect, useRef, type ComponentProps, type ElementRef } from 'react';

const AutoPlayVideo = forwardRef<HTMLVideoElement, ComponentProps<'video'>>(({ src, ...props }, videoRef) => {
  const appRef = useRef<ElementRef<'video'>>(null);

  const ref = useMergedRef(videoRef, appRef);

  const attemptPlay = useCallback(() => {
    if (!appRef?.current) return;
    appRef?.current.play().catch((error) => {
      console.error('Error attempting to play', error);
    });
  }, [appRef]);

  useEffect(() => {
    attemptPlay();
  }, [attemptPlay]);

  return (
    <video ref={ref} playsInline autoPlay loop muted {...props}>
      <source src={src} type='video/mp4' />
      <source src={src} type='video/webm' />
      Sorry, your browser doesn{"'"}t support videos.
    </video>
  );
});

export default AutoPlayVideo;
