import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ViewBoard() {
    const navigate = useNavigate();
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Hello user</h1>
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Shareholder/Director Registration</CardTitle>
          <CardDescription>Important information about your role</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have been allotted as a shareholder/director. Please register your details to proceed.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full"  onClick={() => navigate('/registrationForm')}>
            Click here to register your details
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

