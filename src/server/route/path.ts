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
        '/tag/:proj': {
            methods: ['GET'],
        },
        '/tag/:proj/:node': {
            methods: ['POST'],
        },
        '/tag/:proj/:node/:tag': {
            methods: ['DELETE'],
        },
        '/tag2/:proj/:tag': {
            methods: ['PUT', 'DELETE'],
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
        } else if (url.includes('/project/')) {
            if (url.includes('permission')) {
                return allRoutes['/project/:id/permission'];
            } else if (url.includes('members')) {
                return allRoutes['/project/:id/members'];
            }

            return allRoutes['/project/:id'];
        } else if (url.includes('/assignment/')) {
            return allRoutes['/assignment'];
        } else if (url.startsWith('/tag/')) {
            // for '/tag/:proj' the count would be 2
            const countSubPaths = url.split('/').length - 1;

            switch (countSubPaths) {
                case 2: { return allRoutes['/tag/:proj']; }
                case 3: { return allRoutes['/tag/:proj/:node']; }
                case 4: { return allRoutes['/tag/:proj/:node/:tag']; }
            }
        } else if (url.startsWith('/tag2/')) {
            return allRoutes['/tag2/:proj/:tag'];
        }
    }
    return allRoutes[url];
}

export { path };
