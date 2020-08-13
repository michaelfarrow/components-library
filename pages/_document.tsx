import Document, { Html, Head, Main, NextScript } from 'next/document';
import Manifest from 'next-manifest/manifest';
import config from ':root/config.json';

const GA_TRACKING_ID = process.env.GA_TRACKING_ID;

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <Manifest href='/manifest.json' />
          <meta name='theme-color' content={config.theme.colour} />
          <meta name='description' content={config.site.description} />
          <link rel='stylesheet' type='text/css' href='/css/normalize.css' />
          <link
            href='https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@200;300;400;500;600;700&family=Open+Sans:wght@300;400;600;700&display=swap'
            rel='stylesheet'
          />
          {(GA_TRACKING_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_TRACKING_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )) ||
            null}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
