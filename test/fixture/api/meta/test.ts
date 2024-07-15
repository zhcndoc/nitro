defineRouteMeta({
  openAPI: {
    tags: ["test"],
    description: "Test route description",
    parameters: [{ in: "query", name: "test", required: true }],
    responses: {
      200: {
        description: "OK",
      },
    },
  },
});

export default defineEventHandler(() => "OK");
