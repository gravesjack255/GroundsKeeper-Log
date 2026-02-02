import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, TrendingUp, Camera, Shield, Clock, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-emerald-600 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-slate-900">TurfTrack</span>
          </div>
          <a href="/api/login">
            <Button data-testid="button-login">Sign In</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-tight">
                Keep Your Fleet Running <span className="text-emerald-600">Smoothly</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Professional equipment management for golf courses. Track mowers, carts, and tractors with detailed maintenance logs, photos, and cost analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/api/login">
                  <Button size="lg" className="shadow-lg" data-testid="button-get-started">
                    Get Started Free
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Secure login</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Setup in minutes</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-black/5">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 mx-auto rounded-full bg-emerald-600/10 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Track maintenance costs over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
              Everything You Need to Manage Your Fleet
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From routine maintenance to repair tracking, TurfTrack keeps all your equipment data organized and accessible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-14 w-14 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Wrench className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Equipment Profiles</h3>
                <p className="text-sm text-muted-foreground">
                  Track make, model, year, serial numbers, and current operating hours for every machine.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-14 w-14 mx-auto rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Maintenance Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Keep detailed service records with costs, technician notes, and service dates.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-14 w-14 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <Camera className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Photo Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Upload photos of your equipment directly from your device's photo library.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            Ready to streamline your fleet management?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join golf courses already using TurfTrack to manage their equipment maintenance.
          </p>
          <a href="/api/login">
            <Button size="lg" className="shadow-lg" data-testid="button-cta-signup">
              Start Free Today
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">TurfTrack</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TurfTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
