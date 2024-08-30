import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface AuthenticationMagicLinkTemplateProps {
  authCode: string
}

export function AuthenticationMagicLinkTemplate({
  authCode,
}: AuthenticationMagicLinkTemplateProps) {
  const previewText = `Sign in to Inscribe`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white text-center font-sans">
          <Container className="mx-auto my-[20px] w-[480px] max-w-full rounded border border-solid border-[#ddd] p-[12%_6%]">
            <Text className="text-center text-[18px] font-bold">Inscribe</Text>
            <Heading className="text-center">Your authentication code</Heading>
            <Text className="text-center">
              Enter it in your open browser window or press the sign in button.
              This code will expire in 15 minutes.
            </Text>
            <Section className="my-[16px_auto_14px] w-[280px] max-w-full rounded bg-[rgba(0,0,0,.05)] align-middle">
              <Heading className="m-[0_auto] inline-block w-full py-[8px] text-center tracking-[8px]">
                {authCode}
              </Heading>
            </Section>
            <Text className="m-0 p-[0_40px] text-center tracking-normal text-[#444]">
              Not expecting this email?
            </Text>
            <Text className="m-0 p-[0_40px] text-center tracking-normal text-[#444]">
              Contact{' '}
              <Link
                className="text-[#444] underline"
                href="mailto:support@inscribe.com"
              >
                support@tryinscribe.app
              </Link>{' '}
              if you did not request this code.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
