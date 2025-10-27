export default {
  async fetch() {
    const quote = await fetch("/quote").then((res) => res.json());
    return tokenizedStream(quote.text, 100);
  },
};

function tokenizedStream(text: string, delay = 100) {
  const tokens = text.split(" ");
  return new ReadableStream({
    start(controller) {
      let index = 0;
      function push() {
        if (index < tokens.length) {
          const word = tokens[index++] + (index < tokens.length ? " " : "");
          controller.enqueue(new TextEncoder().encode(word));
          setTimeout(push, delay);
        } else {
          controller.close();
        }
      }
      push();
    },
  });
}
