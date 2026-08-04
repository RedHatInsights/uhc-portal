import React, { ImgHTMLAttributes } from 'react';

import { useRemoteHook } from '@scalprum/react-core';

type ThemedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  darkThemeSrc: string;
  lightThemeSrc: string;
};

interface DarkModeStoreHookProps {
  isDark: boolean;
}

export const ThemedImage = ({ darkThemeSrc, lightThemeSrc, alt, ...rest }: ThemedImageProps) => {
  const { hookResult, loading, error } = useRemoteHook<DarkModeStoreHookProps>({
    scope: 'chrome',
    module: './theme/useDarkModeStore',
    importName: 'useDarkModeStore',
  });

  const file = !loading && !error && hookResult?.isDark ? darkThemeSrc : lightThemeSrc;

  return <img src={file} alt={alt} {...rest} />;
};
