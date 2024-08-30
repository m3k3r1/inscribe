import { env } from '@saas/env'
import { uuid } from 'uuidv4'

import { logger } from '@/http/server'
import { resend } from '@/lib/resend'
import { AuthenticationMagicLinkTemplate } from '@/mail/templates/authentication-magic-link'
import type { AuthLinkRepository } from '@/repositories/auth-link-repository'
import type { UsersRepository } from '@/repositories/user-repository'

import { ErrorSendingEmail } from './errors/error-sending-email'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

export type AuthenticateUserInput = {
  email: string
  password: string
}

export class AuthService {
  constructor(
    private userRepository: UsersRepository,
    private authLinkRepository: AuthLinkRepository,
  ) {}

  async createMagicLink(email: string) {
    const userFromEmail = await this.userRepository.findByEmail(email)
    if (!userFromEmail) {
      throw new UserDoesNotExistsError()
    }

    const userHasMoreThanOneAuthLink =
      await this.authLinkRepository.findByUserId(userFromEmail.id)

    if (userHasMoreThanOneAuthLink.length > 1) {
      await this.authLinkRepository.delete(userHasMoreThanOneAuthLink[0].id)
    }

    const code = uuid().slice(0, 6)
    await this.authLinkRepository.create({
      code,
      userId: userFromEmail.id,
    })

    const authLink = new URL('/auth/link/authenticate', env.API_URL)
    authLink.searchParams.set('code', code)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    logger.info(`Auth link generated for user ${userFromEmail.id}: ${authLink}`)

    const { error } = await resend.emails.send({
      from: 'Inscribe <dontreply@tryinscribe.app>',
      to: userFromEmail.email,
      subject: '[Inscribe] Magic link authentication',
      react: AuthenticationMagicLinkTemplate({
        authCode: code,
      }),
    })

    if (error) {
      logger.error(`Error sending email: ${error}`)
      throw new ErrorSendingEmail()
    }
  }

  async authenticateWithMagicLink(code: string) {
    const authLink = await this.authLinkRepository.findByCode(code)

    if (!authLink) {
      throw new Error('Invalid code')
    }

    await this.authLinkRepository.delete(authLink.id)

    const user = await this.userRepository.findById(authLink.userId)
    if (!user) {
      throw new UserDoesNotExistsError()
    }

    return user
  }
}
