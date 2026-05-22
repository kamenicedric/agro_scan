import type { TextStyle } from 'react-native';

export declare const Colors: {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  accentSoft: string;
  amber: string;
  amberBg: string;
  amberText: string;
  blue: string;
  blueBg: string;
  blueText: string;
  red: string;
  redBg: string;
  redText: string;
  soil: string;
  soilLight: string;
  soilLighter: string;
  white: string;
  bgPage: string;
  bgCard: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnDark: string;
  textOnDarkMuted: string;
};

export declare const Fonts: {
  regular: Extract<TextStyle['fontWeight'], '400'>;
  medium: Extract<TextStyle['fontWeight'], '500'>;
  semibold: Extract<TextStyle['fontWeight'], '600'>;
  bold: Extract<TextStyle['fontWeight'], '700'>;
};

export declare const Radius: {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
};

export declare const Spacing: {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};
