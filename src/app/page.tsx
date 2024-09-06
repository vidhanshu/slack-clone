"use client";

import { Button } from "@/components/ui/button";
import UserButton from "@/features/auth/components/UserButton";
import { useAuthActions } from "@convex-dev/auth/react";

const Home = () => {
  const { signOut } = useAuthActions();

  return (
    <div>
      <UserButton />
    </div>
  );
};

export default Home;
