"use client";

import React, { useState } from "react";
import { AuthFlow } from "../types";
import SignInCard from "./SignInCard";
import SignUpCard from "./SignUpCard";

const AuthScreen = () => {
  const [state, setState] = useState<AuthFlow>("signIn");

  return (
    <div className="h-full flex items-center justify-center bg-[#5C3B58]">
      <div className="md:h-auto md:w-[420px]">
        {state === "signIn" ? (
          <SignInCard setState={setState} />
        ) : (
          <SignUpCard setState={setState} />
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
