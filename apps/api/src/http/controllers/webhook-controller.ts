import { Subscription } from '@prisma/client'
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import Stripe from 'stripe'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { WelcomeEmailTemplate } from '@/mail/templates/welcome'
import { makeAuthService } from '@/services/factories/make-auth-service'

import { logger } from '../server'

export async function webhookController(app: FastifyInstance) {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    function (_req, body, done) {
      try {
        done(null, body)
      } catch (error) {
        error.statusCode = 400
        done(error, undefined)
      }
    },
  )
  app.withTypeProvider<ZodTypeProvider>().post(
    '/webhook/stripe',
    {
      schema: {
        tags: ['Webhooks'],
        summary: 'Stripe Webhook',
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY)

      try {
        const stripeEvent = stripe.webhooks.constructEvent(
          request.body,
          request.headers['stripe-signature'],
          env.STRIPE_WEBHOOK_SECRET,
        )

        switch (stripeEvent.type) {
          case 'checkout.session.completed': {
            const session = await stripe.checkout.sessions.retrieve(
              stripeEvent.data.object.id,
              {
                expand: ['line_items'],
              },
            )

            const customerId = session?.customer as string
            const subscriptionId = session?.subscription as string
            const customer = await stripe.customers.retrieve(customerId)
            const priceId = session?.line_items?.data[0]?.price.id

            const email = customer.email
            const name = customer.name

            let subscriptionType

            switch (priceId) {
              case 'price_1PpTKAHb2yBKjcy0fqk3T2zc':
              case 'price_1PpTJYHb2yBKjcy0nfCoayxd':
                subscriptionType = Subscription.HOBBY
                break
              case 'price_1PmHVXHb2yBKjcy0ja534Ydb':
              case 'price_1PmHQnHb2yBKjcy0VbYJFuRA':
                subscriptionType = Subscription.CREATOR
                break
              case 'price_1PrN3WHb2yBKjcy0zp39LOez':
              case 'price_1PrNI8Hb2yBKjcy0dCyYp99S':
                subscriptionType = Subscription.ULTRA
                break
              default:
            }

            let user
            if (email) {
              user = await prisma.user.findUnique({
                where: {
                  email,
                },
              })

              if (!user) {
                user = await prisma.user.create({
                  data: {
                    email,
                    name,
                  },
                })

                await resend.emails.send({
                  from: 'Inscribe <dontreply@tryinscribe.app>',
                  to: user.email,
                  subject: '[Inscribe] Welcome to Inscribe',
                  react: WelcomeEmailTemplate({
                    userName: user.name,
                  }),
                })

                const authService = makeAuthService()
                await authService.createMagicLink(user.email)
              }

              const isInTrial = subscriptionType === Subscription.HOBBY

              await prisma.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  stripeCustomerId: customerId,
                  stripePriceId: priceId,
                  stripeSubscriptionId: subscriptionId,
                  subscription: subscriptionType,
                  isInTrial,
                  isBlocked: false,
                },
              })
            }

            break
          }

          case 'customer.subscription.deleted': {
            const subscription = await stripe.subscriptions.retrieve(
              stripeEvent.data.object.id,
            )

            const customerId = subscription.customer as string

            await prisma.user.update({
              where: {
                stripeCustomerId: customerId,
              },
              data: {
                subscription: Subscription.NONE,
                isBlocked: true,
              },
            })

            break
          }

          default: {
            logger.info('Unhandled Stripe Event:', stripeEvent.type)
          }
        }
      } catch (err) {
        logger.error(err)
        reply.status(400).send({ message: 'Webhook Error' })
        return
      }

      reply.status(200).send({ message: 'Webhook received' })
    },
  )
}
