"use client"

import { useState } from "react"
import { Button } from "@component/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@component/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@component/components/ui/tabs"
import { Label } from "@component/components/ui/label"
import { useAuth } from "@component/hook/useAuth"
import { useRouter } from "next/navigation"

export default function AuthTabs() {
  const [isSignup, setIsSignup] = useState(false)
  const [activeRole, setActiveRole] = useState<"farmer" | "buyer">("farmer")

  const [formData, setFormData] = useState({
    farmer: { name: "", location: "", email: "", password: "" },
    buyer: { name: "", location: "", email: "", password: "" },
  })

  const useauth = useAuth()
  const router = useRouter()

  const handleChange = (role: "farmer" | "buyer", field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async () => {
    const data = formData[activeRole]

    if (isSignup) {
      // Register user
      if (data.password) {
        await useauth.register({
          name: data.name,
          email: data.email,
          password: data.password,
          location: data.location,
          role: activeRole,
        })
        alert("Account created! Please sign in.")
        setIsSignup(false)
      }
    } else {
      // Login user
      const res = await useauth.login({ email: data.email, password: data.password })
      if (res?.data?.access_token) {
        localStorage.setItem("token", res.data.access_token)
        alert(`Logged in as ${data.email}`)
        window.location.reload()
        router.push("/")
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen flex-col w-full gap-3 px-4">
      <Tabs
        defaultValue="farmer"
        className="w-full max-w-sm sm:max-w-md md:max-w-lg"
        onValueChange={(val) => setActiveRole(val as "farmer" | "buyer")}
      >
        <TabsList className="w-full flex justify-center mb-4">
          <TabsTrigger value="farmer" className="w-1/2">Farmer</TabsTrigger>
          <TabsTrigger value="buyer" className="w-1/2">Buyer</TabsTrigger>
        </TabsList>

        {/* FARMER */}
        <TabsContent value="farmer">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                {isSignup ? "Farmer Sign Up" : "Farmer Sign In"}
              </CardTitle>
              <CardDescription>
                {isSignup
                  ? "Create your farmer account."
                  : "Access your farmer dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isSignup && (
                <>
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <input
                      type="text"
                      value={formData.farmer.name}
                      onChange={(e) =>
                        handleChange("farmer", "name", e.target.value)
                      }
                      placeholder="John Doe"
                      className="border rounded p-2 w-full"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <input
                      type="text"
                      value={formData.farmer.location}
                      onChange={(e) =>
                        handleChange("farmer", "location", e.target.value)
                      }
                      placeholder="e.g. Pune, Maharashtra"
                      className="border rounded p-2 w-full"
                    />
                  </div>
                </>
              )}
              <div className="grid gap-2">
                <Label>Email</Label>
                <input
                  type="email"
                  value={formData.farmer.email}
                  onChange={(e) =>
                    handleChange("farmer", "email", e.target.value)
                  }
                  placeholder="farmer@example.com"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <input
                  type="password"
                  value={formData.farmer.password}
                  onChange={(e) =>
                    handleChange("farmer", "password", e.target.value)
                  }
                  placeholder="••••••••"
                  className="border rounded p-2 w-full"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} className="w-full">
                {isSignup ? "Sign Up" : "Sign In"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* BUYER */}
        <TabsContent value="buyer">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                {isSignup ? "Buyer Sign Up" : "Buyer Sign In"}
              </CardTitle>
              <CardDescription>
                {isSignup
                  ? "Create your buyer account."
                  : "Access your buyer dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isSignup && (
                <>
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <input
                      type="text"
                      value={formData.buyer.name}
                      onChange={(e) =>
                        handleChange("buyer", "name", e.target.value)
                      }
                      placeholder="Jane Smith"
                      className="border rounded p-2 w-full"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <input
                      type="text"
                      value={formData.buyer.location}
                      onChange={(e) =>
                        handleChange("buyer", "location", e.target.value)
                      }
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="border rounded p-2 w-full"
                    />
                  </div>
                </>
              )}
              <div className="grid gap-2">
                <Label>Email</Label>
                <input
                  type="email"
                  value={formData.buyer.email}
                  onChange={(e) =>
                    handleChange("buyer", "email", e.target.value)
                  }
                  placeholder="buyer@example.com"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <input
                  type="password"
                  value={formData.buyer.password}
                  onChange={(e) =>
                    handleChange("buyer", "password", e.target.value)
                  }
                  placeholder="••••••••"
                  className="border rounded p-2 w-full"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} className="w-full">
                {isSignup ? "Sign Up" : "Sign In"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Toggle between SignIn and SignUp */}
        <p className="text-gray-400 text-sm text-center mt-4">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <Button variant="link" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Sign In" : "Sign Up"}
          </Button>
        </p>
      </Tabs>
    </div>
  )
}
