import * as React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type PillColor = 'green' | 'amber' | 'red' | 'blue';
export type TabKey = 'map' | 'history' | 'scan' | 'profile';

export interface TopBarProps {
  title: string;
  icon?: string | React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  badge?: string;
  badgeColor?: string;
}

export interface CardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface SectionTitleProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export interface PillProps {
  label: string;
  color?: PillColor;
}

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface FormFieldProps {
  label: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface TabBarProps {
  activeTab: TabKey;
  onTabPress?: (tab: TabKey) => void;
}

export interface WarningBoxProps {
  message: string;
}

export const TopBar: React.FC<TopBarProps>;
export const Card: React.FC<CardProps>;
export const SectionTitle: React.FC<SectionTitleProps>;
export const Pill: React.FC<PillProps>;
export const PrimaryButton: React.FC<PrimaryButtonProps>;
export const SecondaryButton: React.FC<SecondaryButtonProps>;
export const FormField: React.FC<FormFieldProps>;
export const TabBar: React.FC<TabBarProps>;
export const WarningBox: React.FC<WarningBoxProps>;
