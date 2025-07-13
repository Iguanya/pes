import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Trophy, Users, DollarSign, Star, Shield } from "lucide-react"
import Link from "next/link"
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
  const features = [
    {
      icon: Trophy,
      title: "Professional Tournaments",
      description: "Compete in organized tournaments with brackets, schedules, and live updates.",
    },
    {
      icon: DollarSign,
      title: "Real Cash Prizes",
      description: "Win actual money through secure mobile money transactions.",
    },
    {
      icon: Shield,
      title: "Fair Play System",
      description: "Advanced result verification with screenshot upload and dispute resolution.",
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join thousands of players in Kenya's most competitive PES community.",
    },
  ]

  const testimonials = [
    {
      name: "John Kamau",
      role: "Pro Player",
      content: "I've won over KSh 50,000 in tournaments. This platform is legit and payments are instant!",
      rating: 5,
    },
    {
      name: "Mary Wanjiku",
      role: "Tournament Organizer",
      content: "Managing tournaments has never been easier. The automated systems handle everything perfectly.",
      rating: 5,
    },
    {
      name: "David Ochieng",
      role: "Casual Player",
      content: "Great way to earn some extra cash while doing what I love - playing PES!",
      rating: 5,
    },
  ]

  const stats = [
    { label: "Active Players", value: "5,000+" },
    { label: "Tournaments Held", value: "500+" },
    { label: "Prize Money Paid", value: "KSh 2M+" },
    { label: "Success Rate", value: "99.9%" },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            🎮 Kenya's #1 PES Tournament Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Compete. Win.
            <span className="text-primary block">Earn Real Money.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join Kenya's most competitive eFootball tournaments. Play against the best, climb the leaderboards, and win
            cash prizes through secure mobile money payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start Competing Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tournaments">Browse Tournaments</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PES Kenya?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the most advanced tournament platform in East Africa, designed specifically for Kenyan gamers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & Verify</h3>
              <p className="text-gray-600">
                Create your account, verify your phone number, and set up your gamer profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Tournaments</h3>
              <p className="text-gray-600">
                Browse active tournaments, pay entry fees via mobile money, and get matched with opponents.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Play & Win</h3>
              <p className="text-gray-600">
                Compete in matches, submit results with screenshots, and receive instant payouts for wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Players Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied gamers across Kenya</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">"{testimonial.content}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Winning?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join Kenya's most competitive PES community today. Create your account and start earning money from your
            gaming skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link href="/tournaments">View Active Tournaments</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
