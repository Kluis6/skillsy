import { Fragment, type ReactNode } from 'react';

/**
 * Puts elements inside a translated text: rich(t('search.pageOf', { total }),
 * { current: <span>2</span> }) turns "Página {current} de 5" into
 * "Página <span>2</span> de 5". Call t() without the rich variables, so
 * their {placeholders} stay in the text.
 */
export function rich(text: string, nodes: Record<string, ReactNode>): ReactNode {
  return text.split(/(\{\w+\})/g).map((part, index) => {
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={index}>{name && name in nodes ? nodes[name] : part}</Fragment>;
  });
}
