export function isObject(value: any) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

export function isString(value: any) {
  return typeof value === 'string';
}

export function isArray(value: any) {
  return Array.isArray(value);
}

export function defaults(...args: object[]) {
  let o = {};
  for (let i = 0; i < args.length; i++) {
    o = {
      ...o,
      ...(args[i] || {})
    };
  }
  return o;
}

export function has(o: object = {}, keys: any | any[] = []): boolean {
  const _keys: any[] = isArray(keys) ? keys : [keys];
  let passed = true;
  _keys.forEach(key => {
    if (!o.hasOwnProperty(key)) passed = false;
  });
  return passed;
}

export function last(a: Array<any> = []): any {
  if (!a.length) return null;
  return a[a.length - 1];
}

export function forEach(
  o: object = {},
  f: (value: any, key: any) => void
): void {
  for (let k in o) {
    f(o[k], k);
  }
}

export function mapValues(
  o: object = {},
  f: (value: any, key: any) => any
): any {
  const _o = {};
  forEach(o, (value, key) => {
    _o[key] = f(value, key);
  });
  return _o;
}

export function flatten(a: Array<Array<any> | any> = []): any[] {
  return a.reduce((a, c) => {
    return a.concat(Array.isArray(c) ? c : [c]);
  }, []);
}

export function values(o: object = {}): any[] {
  const values = [];
  for (let k in o) {
    values.push(o[k]);
  }
  return values;
}

export function orderBy(
  a: object[] = [],
  key: string,
  direction: 'asc' | 'desc' = 'asc'
): any {
  const sortBy = (a, b) => {
    if (direction === 'desc')
      return a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0;
    return a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0;
  };
  return a.concat().sort(sortBy);
}
