"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

const Home = () => {
  const { signOut } = useAuthActions();
  return (
    <div>
      Home Page Protected
      <Button onClick={signOut}>Sign out</Button>
    </div>
  );
};

export default Home;
