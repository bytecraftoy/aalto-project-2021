// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
/* eslint-disable @typescript-eslint/no-var-requires*/
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Depsee documentation',
    tagline: 'Documentation for depsee',
    url: 'https://your-docusaurus-test-site.com',
    baseUrl: '/docs/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'facebook', // Usually your GitHub org/user name.
    projectName: 'docusaurus', // Usually your repo name.

    presets: [
        [
            "docusaurus-preset-openapi",
            /** @type {import('docusaurus-preset-openapi').Options} */
            ({
                api: {
                    path: "./openapi.json",
                    routeBasePath: "petstore",
                },
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    // Please change this to your repo.
                    editUrl:
                        "https://github.com/cloud-annotations/docusaurus-openapi/edit/main/demo/",
                },
                blog: false,
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
                proxy: {
                    "/proxy": {
                        target: "http://localhost:8091",
                        pathRewrite: { "^/proxy": "" },
                    },
                },
            }),
        ],
    ],

    plugins: [
        [
            'docusaurus-plugin-openapi',
            {
                id: 'cos',
                path: './openapi.json',
            }
        ]
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: 'Home',
                logo: {
                    alt: 'Logo for the site',
                    src: 'img/logo.svg',
                },
                items: [
                    {
                        to: '/help',
                        label: 'How to use',
                        position: 'left'
                    },
                    {
                        to: '/api',
                        label: 'API documentation',
                        position: 'left'
                    },
                    {
                        to: '/internal',
                        label: 'Internal Documentation',
                        position: 'left'
                    }
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Useful links',
                        items: [
                            {
                                label: 'The app at Heroku',
                                href: 'https://aalto-project.herokuapp.com/',
                            },
                            {
                                label: 'Github',
                                href: 'https://github.com/bytecraftoy/aalto-project-2021',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © 2022 Bytecraft. Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
