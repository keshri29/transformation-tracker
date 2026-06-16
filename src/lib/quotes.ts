export const quotes: string[] = [
  "Your future is built by what you do today.",
  "Discipline is choosing between what you want now and what you want most.",
  "The man who moves a mountain begins by carrying small stones.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't count the days. Make the days count.",
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  "It's not about perfect. It's about effort.",
  "Every day is a chance to get better.",
  "The secret of getting ahead is getting started.",
  "Small daily improvements are the key to staggering long-term results.",
  "Hard work beats talent when talent doesn't work hard.",
  "Be the person your future self will thank.",
  "Push yourself, because no one else is going to do it for you.",
  "Your only competition is who you were yesterday.",
  "Pain is temporary. Glory is forever.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Become who you could be, not who you have been.",
  "Champions are made from something deep inside — a desire, a dream, a vision.",
  "The difference between ordinary and extraordinary is that little extra.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do it now. Sometimes 'later' becomes 'never'.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't come from what you do occasionally. It comes from what you do consistently.",
  "The harder you work, the luckier you get.",
  "Remember why you started.",
  "One day or day one. You decide.",
  "You are what you repeatedly do. Excellence is a habit.",
  "The gym is a sacred place. Show up like it is.",
  "Build something you're proud of.",
];

export function getDailyQuote(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return quotes[dayOfYear % quotes.length];
}
