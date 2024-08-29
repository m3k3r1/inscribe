import type { Step, Tour } from 'onborda/dist/types'

const steps: Step[] = [
  {
    icon: <>👋</>,
    title: 'Welcome to Inscribe!',
    content: <>Welcome to Onborda, an onboarding flow for Next.js!</>,
    selector: '#onborda-step1',
    side: 'bottom',
    showControls: true,
    pointerPadding: -1,
    pointerRadius: 24,
  },
  {
    icon: <>👋</>,
    title: 'Lets create your organization',
    content: <>Welcome to Onborda, an onboarding flow for Next.js!</>,
    selector: '#onborda-step2',
    side: 'left',
    showControls: true,
    // pointerWidth: 24,
    pointerRadius: 24,
  },
  {
    icon: <>👋</>,
    title: 'Create your organization',
    content: <>Welcome to Onborda, an onboarding flow for Next.js!</>,
    selector: '#onborda-step3',
    side: 'left',
    showControls: true,
    // pointerWidth: 24,
    pointerRadius: 24,
  },
]

export const tours: Tour[] = [
  {
    tour: 'firsttour',
    steps,
  },
]
