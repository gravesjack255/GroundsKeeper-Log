import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wrench, 
  TrendingUp, 
  Clock, 
  FileText, 
  ShoppingCart, 
  CheckCircle2,
  DollarSign,
  BarChart3,
  Shield,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">TurfTrack</span>
          </div>
          <a href="/api/login">
            <Button data-testid="button-login">Sign In</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>Built for Golf Course Superintendents</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Track Every Hour. Log Every Service. Know Every Cost.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stop losing money on equipment surprises. TurfTrack gives you complete visibility into your fleet's maintenance history, operating hours, and total cost of ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="/api/login">
              <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-get-started">
                Start Tracking Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Free to use</div>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">2 min</div>
              <div className="text-sm text-muted-foreground">Setup time</div>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">Unlimited</div>
              <div className="text-sm text-muted-foreground">Equipment</div>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">Secure</div>
              <div className="text-sm text-muted-foreground">Cloud backup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Sound Familiar?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most superintendents track equipment maintenance on paper, spreadsheets, or not at all.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-card border">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-semibold mb-2">Scattered Records</h3>
              <p className="text-sm text-muted-foreground">
                Service records in filing cabinets, hour logs on clipboards, costs buried in invoices.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="text-4xl mb-3">❓</div>
              <h3 className="font-semibold mb-2">Unknown Costs</h3>
              <p className="text-sm text-muted-foreground">
                No quick answer when the board asks "What did we spend on mower maintenance last year?"
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="text-4xl mb-3">💸</div>
              <h3 className="font-semibold mb-2">Selling Blind</h3>
              <p className="text-sm text-muted-foreground">
                When it's time to sell equipment, you can't prove the maintenance history to buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              One Place for Your Entire Fleet
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track mowers, carts, tractors, and utility vehicles. Every service, every cost, every hour—organized and accessible.
            </p>
          </div>
          
          {/* Feature 1 - Hours Tracking */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <Clock className="h-5 w-5" />
                <span>Hour Tracking</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Log Operating Hours for Every Machine
              </h3>
              <p className="text-muted-foreground mb-6">
                Record current hours when logging maintenance. See at a glance which equipment is due for service based on hour intervals—not guesswork.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Track hours at each service</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Calculate cost per operating hour</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Compare efficiency across your fleet</span>
                </li>
              </ul>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Toro Greensmaster 3250-D</div>
                  <div className="text-sm text-muted-foreground">Current: 2,847 hours</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Last service</span>
                  <span>2,800 hours</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Service interval</span>
                  <span>100 hours</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Next service due</span>
                  <span className="text-primary font-medium">2,900 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Cost Tracking */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24">
            <div className="order-2 md:order-1 bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Maintenance Costs</span>
                <span className="text-sm text-muted-foreground">Year to Date</span>
              </div>
              <div className="text-3xl font-bold text-primary mb-4">$24,850</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Greens Mowers</span>
                    <span>$8,200</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '33%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fairway Mowers</span>
                    <span>$12,400</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Utility Vehicles</span>
                    <span>$4,250</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '17%' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <DollarSign className="h-5 w-5" />
                <span>Cost Analytics</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                See Exactly Where Your Money Goes
              </h3>
              <p className="text-muted-foreground mb-6">
                Every maintenance log includes cost. TurfTrack automatically calculates totals by equipment, category, and time period—so you can answer budget questions instantly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Monthly and yearly cost summaries</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Cost breakdown by equipment type</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Visual charts for board presentations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 - Maintenance Logs */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <FileText className="h-5 w-5" />
                <span>Maintenance Logs</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Complete Service History at Your Fingertips
              </h3>
              <p className="text-muted-foreground mb-6">
                Log oil changes, blade sharpening, repairs, and any service. Add notes, costs, and the technician who did the work. Never lose a record again.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Categorize by service type</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Add detailed technician notes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Searchable history for every machine</span>
                </li>
              </ul>
            </div>
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <span className="font-semibold">Recent Maintenance</span>
              </div>
              <div className="divide-y">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Hydraulic Filter Replacement</span>
                    <span className="text-sm text-muted-foreground">$245</span>
                  </div>
                  <div className="text-sm text-muted-foreground">John Deere 7500A · Jan 15, 2026</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Blade Sharpening</span>
                    <span className="text-sm text-muted-foreground">$85</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Toro Greensmaster · Jan 12, 2026</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Annual Service</span>
                    <span className="text-sm text-muted-foreground">$1,200</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Jacobsen LF570 · Jan 8, 2026</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 - Marketplace */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1 bg-card rounded-xl border overflow-hidden">
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <span className="font-semibold">Equipment Marketplace</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  <Shield className="h-3 w-3" />
                  Verified History
                </span>
              </div>
              <div className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Wrench className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">2019 Toro Workman GTX</div>
                    <div className="text-lg font-bold text-primary">$8,500</div>
                    <div className="text-sm text-muted-foreground">1,247 hours · Phoenix, AZ</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Certified Maintenance History
                  </div>
                  <div className="text-xs text-muted-foreground">
                    47 service records · $3,842 total maintenance · All oil changes on schedule
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <ShoppingCart className="h-5 w-5" />
                <span>Equipment Marketplace</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Sell Equipment with Certified Maintenance Records
              </h3>
              <p className="text-muted-foreground mb-6">
                When you list equipment for sale, buyers see the complete service history you've logged. Well-maintained machines sell faster and for better prices.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Buyers see verified service records</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Distance-based search finds local buyers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">Built-in messaging with interested buyers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-muted-foreground">
              No training required. If you can fill out a form, you can use TurfTrack.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Add Your Equipment</h3>
              <p className="text-sm text-muted-foreground">
                Enter your mowers, carts, and vehicles. Add a photo, model info, and current hours.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Log Maintenance</h3>
              <p className="text-sm text-muted-foreground">
                When you service a machine, log it. Takes 30 seconds. Add cost and notes.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">See the Big Picture</h3>
              <p className="text-sm text-muted-foreground">
                Your dashboard shows fleet status, costs, and which machines need attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Take Control of Your Fleet?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join superintendents who've switched from spreadsheets and filing cabinets to TurfTrack. Setup takes 2 minutes. It's free.
          </p>
          <a href="/api/login">
            <Button size="lg" className="gap-2" data-testid="button-cta-signup">
              Start Tracking Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">TurfTrack</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TurfTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
