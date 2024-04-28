export default function getTimeString(time: string) {
  if (!time.startsWith("P")) return "Invalid time";
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/g;
  const matches = [...time.matchAll(regex)][0];

  matches.forEach((m, i) => {
    if (!m) matches[i] = "";
  });

  const parsedTime: { [name: string]: number } = {
    hours: +matches[1],
    minutes: +matches[2],
    seconds: +matches[3],
  };

  while (parsedTime.seconds >= 60) {
    parsedTime.seconds -= 60;
    parsedTime.minutes += 1;
  }

  while (parsedTime.minutes >= 60) {
    parsedTime.minutes -= 60;
    parsedTime.hours += 1;
  }

  let str = "";
  for (const duration in parsedTime) {
    if (parsedTime[duration] === 0) continue;

    str += `${parsedTime[duration]} ${parsedTime[duration] === 1 ? duration.substring(0, duration.length - 1) : duration}, `;
  }

  str = str.substring(0, str.length - 2);

  return str;
}
