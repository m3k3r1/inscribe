import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface AuthenticationMagicLinkTemplateProps {
  userEmail: string
  authLink: string
}

export function AuthenticationMagicLinkTemplate({
  userEmail,
  authLink,
}: AuthenticationMagicLinkTemplateProps) {
  const previewText = `Login to Inscribe`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px] text-center">
              <span className="text-2xl"></span>
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Your magic link
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              You requested this login for Inscribe with {userEmail}.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#102C24] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={authLink}
              >
                Click here to log in
              </Button>
            </Section>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you didn't request this, please ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
