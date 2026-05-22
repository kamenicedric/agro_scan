declare module '@expo/vector-icons' {
  import * as React from 'react';
  import type { TextProps } from 'react-native';

  type IconProps = TextProps & {
    name: string;
    size?: number;
    color?: string;
  };

  export const Ionicons: React.ComponentType<IconProps>;
}
