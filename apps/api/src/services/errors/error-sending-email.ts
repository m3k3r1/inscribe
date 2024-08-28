export class ErrorSendingEmail extends Error {
  constructor() {
    super('Could not send email')
  }
}
