import nanoid from 'nanoid';
import isUrl from 'is-url';
import queryString from 'query-string';
import normalizeUrl from 'normalize-url';

export default (options = {}) => {
    return tree => new Promise((resolve, reject) => {
        let tags = ['link', 'script'];

        if (options.tags && Array.isArray(options.tags)) {
            tags = [...new Set([...tags, ...options.tags])];
        }

        if (!Array.isArray(tree)) {
            reject(new Error(`tree is not Array`));
        }

        if (tree.length === 0) {
            resolve(tree);
        }

        tree.match(tags.map(tag => ({tag: tag})), node => {
            const id = nanoid();

            if (node.attrs) {
                const url = node.attrs.href || node.attrs.src;

                if (url) {
                    const fullUrl = /^[/?]/.test(url) ? `foo.bar${url}` : url;

                    if (!isUrl(normalizeUrl(fullUrl))) {
                        return;
                    }

                    let [uri, query] = fullUrl.split('?');
                    query = queryString.parse(query);
                    query = query.v ? query.v = id : Object.assign(query, {v: id});
                    query = queryString.stringify(query);

                    if (node.attrs.href) {
                        node.attrs.href = `${uri}?${query}`;
                    }

                    if (node.attrs.src) {
                        node.attrs.src = `${uri}?${query}`;
                    }
                }
            }

            return node;
        });

        resolve(tree);
    });
};
