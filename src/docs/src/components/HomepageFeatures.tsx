import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

type FeatureItem = {
    title: string;
    image: string;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'Welcome to the documentation!',
        image: '/img/homepage_graph2.png',
        description: (
            <>
                These pages contain the documentation for <em>Depsee</em>: a
                graph-based task management app.
                <br></br>
                <br></br>
                The purpose of this app to make task management easier by
                visualizing dependencies between tasks. The goal is to provide a
                tool that is more flexible than traditional card-based
                approaches but more focused than general-purpose graph editors.
                Our app does exactly this while retaining extensive built-in
                support for agile methods such as Scrum.
                <br></br>
                <br></br>
                Our software is open-source and the code can be viewed at Github
                from the link below. The app is deployed at Heroku.
            </>
        ),
    },
];

function Feature({ title, image, description }: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--left padding-horiz--md">
                <h3 className="text--center">{title}</h3>
                <p>{description}</p>
            </div>
            <div className="text--center">
                <img
                    className={styles.featureSvg}
                    alt={title}
                    src={useBaseUrl(image)}
                />
            </div>
        </div>
    );
}

export function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div>
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
