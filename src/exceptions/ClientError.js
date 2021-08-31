class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.status = statusCode;
    this.name = 'ClientError';
  }
}

module.exports = ClientError;
