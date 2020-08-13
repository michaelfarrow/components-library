import { flatten } from ':util/slimdash';

export function classNames(
  classes: Array<string | Array<string | undefined> | undefined>
): string {
  return flatten(classes)
    .filter(c => !!c)
    .join(' ');
}
