import { useState } from "react";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gradient-custom flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CookSmart</h1>
          <p className="text-gray-600">Your smart cooking companion</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <LoginForm 
              onSwitchToRegister={() => setActiveTab("register")}
            />
          </TabsContent>
          
          <TabsContent value="register" className="mt-6">
            <RegisterForm 
              onSwitchToLogin={() => setActiveTab("login")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}