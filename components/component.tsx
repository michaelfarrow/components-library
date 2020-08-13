import React from 'react';
import { classNames } from ':util/css';

export { default as styled } from '@emotion/styled';
export { css } from '@emotion/core';

export { classNames };

export interface ComponentProps {
  className?: string;
}

export type ComponentRender<T> = (props: T) => React.ReactElement;

export default function component<T extends ComponentProps = ComponentProps>(
  name: string,
  render: ComponentRender<T>,
  className?: string | Array<string | undefined>
) {
  const Component: React.FC<T> = props => {
    return render({
      ...props,
      className: classNames([className, props.className])
    });
  };

  Component.displayName = name;

  return Component;
}
