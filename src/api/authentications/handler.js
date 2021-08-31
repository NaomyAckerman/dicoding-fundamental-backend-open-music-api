class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationsPayload(request.payload);
      const userId = await this._usersService.verifyUserCredential(
        request.payload,
      );
      const accessToken = this._tokenManager.generateAccessToken({ userId });
      const refreshToken = this._tokenManager.generateRefreshToken({ userId });
      await this._authenticationsService.addRefreshToken(refreshToken);
      return h
        .response({
          status: 'success',
          message: 'Authentication berhasil ditambahkan',
          data: {
            accessToken,
            refreshToken,
          },
        })
        .code(201);
    } catch (error) {
      return error;
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      this._validator.validatePutAuthenticationsPayload(request.payload);
      await this._authenticationsService.verifyRefreshToken(request.payload);
      const { userId } = this._tokenManager.verifyRefreshToken(request.payload);
      const accessToken = this._tokenManager.generateAccessToken({ userId });
      return h.response({
        status: 'success',
        message: 'Authentication berhasil diperbarui',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      return error;
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateDeleteAuthenticationsPayload(request.payload);
      await this._authenticationsService.verifyRefreshToken(request.payload);
      await this._authenticationsService.deleteRefreshToken(request.payload);
      return h.response({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      return error;
    }
  }
}

module.exports = AuthenticationsHandler;
