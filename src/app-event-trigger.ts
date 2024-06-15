export const handler =  async function(event: any, context: any, callback: any) {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World" }),
  };

  return response;
};