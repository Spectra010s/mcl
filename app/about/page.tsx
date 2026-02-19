import type React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Users, Globe, Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">About My Campus Library</h1>
          <p className="text-lg text-white/90">
            My Campus Library is dedicated to providing equitable access to academic resources for
            all students and people. We believe that knowledge should be freely accessible and
            organized in ways that support academic excellence.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Mission */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              <span className="block text-lg font-medium text-primary mb-2">
                &quot;Empowering Students with Knowledge&quot;
              </span>
              We are on a mission to break down educational barriers and create a world where every
              student has the tools they need to succeed. Our goal is to transform the way knowledge
              is shared and accessed, making quality education a right, not a privilege.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Through our innovative platform, we bring together a vast collection of academic
              resources, from textbooks and research papers to interactive study materials, making
              it easy for students to discover and access the resources they need.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;re creating a dynamic learning ecosystem that supports students at every step
              of their educational journey. We are not just building a library; we&apos;re nurturing
              a global community of passionate learners and educators united by the pursuit of
              knowledge.
            </p>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We envision a world where every student, regardless of their background or location,
              has seamless access to high-quality educational resources. Our platform aims to break
              down barriers to education by creating a global community of learners and educators
              who share knowledge freely and collaboratively.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                To become the most comprehensive and accessible academic resource hub for students
                worldwide
              </li>
              <li>To foster a culture of open knowledge sharing and collaborative learning</li>
              <li>
                To leverage technology in making education more engaging, interactive, and effective
              </li>
              <li>
                To support lifelong learning by providing resources for continuous skill development
              </li>
              <li>
                To bridge the educational divide through innovative solutions and community-driven
                content
              </li>
            </ul>

            <div className="pt-4 mt-4 border-t border-primary/10">
              <h3 className="text-lg font-semibold text-primary mb-3">How You Can Help</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-foreground/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Share Resources</h4>
                  <p className="text-sm text-muted-foreground">
                    Contribute textbooks, notes, or study materials to help other students
                  </p>
                </div>
                <div className="bg-foreground/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Provide Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by sharing your suggestions and reporting issues
                  </p>
                </div>
                <div className="bg-foreground/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Spread the Word</h4>
                  <p className="text-sm text-muted-foreground">
                    Tell your friends and classmates about My Campus Library
                  </p>
                </div>
                <div className="bg-foreground/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Join Our Community</h4>
                  <p className="text-sm text-muted-foreground">
                    Participate in discussions and help answer questions from other students
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <h2 className="text-2xl font-bold text-primary mb-6">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-primary" />}
            title="Comprehensive Library"
            description="Access thousands of academic resources curated for different departments and academic levels"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-primary" />}
            title="Community Driven"
            description="Students and users contribute resources, and reviews to build a collaborative knowledge base"
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8 text-primary" />}
            title="Easy Discovery"
            description="Advanced search, filtering by department and academic level, and personalized recommendations"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-primary" />}
            title="Secure & Reliable"
            description="Secure authentication and reliable storage for all resources"
          />
        </div>

        {/* Getting Started */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              New to My Campus Library? Here&apos;s how to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Create an Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign up with your email to access the full library
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Browse or Search</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore resources by department or use full-text search to find what you need
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Download & Learn</h4>
                  <p className="text-sm text-muted-foreground">
                    Download resources, add bookmarks materials to help others
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meet the Creator */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Founding Team</h2>
          <div className="grid md:grid-cols-1 gap-6">
            <CreatorCard
              name="Adetayo Adeloye"
              role="Lead Developer & Project Architect"
              bio="Passionate about creating accessible educational technology that bridges the gap between students and academic resources. My Campus Library was born from the vision of making quality education accessible to all students, regardless of their background or location."
              imageSrc="/spectra010s.jpg"
              socials={[
                { icon: <Github className="w-5 h-5" />, url: 'https://github.com/Spectra010s' },
                {
                  icon: <Twitter className="w-5 h-5" />,
                  url: 'https://x.com/Spectra010s',
                },
                {
                  icon: <Linkedin className="w-5 h-5" />,
                  url: 'https://linkedin.com/in/adeloye-adetayo-273723253',
                },
                {
                  icon: <Mail className="w-5 h-5" />,
                  url: 'mailto:spectra010s@gmail.com',
                },
              ]}
            />
            <CreatorCard
              name="Martins Wonuade"
              role="Project Co-Initiator & Concept Contributor"
              bio="Initiator of the My Campus Library idea, contributing to the early vision of building a centralized academic resource hub for students. Passionate about technology-driven solutions that simplify access to knowledge and empower collaborative learning within campus communities."
              imageSrc="/martins.jpg"
              socials={[
                { icon: <Github className="w-5 h-5" />, url: 'https://github.com/Mkay404' },
                {
                  icon: <Linkedin className="w-5 h-5" />,
                  url: '',
                },
                {
                  icon: <Mail className="w-5 h-5" />,
                  url: 'mailto:wonuadeomartins@gmail.com',
                },
              ]}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/signup">
            <Button className="bg-primary hover:bg-secondary text-white px-8 py-2 text-lg">
              Join My Campus Library Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-primary/20 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function CreatorCard({
  name,
  role,
  bio,
  socials,
  imageSrc,
}: {
  name: string
  role: string
  bio: string
  imageSrc: string
  socials: Array<{
    icon: React.ReactNode
    url: string
  }>
}) {
  return (
    <Card className="border-primary/20 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 overflow-hidden">
            <Image
              src={imageSrc}
              alt={name}
              width={64}
              height={64}
              className="object-cover rounded-full"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{bio}</p>
        <div className="flex gap-3">
          {socials.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
