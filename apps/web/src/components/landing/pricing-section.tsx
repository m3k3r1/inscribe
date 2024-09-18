'use client'

import { CheckIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type Interval = 'month' | 'year'

export const toHumanPrice = (price: number, decimals: number = 2) => {
  return Number(price / 100).toFixed(decimals)
}
const demoPrices = [
  {
    id: 'price_1',
    name: 'Hobbyist',
    description: 'A basic plan for individual users',
    features: ['400000 characters per month', 'Access to OpenAI GPT4o'],
    isMostPopular: false,
    monthly: {
      stripeLink: 'https://buy.stripe.com/dR603Ma848byemk3cc',
      stripePriceId: 'price_1Q0LRwHb2yBKjcy07nFMYArI',
      price: 2500,
    },
    yearly: {
      stripeLink: 'https://buy.stripe.com/eVa5o67ZWezWemkbIJ',
      stripePriceId: 'price_1Q0LTUHb2yBKjcy04Hu22oXn',
      price: 25000,
    },
  },
  {
    id: 'price_2',
    name: 'Creator',
    description: 'A premium plan for growing creators',
    features: [
      '600000 characters per month',
      'Access to OpenAI GPT4o',
      'Access to Mistral',
      'Access to Claude',
    ],
    isMostPopular: true,
    monthly: {
      stripeLink: 'https://buy.stripe.com/cN2g2KgwsezW2DC002',
      stripePriceId: 'price_1Q0LXwHb2yBKjcy0qtJ3nNy1',
      price: 4000,
    },
    yearly: {
      stripeLink: 'https://buy.stripe.com/5kA3fY1BygI4ceccMP',
      stripePriceId: 'price_1Q0LYiHb2yBKjcy03XLWPfy1',
      price: 40000,
    },
  },
  {
    id: 'price_3',
    name: 'Ultra',
    description:
      'An advanced plan for professionals who require extensive AI capabilities.',
    features: [
      '1M characters per month',
      'Access to OpenAI GPT4o',
      'Access to Mistral',
      'Access to Claude',
    ],
    isMostPopular: false,
    monthly: {
      stripeLink: 'https://buy.stripe.com/14k8Ai3JG63qa64eUY',
      stripePriceId: 'price_1Q0LbAHb2yBKjcy0ymfzHTdq',
      price: 6500,
    },
    yearly: {
      stripeLink: 'https://buy.stripe.com/fZe7webc8crO7XWaEJ',
      stripePriceId: 'price_1Q0LbYHb2yBKjcy0E8ATsXQv',
      price: 65000,
    },
  },
]

const entreprisePlan = {
  id: 'price_4',
  name: 'Entreprise',
  description: 'A premium plan for growing businesses',
  features: ['Custom to your needs'],
  isMostPopular: false,
  monthly: {
    stripeLink: 'https://buy.stripe.com/test_5kA4iDfkT2Jc0Io3ch',
    stripePriceId: 'price_1PmHQnHb2yBKjcy0VbYJFuRA',
    price: 0,
  },
  yearly: {
    stripeLink: 'https://buy.stripe.com/test_8wM6qL1u3gA276M8wD',
    stripePriceId: 'price_1PrNI8Hb2yBKjcy0dCyYp99S',
    price: 0,
  },
}

export default function PricingSection() {
  const [interval, setInterval] = useState<Interval>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [id, setId] = useState<string | null>(null)

  const onSubscribeClick = async (priceId: string) => {
    setIsLoading(true)
    setId(priceId)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <section id="pricing">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Pricing
          </h4>

          <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Simple pricing for everyone.
          </h2>

          <p className="mt-6 text-xl leading-8 text-black/80 dark:text-white">
            Choose an <strong>affordable plan</strong> that&apos;s packed with
            the best features for engaging your audience
          </p>
        </div>

        <div className="flex w-full items-center justify-center space-x-2">
          <Switch
            id="interval"
            onCheckedChange={(checked) => {
              setInterval(checked ? 'year' : 'month')
            }}
          />
          <span>Annual</span>
          <span className="inline-block whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide text-white dark:bg-white dark:text-black">
            2 MONTHS FREE ✨
          </span>
        </div>

        <div className="mx-auto grid w-full flex-col justify-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {demoPrices.map((price, idx) => (
            <div
              key={price.id}
              className={cn(
                'relative flex max-w-[400px] flex-col gap-8 overflow-hidden rounded-2xl border p-4 text-black dark:text-white',
                {
                  'border-2 border-[var(--color-one)] dark:border-[var(--color-one)]':
                    price.isMostPopular,
                },
              )}
            >
              <div className="flex items-center">
                <div className="ml-4">
                  <h2 className="text-base font-semibold leading-7">
                    {price.name}
                  </h2>
                  <p className="h-12 text-sm leading-5 text-black/70 dark:text-white">
                    {price.description}
                  </p>
                </div>
              </div>

              <motion.div
                key={`${price.id}-${interval}`}
                initial="initial"
                animate="animate"
                variants={{
                  initial: {
                    opacity: 0,
                    y: 12,
                  },
                  animate: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + idx * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="flex flex-row gap-1"
              >
                <span className="text-4xl font-bold text-black dark:text-white">
                  {price.id === ''}€
                  {interval === 'year'
                    ? toHumanPrice(price.yearly?.price, 0)
                    : toHumanPrice(price.monthly?.price, 0)}
                  <span className="text-xs"> / {interval}</span>
                </span>
              </motion.div>
              <Link
                href={
                  interval === 'year'
                    ? price.yearly?.stripeLink
                    : price.monthly?.stripeLink
                }
              >
                <Button
                  className={cn(
                    'group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter',
                    'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2',
                  )}
                  disabled={isLoading}
                  onClick={() => onSubscribeClick(price.id)}
                >
                  <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
                  {(!isLoading || (isLoading && id !== price.id)) && (
                    <p>Subscribe</p>
                  )}

                  {isLoading && id === price.id && <p>Subscribing</p>}
                  {isLoading && id === price.id && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              </Link>

              <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              {price.features && price.features.length > 0 && (
                <ul className="flex flex-col gap-2 font-normal">
                  {price.id === 'price_1' && (
                    <li className=" flex items-center gap-3 text-xs font-medium text-black dark:text-white">
                      <CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-400 p-[2px] text-black dark:text-white" />
                      <span className="flex font-bold">7 day trial</span>
                    </li>
                  )}
                  {price.features.map((feature: any, idx: any) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-xs font-medium text-black dark:text-white"
                    >
                      <CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-400 p-[2px] text-black dark:text-white" />
                      <span className="flex">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="relative flex max-w-[400px] flex-col gap-8 overflow-hidden rounded-2xl border  p-4 text-black dark:text-white">
            <div className="flex items-center">
              <div className="ml-4">
                <h2 className="text-base font-semibold leading-7">
                  {entreprisePlan.name}
                </h2>
                <p className="h-12 text-sm leading-5 text-black/70 dark:text-white">
                  {entreprisePlan.description}
                </p>
              </div>
            </div>

            <motion.div
              key="enterprise-plan-year"
              initial="initial"
              animate="animate"
              variants={{
                initial: {
                  opacity: 0,
                  y: 12,
                },
                animate: {
                  opacity: 1,
                  y: 0,
                },
              }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="flex flex-row gap-1"
            >
              <span className="text-4xl font-bold text-black dark:text-white">
                Custom
              </span>
            </motion.div>
            <Link href="https://x.com/m3k3r1">
              <Button
                className={cn(
                  'group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter',
                  'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2',
                )}
                disabled={false}
              >
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
                <p>Contact</p>
              </Button>
            </Link>

            <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
            <ul className="flex flex-col gap-2 font-normal">
              <li className="flex items-center gap-3 text-xs font-medium text-black dark:text-white">
                <CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-400 p-[2px] text-black dark:text-white" />
                <span className="flex">Custom to your needs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
