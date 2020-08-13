const GA_TRACKING_ID = process.env.GA_TRACKING_ID;

export interface GAEvenParams {
  category?: string;
  label?: string;
  value?: any;
}

const delay = (f: () => void) => {
  setTimeout(f, 500);
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  GA_TRACKING_ID &&
    delay(() => {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url
      });
    });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, params: GAEvenParams) => {
  const { category, label, value } = params;
  GA_TRACKING_ID &&
    delay(() => {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    });
};
