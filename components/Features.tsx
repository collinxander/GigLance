import { Briefcase, Star, Users, Zap } from 'lucide-react'

const features = [
  {
    name: 'Smart Matchmaking',
    description: 'AI-powered matching between users and gigs based on skills, availability, and location.',
    icon: Zap,
  },
  {
    name: 'Portfolio Showcase',
    description: 'Upload your work, showcase your skills, and build your professional reputation.',
    icon: Star,
  },
  {
    name: 'Flexible Opportunities',
    description: 'Find gigs that fit your schedule, whether you want short-term or ongoing work.',
    icon: Briefcase,
  },
  {
    name: 'Community Building',
    description: 'Connect with other creatives, share experiences, and grow your network.',
    icon: Users,
  },
]

export default function Features() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Turn Your Skills Into Income
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            GigLance provides everything you need to find, secure, and complete freelance work.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
} 