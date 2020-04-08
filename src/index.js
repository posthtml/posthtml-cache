import {nanoid} from 'nanoid';
import isUrl from 'is-url';
import queryString from 'query-string';
import normalizeUrl from 'normalize-url';
import isAbsoluteUrl from 'is-absolute-url';

const setNanoid = (onlyInternal, url) => {
  const fullUrl = /^[/?]/.test(url) ? `foo.bar${url}` : url;

  if (onlyInternal.length > 0) {
    const isAbsolute = isAbsoluteUrl(url) || url.startsWith('//');
    if (isAbsolute) {
      const absoluteUrl = normalizeUrl(url, {normalizeProtocol: false}).toLowerCase();
      if (onlyInternal.every(start => !absoluteUrl.startsWith(start.toLowerCase()))) {
        return url;
      }
    }
  }

  if (!isUrl(normalizeUrl(fullUrl))) {
    return url;
  }

  const id = nanoid();

  let [uri, query] = url.split('?');
  query = queryString.parse(query);
  query.v = query.v || id;
  query = queryString.stringify(query);

  return `${uri}?${query}`;
};

export default (options = {}) => {
  return tree => new Promise((resolve, reject) => {
    let tags = ['link', 'script'];
    let attributes = ['href', 'src'];

    if (options.tags && Array.isArray(options.tags)) {
      tags = [...new Set([...tags, ...options.tags])];
    }

    if (options.exclude) {
      tags = tags.filter(tag => !options.exclude.includes(tag));
    }

    if (options.attributes && Array.isArray(options.attributes)) {
      attributes = [...new Set([...attributes, ...options.attributes])];
    }

    if (!Array.isArray(tree)) {
      reject(new Error('tree is not Array'));
    }

    if (tree.length === 0) {
      resolve(tree);
    }

    const onlyInternal = options.onlyInternal && Array.isArray(options.onlyInternal) ? options.onlyInternal : [];

    tree.walk(node => {
      if (node.tag && node.attrs) {
        node.attrs = Object.keys(node.attrs).reduce((attributeList, attr) => {
          if (tags.includes(node.tag) && attributes.includes(attr)) {
            return Object.assign(attributeList, {[attr]: setNanoid(onlyInternal, node.attrs[attr])});
          }

          return attributeList;
        }, node.attrs);
      }

      return node;
    });

    resolve(tree);
  });
};
