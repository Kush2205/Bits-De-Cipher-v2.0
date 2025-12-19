// Ambient module declarations to help TypeScript with non-TS imports

declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.svg';

// Minimal declarations for @react-oauth/google to avoid missing types during build.
declare module '@react-oauth/google' {
  import * as React from 'react';

  export const GoogleLogin: React.ComponentType<any>;
  export const GoogleOAuthProvider: React.ComponentType<{
    clientId: string;
    children?: React.ReactNode;
  }>;
  export function useGoogleLogin(...args: any[]): any;

  const _default: any;
  export default _default;
}
