/**
 * Navigation types for Expo Router
 * Learn more: https://docs.expo.dev/router/reference/typescript/
 */

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
};

export type TabsParamList = {
  index: undefined;
  'add-entry': undefined;
  eto: undefined;
  settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
