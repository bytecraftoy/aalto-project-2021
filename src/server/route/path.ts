import { Ipath, IPathRoute } from '../domain/IPath';

function path(url: string): IPathRoute {
    const allRoutes: Ipath = {
        '/test': {
            methods: ['POST', 'GET', 'PUT', 'DELETE'],
        },
        '/node': {
            methods: ['POST', 'PUT'],
        },
        '/node/:id': {
            methods: ['GET', 'POST', 'DELETE'],
        },
        '/assignment': {
            methods: ['GET', 'POST', 'DELETE'],
        },
        '/edge': {
            methods: ['POST', 'PUT'],
        },
        '/edge/:source/:target': {
            methods: ['GET', 'DELETE'],
        },
        '/project': {
            methods: ['POST', 'GET', 'PUT', 'DELETE'],
        },
        '/project/:id': {
            methods: ['GET', 'DELETE'],
        },
        '/project/:id/members': {
            methods: ['GET', 'POST', 'DELETE'],
        },
        '/project/:id/permission': {
            methods: ['GET'],
        },
        '/tag': {
            methods: ['POST', 'GET', 'PUT', 'DELETE'],
        },
        '/tag/proj/:proj': {
            methods: ['GET'],
        },
        '/user/register': {
            methods: ['POST'],
        },
        '/user/login': {
            methods: ['POST', 'GET'],
        },
        '/user/validity': {
            methods: ['POST'],
        },
    };

    if (!allRoutes[url]) {
        if (url.includes('/edge/')) {
            return allRoutes['/edge/:source/:target'];
        } else if (url.includes('/node/')) {
            return allRoutes['/node/:id'];
        } else if (url.includes('/tag/proj/')) {
            return allRoutes['/tag/proj/:proj'];
        } else if (url.includes('/project/')) {
            if (url.includes('permission')) {
                return allRoutes['/project/:id/permission'];
            } else if (url.includes('members')) {
                return allRoutes['/project/:id/members'];
            }

            return allRoutes['/project/:id'];
        } else if (url.includes('/assignment/')) {
            return allRoutes['/assignment'];
        }
    }
    return allRoutes[url];
}

export { path };
