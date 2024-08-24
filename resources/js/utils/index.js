import moment from 'moment';

export const moneyFormat = (number = 0, locale = 'en-PH', currency = 'PHP') => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(number);
};

export const getPercentage = (number, percent) => (percent / 100) * number;

export const timeAgo = time => {
  moment.updateLocale('en', {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: number=>number + "s ago",
      ss: '%ds ago',
      m: "1m ago",
      mm: "%dm ago",
      h: "1h ago",
      hh: "%dh ago",
      d: "1d ago",
      dd: "%dd ago",
      M: "a month ago",
      MM: "%d months ago",
      y: "a year ago",
      yy: "%d years ago"
    }
  });

  let secondsElapsed = moment().diff(time, 'seconds');
  let dayStart = moment("2018-01-01").startOf('day').seconds(secondsElapsed);

  if (secondsElapsed > 300) {
    return moment(time).fromNow(true);
  } else if (secondsElapsed < 60) {
    return dayStart.format('s') + 's ago';
  } else {
    return dayStart.format('m:ss') + 'm ago';
  }
};

export const camelCase = string => string.charAt(0).toUpperCase() + string.slice(1);

export const titleCase = (string) => string.replace(/_/g, ' ').replace(/-/g, ' ').split(' ').map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');

export const truncateString = (string = '', maxLength = 40) => 
  string.length > maxLength 
    ? `${string.substring(0, maxLength)}…`
    : string