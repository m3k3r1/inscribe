export class UserIsBlockedError extends Error {
  constructor(message?: string) {
    super(
      message ??
        'Please update your subscription to continue using the service.',
    )
  }
}
