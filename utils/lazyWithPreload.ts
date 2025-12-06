import React from 'react';

type Factory<T extends React.ComponentType<any>> = () => Promise<{ default: T }>;

type Preloadable<T extends React.ComponentType<any>> = React.LazyExoticComponent<T> & {
  preload: () => Promise<{ default: T }>;
};

export function lazyWithPreload<T extends React.ComponentType<any>>(factory: Factory<T>): Preloadable<T> {
  const Component = React.lazy(factory) as Preloadable<T>;
  Component.preload = factory;
  return Component;
}
