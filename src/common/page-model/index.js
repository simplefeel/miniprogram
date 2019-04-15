class PageModel {
    constructor() {
        this.pageCache = {};
    }

    add(page) {
        let pagePath = this._getPageModelPath(page);
        this.pageCache[pagePath] = page;
    }

    get(path) {
        return this.pageCache[path];
    }

    delete(page) {
        delete this.pageCache[this._getPageModelPath(page)];
    }

    _getPageModelPath(page) {
        return page.__route__;
    }
}

export default PageModel;
