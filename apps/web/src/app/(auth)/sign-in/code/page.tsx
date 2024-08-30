import { OtpInput } from '@/components/otp-input'

export default function OtpPage() {
  return (
    <div className="p-8">
      <div className="flex w-[350px] flex-col justify-center gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Enter your code
          </h1>
          <p className="text-small text-muted-foreground">
            We sent a code to your email
          </p>
        </div>

        <OtpInput />
      </div>
    </div>
  )
}
