import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Twitter, Sun, Search } from 'lucide-react';

const DocsLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container flex items-center justify-between h-14">
          {/* Left section */}
          <div className="flex items-center gap-6">
            <a href="#" className="font-semibold flex items-center gap-2">
              <div className="font-bold">Sample UI</div>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium">Docs</a>
              <a href="#" className="text-sm font-medium">Components</a>
              <a href="#" className="text-sm font-medium">Themes</a>
              <a href="#" className="text-sm font-medium">Examples</a>
              <a href="#" className="text-sm font-medium">Github</a>
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documentation..."
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr_220px] md:gap-6 lg:grid-cols-[240px_1fr_240px] lg:gap-10">
        {/* Left Sidebar */}
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <div className="space-y-4">
              <div className="font-medium">Getting Started</div>
              <nav className="flex flex-col space-y-2">
                <a href="#" className="text-sm">Introduction</a>
                <a href="#" className="text-sm">Installation</a>
                <a href="#" className="text-sm">Typography</a>
                <a href="#" className="text-sm">Theming</a>
                <a href="#" className="text-sm">CLI</a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <>
          <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid">
            <div className="mx-auto w-full min-w-0">
              <div className="mb-4">
                <h1 className="text-3xl font-bold">Simple</h1>
              </div>
              
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Style:</span>
                      <Select defaultValue="new-york">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new-york">New York</SelectItem>
                          <SelectItem value="default">Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-center pt-4">
                      <Button variant="outline" className="w-32">
                        Show Toast
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </main>

          {/* Right Sidebar */}
          <div className="hidden text-sm xl:block">
            <div className="sticky top-16 -mt-10 pt-16">
              <div className="space-y-4">
                <p className="font-medium">On This Page</p>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Installation</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Usage</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Examples</a></li>
                  <li className="ml-4"><a href="#" className="text-muted-foreground hover:text-foreground">Simple</a></li>
                  <li className="ml-4"><a href="#" className="text-muted-foreground hover:text-foreground">With title</a></li>
                  <li className="ml-4"><a href="#" className="text-muted-foreground hover:text-foreground">With Action</a></li>
                </ul>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default DocsLayout;