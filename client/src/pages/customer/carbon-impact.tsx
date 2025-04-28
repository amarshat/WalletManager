import CustomerLayout from "@/components/layouts/CustomerLayout";
import { CarbonImpactSummary } from "@/components/wallet/CarbonImpactSummary";
import { CarbonImpactChart } from "@/components/wallet/CarbonImpactChart";
import { useCarbon } from "@/hooks/use-carbon";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CarbonImpactPage() {
  const { 
    impacts, 
    offsets, 
    summary, 
    isLoading, 
    preferences, 
    updatePreferencesMutation 
  } = useCarbon();
  
  // Format a number as kg of CO2
  const formatCO2 = (amount: number) => {
    if (amount < 1) {
      return `${(amount * 1000).toFixed(0)}g CO₂`;
    }
    return `${amount.toFixed(2)}kg CO₂`;
  };
  
  // Format date strings
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleToggleTracking = () => {
    if (preferences) {
      updatePreferencesMutation.mutate({
        trackingEnabled: !preferences.trackingEnabled
      });
    }
  };
  
  // If carbon tracking isn't enabled yet, show onboarding view
  if (!preferences?.trackingEnabled) {
    return (
      <CustomerLayout>
        <div className="container max-w-5xl py-8">
          <div className="flex items-center mb-6">
            <Leaf className="h-6 w-6 text-green-500 mr-2" />
            <h1 className="text-2xl font-bold">Carbon Impact</h1>
          </div>
          
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="text-center space-y-4 py-10">
                <Leaf className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold">Track Your Carbon Footprint</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enable carbon impact tracking to understand the environmental impact of your financial activities and take action to reduce it.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleToggleTracking}
                  className="mt-4"
                >
                  Enable Carbon Tracking
                </Button>
              </div>
            </Card>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Understand Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Every financial transaction has an environmental footprint. We'll help you understand yours.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor your carbon footprint over time and see improvements as you make eco-friendly choices.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Offset & Reduce</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Contribute to carbon offset projects and get tips to reduce your environmental impact.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }
  
  return (
    <CustomerLayout>
      <div className="container max-w-5xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Leaf className="h-6 w-6 text-green-500 mr-2" />
            <h1 className="text-2xl font-bold">Carbon Impact</h1>
          </div>
          
          {summary && (
            <Button variant="outline" size="sm" onClick={handleToggleTracking}>
              {preferences?.trackingEnabled ? "Disable Tracking" : "Enable Tracking"}
            </Button>
          )}
        </div>
        
        <div className="grid gap-6">
          {/* Summary Cards Row */}
          {summary && (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    <ArrowUpRight className="text-red-500 h-5 w-5 mr-1" />
                    {formatCO2(summary.totalImpact)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Offset
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    <ArrowDownRight className="text-green-500 h-5 w-5 mr-1" />
                    {formatCO2(summary.totalOffset)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary.netImpact > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCO2(summary.netImpact)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCO2(summary.monthlyAverage)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <CarbonImpactChart />
            <CarbonImpactSummary />
          </div>
          
          {/* Activity Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Impact History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Carbon Impact History</CardTitle>
                <CardDescription>Recent transactions and their carbon footprint</CardDescription>
              </CardHeader>
              <CardContent>
                {impacts && impacts.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Impact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {impacts.map((impact) => (
                          <TableRow key={impact.id}>
                            <TableCell className="font-medium">
                              {formatDate(impact.transactionDate)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{impact.description}</span>
                                <span className="text-xs text-muted-foreground">
                                  {impact.category}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">
                                {formatCO2(Number(impact.carbonFootprint))}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No carbon impact data recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Offset History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Carbon Offset History</CardTitle>
                <CardDescription>Your contributions to carbon offset projects</CardDescription>
              </CardHeader>
              <CardContent>
                {offsets && offsets.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Offset</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offsets.map((offset) => (
                          <TableRow key={offset.id}>
                            <TableCell className="font-medium">
                              {formatDate(offset.contributionDate)}
                            </TableCell>
                            <TableCell>{offset.description}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="bg-green-50">
                                {formatCO2(Number(offset.offsetAmount))}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No carbon offset contributions yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How Carbon Impact is Calculated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We estimate the carbon footprint of your transactions based on the category and amount. 
                Different types of purchases have different environmental impacts based on industry averages.
                For example, transportation and travel typically have higher carbon footprints than digital services.
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                Carbon offsets fund projects that reduce greenhouse gas emissions, such as renewable energy,
                reforestation, and methane capture. These projects are verified by third-party standards to
                ensure they deliver the promised climate benefits.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}