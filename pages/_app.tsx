import App from 'next/app';
import Head from 'next/head';
import config from ':root/config.json';
import Router from 'next/router';
import * as gtag from ':util/analytics';
import { LabelsProvider } from ':components/labels';

import '../styles.css';

Router.events.on('routeChangeComplete', (url) => gtag.pageview(url));

class MyApp extends App {
  render() {
    const { Component, pageProps, router } = this.props;
    return (
      <>
        <Head>
          <title>{config.site.title}</title>
        </Head>
        <LabelsProvider>
          <Component
            {...pageProps}
            key={router.asPath || router.pathname || router.route}
          />
        </LabelsProvider>
        <style jsx global>{`
          body {
            padding: 1em;
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            font-weight: 300;
          }

          h1,
          h2,
          h3 {
            font-family: 'Roboto Mono', monospace;
          }

          h1 {
            font-size: 2.5em;
          }

          a {
            color: red;
          }
        `}</style>
      </>
    );
  }
}

export default MyApp;
