import React from 'react';

import { useRemoteHook } from '@scalprum/react-core';

type ThemedImageProps = {
  lightThemeSrc: string;
  darkThemeSrc: string;
  altText: string;
  className?: string;
};

interface DarkModeStoreHookProps {
  isDark: boolean;
}

const ThemedImage = ({
  lightThemeSrc,
  darkThemeSrc,
  altText,
  className = '',
}: ThemedImageProps) => {
  const { hookResult, loading, error } = useRemoteHook<DarkModeStoreHookProps>({
    scope: 'chrome',
    module: './theme/useDarkModeStore',
    importName: 'useDarkModeStore',
  });

  const file = !loading && !error && hookResult?.isDark ? darkThemeSrc : lightThemeSrc;

  return <img src={file} alt={altText} className={className} />;
};

export default ThemedImage;
