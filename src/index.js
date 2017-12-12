import nanoid from 'nanoid';
import isUrl from 'is-url';
import queryString from 'query-string';
import normalizeUrl from 'normalize-url';

const setNanoid = url => {
    const id = nanoid();
    const fullUrl = /^[/?]/.test(url) ? `foo.bar${url}` : url;

    if (!isUrl(normalizeUrl(fullUrl))) {
        return;
    }

    let [uri, query] = fullUrl.split('?');
    query = queryString.parse(query);
    query = query.v ? query.v = id : Object.assign(query, {v: id});
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

        if (options.attributes && Array.isArray(options.attributes)) {
            attributes = [...new Set([...attributes, ...options.attributes])];
        }

        if (!Array.isArray(tree)) {
            reject(new Error(`tree is not Array`));
        }

        if (tree.length === 0) {
            resolve(tree);
        }

        tree.walk(node => {
            if (node.tag && node.attrs) {
                node.attrs = Object.keys(node.attrs).reduce((attributeList, attr) => {
                    if (tags.includes(node.tag) || attributes.includes(attr)) {
                        return Object.assign(attributeList, {[attr]: setNanoid(node.attrs[attr])});
                    }

                    return attributeList;
                }, {});
            }

            return node;
        });

        resolve(tree);
    });
};
