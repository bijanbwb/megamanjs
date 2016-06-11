'use strict';

Game.Loader.XML =
class XMLLoader
extends Game.Loader
{
    constructor(game)
    {
        super(game);
        this.sceneIndex = {};
    }
    asyncLoadXML(url)
    {
        return this.resourceLoader.loadXML(url);
    }
    followNode(node)
    {
        const url = this.resolveURL(node, 'src');
        if (!url) {
            return Promise.resolve(node);
        }
        return this.asyncLoadXML(url)
            .then(doc => {
                return doc.children[0];
            });
    }
    loadScene(url)
    {
        return this.asyncLoadXML(url)
            .then(node => {
                const sceneNode = node.querySelector('scene');
                return this.parseScene(sceneNode);
            });
    }
    parseScene(node)
    {
        if (node.tagName !== 'scene') {
            throw new TypeError('Node not <scene>');
        }

        const type = node.getAttribute('type');
        if (type === 'level') {
            const parser = new Game.Loader.XML.LevelParser(this, node);
            return parser.getScene();
        } else if (type === 'stage-select') {
            const parser = new Game.Loader.XML.StageSelectParser(this, node);
            return parser.getScene();
        }

        throw new Error('Scene type "' + type + '" not recognized');
    }
    resolveURL(node, attr)
    {
        const url = node.getAttribute(attr || 'url');
        if (!url) {
            return null;
        }

        if (node.ownerDocument.baseURL === undefined) {
            return url;
        }
        if (url.indexOf('http') === 0) {
            return url;
        }
        const baseUrl = node.ownerDocument.baseURL
                             .split('/')
                             .slice(0, -1)
                             .join('/') + '/';
        return baseUrl + url;
    }
    startScene(name)
    {
        if (!this.sceneIndex[name]) {
            throw new Error('Scene "' + name + '" does not exist');
        }

        this.game.pause();
        return this.loadScene(this.sceneIndex[name].url)
            .then(scene => {
                this.game.setScene(scene);
                return scene;
            });
    }
}

Game.Loader.XML.createFromXML = function(url, callback)
{
    const game =  new Game();
    const loader = new Game.Loader.XML(game);
    return loader.asyncLoadXML(url)
        .then(doc => {
            const node = doc.getElementsByTagName('game')[0];
            const gameParser = new Game.Loader.XML.GameParser(loader, node);
            return gameParser.parse();
        })
        .then(() => {
            return loader;
        });
}
