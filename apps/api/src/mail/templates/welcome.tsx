import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'

interface WelcomeEmailTemplateProps {
  userName: string
}

export function WelcomeEmailTemplate({ userName }: WelcomeEmailTemplateProps) {
  const previewText = `Welcome to Inscribe`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white text-center font-sans">
          <Container className="mx-auto my-[20px] w-[480px] max-w-full rounded border border-solid border-[#ddd] p-[12%_6%]">
            <Text className="text-center text-[18px] font-bold">
              Welcome to Inscribe, {userName}!
            </Text>
            <Heading className="text-center">
              Unlock the Full Potential of Your Data with Our Magic Editor
            </Heading>
            <Text className="text-center">
              We’re thrilled to have you join us at Inscribe. With our powerful
              Magic Editor, you can unlock the full potential of your data and
              boost your productivity by tenfold. Our AI copilot is here to help
              you achieve more in less time.
            </Text>

            <Text className="m-0 p-[0_40px] text-center tracking-normal text-[#444]">
              If you have any questions or need assistance, our support team is
              always ready to help.
            </Text>
            <Text className="m-0 p-[0_40px] text-center tracking-normal text-[#444]">
              Feel free to reach out to us at{' '}
              <Link
                className="text-[#444] underline"
                href="mailto:support@tryinscribe.app"
              >
                support@tryinscribe.app
              </Link>
              . We’re excited to see what you’ll create with Inscribe!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
