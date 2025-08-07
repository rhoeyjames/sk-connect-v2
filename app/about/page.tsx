import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Heart, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Maria Santos",
      role: "SK Chairperson",
      barangay: "San Antonio",
      image: "/placeholder.svg?height=150&width=150&text=Maria+Santos",
      description: "Leading community development initiatives for 3 years",
    },
    {
      name: "Juan Dela Cruz",
      role: "SK Secretary",
      barangay: "San Antonio",
      image: "/placeholder.svg?height=150&width=150&text=Juan+Dela+Cruz",
      description: "Passionate about youth empowerment and education",
    },
    {
      name: "Ana Rodriguez",
      role: "SK Treasurer",
      barangay: "San Antonio",
      image: "/placeholder.svg?height=150&width=150&text=Ana+Rodriguez",
      description: "Managing community funds and project budgets",
    },
  ]

  const achievements = [
    {
      title: "1,234 Active Youth Members",
      description: "Registered and participating in community activities",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "89 Projects Completed",
      description: "Community development and youth programs implemented",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "456 Lives Impacted",
      description: "Youth and families benefited from our programs",
      icon: Heart,
      color: "text-red-600",
    },
    {
      title: "12 Awards Received",
      description: "Recognition for outstanding community service",
      icon: Award,
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">SKConnect</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering Filipino youth through technology, community engagement, and collaborative leadership
              development programs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Target className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To create a digital platform that connects Filipino youth with their local Sangguniang Kabataan,
                  fostering active participation in community development, leadership training, and civic engagement
                  through innovative technology solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  A Philippines where every young Filipino is empowered, engaged, and equipped with the tools and
                  opportunities to lead positive change in their communities, creating a brighter future for all.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-10 h-10 mb-4 text-blue-600" />
                <CardTitle>Community Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect youth with local SK initiatives, events, and community projects to foster active participation
                  and civic responsibility.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-10 h-10 mb-4 text-green-600" />
                <CardTitle>Leadership Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Provide workshops, training programs, and mentorship opportunities to develop the next generation of
                  community leaders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="w-10 h-10 mb-4 text-red-600" />
                <CardTitle>Project Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enable youth to propose, vote on, and collaborate on community development projects that address local
                  needs and challenges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <achievement.icon className={`w-12 h-12 mx-auto mb-4 ${achievement.color}`} />
                  <div className="text-2xl font-bold text-gray-900 mb-2">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mb-2">
                      {member.role}
                    </Badge>
                    <div className="text-sm text-gray-600">{member.barangay}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of the change you want to see in your community. Connect with fellow youth, participate in
            meaningful projects, and develop your leadership skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/register">Get Started Today</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
