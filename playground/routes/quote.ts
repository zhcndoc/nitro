const QUOTES_URL =
  "https://github.com/JamesFT/Database-Quotes-JSON/raw/refs/heads/master/quotes.json";

let _quotes: Promise<unknown> | undefined;

function getQuotes(): Promise<{ quoteText: string; quoteAuthor: string }[]> {
  return (_quotes ??= fetch(QUOTES_URL).then((res) => res.json()));
}

export default async function quotesHandler() {
  const quotes = await getQuotes();
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return Response.json({
    text: randomQuote.quoteText,
    author: randomQuote.quoteAuthor,
  });
}
